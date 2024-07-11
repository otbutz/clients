// Electron-builder doesn't support fuses by default, so we need
// to do it manually after the files have been packed
// https://github.com/electron-userland/electron-builder/issues/6365

// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const path = require("path");

const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");
const builder = require("electron-builder");

/**
 * @param {import("electron-builder").AfterPackContext} context
 */
async function addElectronFuses(context) {
  const platform = context.packager.platform.nodeName;

  const ext = {
    darwin: ".app",
    win32: ".exe",
    linux: "",
  }[platform];

  const IS_LINUX = platform === "linux";
  const executableName = IS_LINUX
    ? context.packager.appInfo.productFilename.toLowerCase().replace("-dev", "").replace(" ", "-")
    : context.packager.appInfo.productFilename; // .toLowerCase() to accomodate Linux file named `name` but productFileName is `Name` -- Replaces '-dev' because on Linux the executable name is `name` even for the DEV builds

  const electronBinaryPath = path.join(context.appOutDir, `${executableName}${ext}`);

  console.log("## Adding fuses to the electron binary", electronBinaryPath);

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    strictlyRequireAllFuses: true,
    resetAdHocDarwinSignature: platform === "darwin" && context.arch === builder.Arch.universal,

    // List of fuses and their default values is available at:
    // https://www.electronjs.org/docs/latest/tutorial/fuses

    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,

    // Mac app refuses to open when enabled
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,

    [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
  });
}

/**
 * @param {import("electron-builder").AfterPackContext} context
 */
async function afterPack(context) {
  if (context.packager.platform.nodeName !== "darwin" || context.arch === builder.Arch.universal) {
    await addElectronFuses(context);
  }
}

module.exports = afterPack;
