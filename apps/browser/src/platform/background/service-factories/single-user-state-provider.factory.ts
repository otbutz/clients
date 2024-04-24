import { SingleUserStateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- We need the implementation to inject, but generally this should not be accessed
import { DefaultSingleUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-single-user-state.provider";

import { CachedServices, FactoryOptions, factory } from "./factory-options";
import { LogServiceInitOptions, logServiceFactory } from "./log-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";
import {
  StateEventRegistrarServiceInitOptions,
  stateEventRegistrarServiceFactory,
} from "./state-event-registrar-service.factory";
import {
  StorageServiceProviderInitOptions,
  storageServiceProviderFactory,
} from "./storage-service-provider.factory";

type SingleUserStateProviderFactoryOptions = FactoryOptions;

export type SingleUserStateProviderInitOptions = SingleUserStateProviderFactoryOptions &
  StorageServiceProviderInitOptions &
  StateEventRegistrarServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  LogServiceInitOptions;

export async function singleUserStateProviderFactory(
  cache: { singleUserStateProvider?: SingleUserStateProvider } & CachedServices,
  opts: SingleUserStateProviderInitOptions,
): Promise<SingleUserStateProvider> {
  return factory(
    cache,
    "singleUserStateProvider",
    opts,
    async () =>
      new DefaultSingleUserStateProvider(
        await storageServiceProviderFactory(cache, opts),
        await stateEventRegistrarServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await logServiceFactory(cache, opts),
      ),
  );
}
