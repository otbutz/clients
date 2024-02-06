import { Component, OnInit } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { ReportsApiServiceAbstraction } from "@bitwarden/common/tools/reports/reports-api.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { PasswordRepromptService } from "@bitwarden/vault";

import { CipherReportComponent } from "./cipher-report.component";

@Component({
  selector: "app-inactive-two-factor-report",
  templateUrl: "inactive-two-factor-report.component.html",
})
export class InactiveTwoFactorReportComponent extends CipherReportComponent implements OnInit {
  services = new Map<string, string>();
  cipherDocs = new Map<string, string>();
  disabled = true;

  constructor(
    protected cipherService: CipherService,
    protected organizationService: OrganizationService,
    protected configService: ConfigServiceAbstraction,
    modalService: ModalService,
    private logService: LogService,
    passwordRepromptService: PasswordRepromptService,
    private reportsApiService: ReportsApiServiceAbstraction,
  ) {
    super(modalService, passwordRepromptService, organizationService);
  }

  async ngOnInit() {
    await super.load();
  }

  async setCiphers() {
    try {
      await this.load2fa();
    } catch (e) {
      this.logService.error(e);
    }

    if (this.services.size > 0) {
      const allCiphers = await this.getAllCiphers();
      const inactive2faCiphers: CipherView[] = [];
      const docs = new Map<string, string>();

      allCiphers.forEach((ciph) => {
        const { type, login, isDeleted, edit, id, viewPassword } = ciph;
        if (
          type !== CipherType.Login ||
          (login.totp != null && login.totp !== "") ||
          !login.hasUris ||
          isDeleted ||
          (!this.organization && !edit) ||
          !viewPassword
        ) {
          return;
        }
        for (let i = 0; i < login.uris.length; i++) {
          const u = login.uris[i];
          if (u.uri != null && u.uri !== "") {
            const uri = u.uri.replace("www.", "");
            const domain = Utils.getDomain(uri);
            if (domain != null && this.services.has(domain)) {
              if (this.services.get(domain) != null) {
                docs.set(id, this.services.get(domain));
              }
              // If the uri is in the 2fa list. Add the cipher to the inactive
              // collection. No need to check any additional uris for the cipher.
              inactive2faCiphers.push(ciph);
              return;
            }
          }
        }
      });
      this.ciphers = [...inactive2faCiphers];
      this.cipherDocs = docs;
    }
  }

  protected getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllDecrypted();
  }

  private async load2fa() {
    if (this.services.size > 0) {
      return;
    }

    if (
      await this.configService.getFeatureFlag<boolean>(FeatureFlag.MigrateTwoFactorDirectory, false)
    ) {
      try {
        const response = await this.reportsApiService.getInactiveTwoFactor();
        this.services = response.services;
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      const response = await fetch(new Request("https://api.2fa.directory/v3/totp.json"));
      if (response.status !== 200) {
        throw new Error();
      }
      const responseJson = await response.json();
      for (const service of responseJson) {
        const serviceData = service[1];
        if (serviceData.domain == null) {
          continue;
        }
        if (serviceData.documentation == null) {
          continue;
        }
        if (serviceData["additional-domains"] != null) {
          for (const additionalDomain of serviceData["additional-domains"]) {
            this.services.set(additionalDomain, serviceData.documentation);
          }
        }
        this.services.set(serviceData.domain, serviceData.documentation);
      }
    }
  }
}
