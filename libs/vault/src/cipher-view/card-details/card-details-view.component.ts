import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  CardComponent,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  FormFieldModule,
  IconButtonModule,
} from "@bitwarden/components";

@Component({
  selector: "app-card-details-view",
  templateUrl: "card-details-view.component.html",
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
  ],
})
export class CardDetailsComponent {
  @Input() cipher: CipherView;

  constructor(
    private i18nService: I18nService,
    private eventCollectionService: EventCollectionService,
  ) {}

  get card() {
    return this.cipher.card;
  }

  get setSectionTitle() {
    if (this.card.brand && this.card.brand !== "Other") {
      return this.i18nService.t("cardBrandDetails", this.card.brand);
    }
    return this.i18nService.t("cardDetails");
  }

  async logCardCodeVisibleEvent(hiddenFieldVisible: boolean) {
    if (hiddenFieldVisible) {
      await this.eventCollectionService.collect(
        EventType.Cipher_ClientToggledCardCodeVisible,
        this.cipher.id,
        false,
        this.cipher.organizationId,
      );
    }
  }
}
