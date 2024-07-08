/* eslint-disable @typescript-eslint/no-var-requires */
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const process = require("process");

let crossPlatform = process.argv.length > 2 && process.argv[2] === "cross-platform";

function buildNapiModule(target) {
    const targetArg = target ? `--target ${target}` : "";
    return child_process.execSync(`npm run build --release -- ${targetArg}`, { stdio: 'inherit', cwd: path.join(__dirname, "napi") });
}

function buildProxyBin(target) {
    const targetArg = target ? `--target ${target}` : "";
    return child_process.execSync(`cargo build --bin desktop_proxy --release ${targetArg}`, {stdio: 'inherit', cwd: path.join(__dirname, "proxy")});
}

if (!crossPlatform) {
    buildNapiModule();
    buildProxyBin();
    return;
}

// Note that targets contains pairs of [rust target, node arch]
// We do this to move the output binaries to a location that can
// be easily accessed from electron-builder using ${os} and ${arch}
let targets = [];
switch (process.platform) {
    case "win32":
        targets = [
            ["i686-pc-windows-msvc", 'ia32'],
            ["x86_64-pc-windows-msvc", 'x64'],
            ["aarch64-pc-windows-msvc", 'arm64']
        ];
    break;

    case "darwin":
        targets = [
            ["x86_64-apple-darwin", 'x64'],
            ["aarch64-apple-darwin", 'arm64']
        ];
    break;

    default:
        targets = [
            ['x86_64-unknown-linux-musl', 'x64']
        ];

        process.env["PKG_CONFIG_ALLOW_CROSS"] = "1";
        process.env["PKG_CONFIG_ALL_STATIC"] = "1";
    break;
}

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });

targets.forEach(([target, nodeArch]) => {
    buildNapiModule(target);
    buildProxyBin(target);

    const ext = process.platform === "win32" ? ".exe" : "";
    fs.copyFileSync(path.join(__dirname, "target", target, "release", `desktop_proxy${ext}`), path.join(__dirname, "dist", `desktop_proxy.${process.platform}-${nodeArch}${ext}`));
});
