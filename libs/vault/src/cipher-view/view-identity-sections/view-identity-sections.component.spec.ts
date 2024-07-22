import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { IdentityView } from "@bitwarden/common/vault/models/view/identity.view";
import { SectionHeaderComponent } from "@bitwarden/components";

import { BitInputDirective } from "../../../../components/src/input/input.directive";

import { ViewIdentitySectionsComponent } from "./view-identity-sections.component";

describe("ViewIdentitySectionsComponent", () => {
  let component: ViewIdentitySectionsComponent;
  let fixture: ComponentFixture<ViewIdentitySectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIdentitySectionsComponent],
      providers: [{ provide: I18nService, useValue: { t: (key: string) => key } }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewIdentitySectionsComponent);
    component = fixture.componentInstance;
    component.cipher = { identity: new IdentityView() } as CipherView;
    fixture.detectChanges();
  });

  describe("personal details", () => {
    it("dynamically shows the section", () => {
      let personalDetailSection = fixture.debugElement.query(By.directive(SectionHeaderComponent));

      expect(personalDetailSection).toBeNull();

      component.cipher = {
        identity: {
          fullName: "Mr Ron Burgundy",
        },
      } as CipherView;

      fixture.detectChanges();

      personalDetailSection = fixture.debugElement.query(By.directive(SectionHeaderComponent));

      expect(personalDetailSection).not.toBeNull();
      expect(personalDetailSection.nativeElement.textContent).toBe("personalDetails");
    });

    it("populates personal detail fields", () => {
      component.cipher = {
        identity: {
          fullName: "Mr Ron Burgundy",
          company: "Channel 4 News",
          username: "ron.burgundy",
        },
      } as CipherView;

      fixture.detectChanges();

      const fields = fixture.debugElement.queryAll(By.directive(BitInputDirective));

      expect(fields[0].nativeElement.value).toBe("Mr Ron Burgundy");
      expect(fields[1].nativeElement.value).toBe("ron.burgundy");
      expect(fields[2].nativeElement.value).toBe("Channel 4 News");
    });
  });

  describe("identification details", () => {
    it("dynamically shows the section", () => {
      let identificationDetailSection = fixture.debugElement.query(
        By.directive(SectionHeaderComponent),
      );

      expect(identificationDetailSection).toBeNull();

      component.cipher = {
        identity: {
          ssn: "123-45-6789",
        },
      } as CipherView;

      fixture.detectChanges();

      identificationDetailSection = fixture.debugElement.query(
        By.directive(SectionHeaderComponent),
      );

      expect(identificationDetailSection).not.toBeNull();
      expect(identificationDetailSection.nativeElement.textContent).toBe("identification");
    });

    it("populates identification detail fields", () => {
      component.cipher = {
        identity: {
          ssn: "123-45-6789",
          passportNumber: "998-765-4321",
          licenseNumber: "404-HTTP",
        },
      } as CipherView;

      fixture.detectChanges();

      const fields = fixture.debugElement.queryAll(By.directive(BitInputDirective));

      expect(fields[0].nativeElement.value).toBe("123-45-6789");
      expect(fields[1].nativeElement.value).toBe("998-765-4321");
      expect(fields[2].nativeElement.value).toBe("404-HTTP");
    });
  });
});
