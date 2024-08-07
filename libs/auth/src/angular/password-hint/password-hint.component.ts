import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { LoginEmailServiceAbstraction } from "@bitwarden/auth/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PasswordHintRequest } from "@bitwarden/common/auth/models/request/password-hint.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import {
  AsyncActionsModule,
  ButtonModule,
  FormFieldModule,
  ToastService,
} from "@bitwarden/components";

@Component({
  standalone: true,
  templateUrl: "./password-hint.component.html",
  imports: [AsyncActionsModule, ButtonModule, FormFieldModule, JslibModule, ReactiveFormsModule],
})
export class PasswordHintComponent implements OnInit {
  protected email = "";

  get emailFormControl() {
    return this.formGroup.controls.email;
  }

  formGroup = this.formBuilder.group({
    email: ["", [Validators.email, Validators.required]],
  });

  constructor(
    private apiService: ApiService, // TODO-rr-bw
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.email = this.loginEmailService.getEmail() ?? "";

    // Start web-specific
    this.emailFormControl.setValue(this.email);
    // End web-specific
  }

  submit = async () => {
    // Start web-specific
    this.email = this.emailFormControl.value;
    // End web-specific

    // If email is null or empty, show error toast and return
    if (this.email == null || this.email === "") {
      this.toastService.showToast({
        variant: "error",
        title: this.i18nService.t("errorOccurred"),
        message: this.i18nService.t("emailRequired"),
      });

      return;
    }

    // If not a valid email format, show error toast and return
    if (this.email.indexOf("@") === -1) {
      this.toastService.showToast({
        variant: "error",
        title: this.i18nService.t("errorOccurred"),
        message: this.i18nService.t("invalidEmail"),
      });

      return;
    }

    await this.apiService.postPasswordHint(new PasswordHintRequest(this.email));

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("masterPassSent"),
    });

    if (this.router != null) {
      await this.router.navigate(["login"]);
    }
  };
}
