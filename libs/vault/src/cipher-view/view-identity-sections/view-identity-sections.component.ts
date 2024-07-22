import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  CardComponent,
  FormFieldModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-view-identity-sections",
  templateUrl: "./view-identity-sections.component.html",
  imports: [
    NgIf,
    JslibModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
  ],
})
export class ViewIdentitySectionsComponent {
  @Input() cipher: CipherView;

  /** Returns true when any of the "personal detail" attributes are populated */
  hasPersonalDetails(): boolean {
    const { username, company, fullName } = this.cipher.identity;
    return Boolean(fullName || username || company);
  }

  /** Returns true when any of the "identification detail" attributes are populated */
  hasIdentificationDetails(): boolean {
    const { ssn, passportNumber, licenseNumber } = this.cipher.identity;
    return Boolean(ssn || passportNumber || licenseNumber);
  }
}
