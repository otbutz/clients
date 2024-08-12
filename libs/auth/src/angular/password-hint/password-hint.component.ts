import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { LoginEmailServiceAbstraction } from "@bitwarden/auth/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PasswordHintRequest } from "@bitwarden/common/auth/models/request/password-hint.request";
import { ClientType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AsyncActionsModule,
  ButtonModule,
  FormFieldModule,
  ToastService,
} from "@bitwarden/components";

@Component({
  standalone: true,
  templateUrl: "./password-hint.component.html",
  imports: [
    AsyncActionsModule,
    ButtonModule,
    CommonModule,
    FormFieldModule,
    JslibModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class PasswordHintComponent implements OnInit {
  protected clientType: ClientType;
  protected email = "";

  protected formGroup = this.formBuilder.group({
    email: ["", [Validators.email, Validators.required]],
  });

  protected get emailFormControl() {
    return this.formGroup.controls.email;
  }

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.email = this.loginEmailService.getEmail() ?? "";

    this.clientType = this.platformUtilsService.getClientType();

    if (this.clientType === ClientType.Web) {
      this.emailFormControl.setValue(this.email);
    }
  }

  submit = async () => {
    if (this.clientType === ClientType.Web) {
      this.email = this.emailFormControl.value;
    }

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

    if (this.clientType === ClientType.Browser) {
      await this.router.navigate(["login"]);
      return;
    }

    if (this.router != null) {
      await this.router.navigate(["login"]);
    }
  };
}
