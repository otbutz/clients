import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, shareReplay } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  CardComponent,
  FormFieldModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  IconButtonModule,
  BadgeModule,
  ColorPasswordModule,
} from "@bitwarden/components";

import { BitTotpCountdownComponent } from "../../components/totp-countdown/totp-countdown.component";

type TotpCodeValues = {
  totpCode: string;
  totpCodeFormatted?: string;
};

@Component({
  selector: "app-login-credentials-view",
  templateUrl: "login-credentials-view.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
    IconButtonModule,
    BadgeModule,
    ColorPasswordModule,
    BitTotpCountdownComponent,
  ],
})
export class LoginCredentialsViewComponent {
  @Input() cipher: CipherView;

  isPremium$: Observable<boolean> =
    this.billingAccountProfileStateService.hasPremiumFromAnySource$.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  showPasswordCount: boolean = false;
  passwordRevealed: boolean = false;
  totpCodeCopyObj: TotpCodeValues;
  private datePipe = inject(DatePipe);

  constructor(
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private router: Router,
    private i18nService: I18nService,
    protected messagingService: MessagingService,
  ) {}

  get fido2CredentialCreationDateValue(): string {
    const dateCreated = this.i18nService.t("dateCreated");
    const creationDate = this.datePipe.transform(
      this.cipher.login.fido2Credentials[0]?.creationDate,
      "short",
    );
    return `${dateCreated} ${creationDate}`;
  }

  async getPremium() {
    /**
     * Use the messaging service to trigger the upgrade organization dialog in the web vault.
     */
    this.messagingService.send("upgradeOrganization", {
      organizationId: this.cipher.organizationId,
    });

    /**
     * Use the router to trigger the upgrade organization overlay in the browser extension.
     */
    await this.router.navigate(["/premium"]);
  }

  pwToggleValue(evt: boolean) {
    this.passwordRevealed = evt;
  }

  togglePasswordCount() {
    this.showPasswordCount = !this.showPasswordCount;
  }

  setTotpCopyCode(e: TotpCodeValues) {
    this.totpCodeCopyObj = e;
  }
}
