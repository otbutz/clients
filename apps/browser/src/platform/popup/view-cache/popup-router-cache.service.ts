import { Location } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  NavigationEnd,
  Router,
  UrlSerializer,
} from "@angular/router";
import { filter, firstValueFrom, from, switchMap } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { GlobalStateProvider } from "@bitwarden/common/platform/state";

import { POPUP_ROUTE_HISTORY_KEY } from "../../../platform/services/popup-view-cache-background.service";
import BrowserPopupUtils from "../browser-popup-utils";

/**
 * Preserves route history when opening and closing the popup
 *
 * Routes marked with `doNotSaveUrl` will not be stored
 **/
@Injectable({
  providedIn: "root",
})
export class PopupRouterCacheService {
  private router = inject(Router);
  private state = inject(GlobalStateProvider).get(POPUP_ROUTE_HISTORY_KEY);
  private configService = inject(ConfigService);
  private location = inject(Location);

  constructor() {
    from(this.initPopoutHistory())
      .pipe(
        switchMap(() => this.router.events),
        filter((event) => event instanceof NavigationEnd),
        filter((_event: NavigationEnd) => {
          const state: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;

          let child = state.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }

          return !child?.data?.doNotSaveUrl ?? true;
        }),
        switchMap((event) => this.push(event.url)),
      )
      .subscribe();
  }

  async getHistory(): Promise<string[]> {
    return firstValueFrom(this.state.state$);
  }

  async setHistory(state: string[]): Promise<string[]> {
    return this.state.update(() => state);
  }

  /** Get the last item from the history stack */
  async last(): Promise<string> {
    const history = await this.getHistory();
    if (!history || history.length === 0) {
      return null;
    }
    return history[history.length - 1];
  }

  /**
   * If in browser popup, push new route onto history stack
   *
   * @returns a boolean that indicates if the route was successfully saved
   */
  private async push(url: string): Promise<boolean> {
    if (!BrowserPopupUtils.inPopup(window) || url === (await this.last())) {
      return false;
    }
    await this.state.update((prevState) => (prevState === null ? [url] : prevState.concat(url)));
    return true;
  }

  /**
   * Navigate back to the prior URL in the history stack
   *
   * @returns a boolean that indicates success
   */
  async back(): Promise<boolean> {
    if (!(await this.configService.getFeatureFlag(FeatureFlag.PersistPopupView))) {
      this.location.back();
      return true;
    }

    const length = (await this.getHistory())?.length;
    if (!length) {
      return false;
    }

    const newState = await this.state.update((prevState) => {
      return prevState.slice(0, -1);
    });

    return this.router.navigateByUrl(newState[newState.length - 1]);
  }

  /** Retrieve history from popout URL search param `routeHistory` */
  private async initPopoutHistory(): Promise<void> {
    if (BrowserPopupUtils.inPopout(window)) {
      const searchParams = new URL(window.location.href).searchParams;
      const history = JSON.parse(decodeURIComponent(searchParams.get("routeHistory")));
      searchParams.delete("routeHistory");
      if (Array.isArray(history)) {
        await this.setHistory(history);
      }
    }
  }
}

/**
 * Redirect to the last visited route. Should be applied to root route.
 *
 * If `FeatureFlag.PersistPopupView` is disabled, do nothing.
 **/
export const popupRouterCacheGuard = (async () => {
  const configService = inject(ConfigService);
  const popupHistoryService = inject(PopupRouterCacheService);
  const urlSerializer = inject(UrlSerializer);

  if (!(await configService.getFeatureFlag(FeatureFlag.PersistPopupView))) {
    return true;
  }

  const url = await popupHistoryService.last();

  if (!url) {
    return true;
  }

  return urlSerializer.parse(url);
}) satisfies CanActivateFn;
