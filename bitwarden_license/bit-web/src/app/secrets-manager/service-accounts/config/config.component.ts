import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subject, concatMap, takeUntil } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ToastService } from "@bitwarden/components";

import { ProjectListView } from "../../models/view/project-list.view";
import { ProjectService } from "../../projects/project.service";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import { ProjectsListComponent } from "../../shared/projects-list.component";

@Component({
  selector: "sm-service-account-config",
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
    private projectService: ProjectService,
    private accessPolicyService: AccessPolicyService,
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params: Params) => {
          this.organizationId = params.organizationId;
          this.serviceAccountId = params.serviceAccountId;
          await this.load();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  async load() {
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

  copyProjectUuid(id: string) {
    ProjectsListComponent.copyProjectUuidToClipboard(
      id,
      this.platformUtilsService,
      this.i18nService,
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
