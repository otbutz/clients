import { Component, OnDestroy, OnInit } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";

@Component({
  selector: "app-frontend-layout",
  templateUrl: "frontend-layout.component.html",
})
export class FrontendLayoutComponent implements OnInit, OnDestroy {
  version: string;
  year = "2015";
  isEuServer = true;

  constructor(private platformUtilsService: PlatformUtilsService) {}

  async ngOnInit() {
    this.year = new Date().getFullYear().toString();
    this.version = await this.platformUtilsService.getApplicationVersion();
    this.isEuServer = Utils.getDomain("https://vault.bitwarden.eu/#/login").includes(".eu");
    
    document.body.classList.add("layout_frontend");
  }

  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
