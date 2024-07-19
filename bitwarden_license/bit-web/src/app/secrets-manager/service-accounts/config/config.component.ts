import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService, ToastService } from "@bitwarden/components";

import { ProjectListView } from "../../models/view/project-list.view";
import {
  ProjectDeleteOperation,
  ProjectDeleteDialogComponent,
} from "../../projects/dialog/project-delete-dialog.component";
import {
  ProjectOperation,
  ProjectDialogComponent,
} from "../../projects/dialog/project-dialog.component";
import { ProjectService } from "../../projects/project.service";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import { ProjectsListComponent } from "../../shared/projects-list.component";
import {
  OperationType,
  ServiceAccountOperation,
  ServiceAccountDialogComponent,
} from "../dialog/service-account-dialog.component";

@Component({
  selector: "sm-config",
  templateUrl: "./config.component.html",
})
export class ServiceAccountConfigComponent implements OnInit, OnDestroy {
  identityUrl: string;
  apiUrl: string;
  organizationId: string;
  serviceAccountId: string;
  projects: ProjectListView[];
  hasProjects = false;

  private destroy$ = new Subject<void>();
  loading = true;

  constructor(
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private toastService: ToastService,
    private i18nService: I18nService,
    private dialogService: DialogService,
    private projectService: ProjectService,
    private accessPolicyService: AccessPolicyService,
  ) {}

  async ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.serviceAccountId = params.serviceAccountId;
    });

    const environment = await this.environmentService.getEnvironment();
    this.identityUrl = environment.getIdentityUrl();
    this.apiUrl = environment.getApiUrl();

    const allProjects = await this.projectService.getProjects(this.organizationId);
    await this.accessPolicyService
      .getServiceAccountGrantedPolicies(this.organizationId, this.serviceAccountId)
      .then((policies) => {
        const ids = policies.grantedProjectPolicies.map(
          (policy) => policy.accessPolicy.grantedProjectId,
        );
        this.projects = allProjects.filter((project) =>
          ids.some((projectId) => projectId === project.id),
        );
      });

    this.hasProjects = this.projects.length > 0;
    this.loading = false;
  }

  copyIdentityUrl = async () => {
    this.platformUtilsService.copyToClipboard(this.identityUrl);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("valueCopied", this.i18nService.t("identityUrl")),
    });
  };

  copyApiUrl = async () => {
    this.platformUtilsService.copyToClipboard(this.apiUrl);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("valueCopied", this.i18nService.t("apiUrl")),
    });
  };

  copyOrganizationId = async () => {
    this.platformUtilsService.copyToClipboard(this.organizationId);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("valueCopied", this.i18nService.t("organizationId")),
    });
  };

  // Projects ---

  openEditProject(projectId: string) {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        organizationEnabled: true, //this.organizationEnabled,
        projectId: projectId,
      },
    });
  }

  openNewProjectDialog() {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
        organizationEnabled: true, //this.organizationEnabled,
      },
    });
  }

  openServiceAccountDialog() {
    this.dialogService.open<unknown, ServiceAccountOperation>(ServiceAccountDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
        organizationEnabled: true, //this.organizationEnabled,
      },
    });
  }

  openDeleteProjectDialog(event: ProjectListView[]) {
    this.dialogService.open<unknown, ProjectDeleteOperation>(ProjectDeleteDialogComponent, {
      data: {
        projects: event,
      },
    });
  }

  copyProjectUuid(id: string) {
    ProjectsListComponent.copyProjectUuid(id, this.platformUtilsService, this.i18nService);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
