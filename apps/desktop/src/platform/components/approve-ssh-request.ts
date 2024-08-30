import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  FormFieldModule,
  IconButtonModule,
} from "@bitwarden/components";
import { DialogService } from "@bitwarden/components/src/dialog";
import { CipherFormGeneratorComponent } from "@bitwarden/vault";

export interface ApproveSSHRequestParams {
  cipherName: string;
  applicationName: string;
}

@Component({
  selector: "app-approve-ssh-request",
  templateUrl: "approve-ssh-request.html",
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    JslibModule,
    CipherFormGeneratorComponent,
    ButtonModule,
    IconButtonModule,
    ReactiveFormsModule,
    AsyncActionsModule,
    FormFieldModule,
  ],
})
export class ApproveSSHRequestComponent {
  approveSSHRequestForm = this.formBuilder.group({});

  constructor(
    @Inject(DIALOG_DATA) protected params: ApproveSSHRequestParams,
    private dialogRef: DialogRef<boolean>,
    private formBuilder: FormBuilder,
  ) {}

  static open(dialogService: DialogService, cipherName: string, applicationName: string) {
    return dialogService.open<boolean, ApproveSSHRequestParams>(ApproveSSHRequestComponent, {
      data: {
        cipherName,
        applicationName,
      },
    });
  }

  submit = async () => {
    this.dialogRef.close(true);
  };
}
