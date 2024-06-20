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
    return child_process.execSync(`cargo build --release ${targetArg}`, {stdio: 'inherit', cwd: path.join(__dirname, "proxy")});
}

if (!crossPlatform) {
    buildNapiModule();
    buildProxyBin();
    return;
}

let targets = [];
switch (process.platform) {
    case "win32":
        targets = ["i686-pc-windows-msvc", "x86_64-pc-windows-msvc", "aarch64-pc-windows-msvc"];
    break;

    case "darwin":
        targets = ["x86_64-apple-darwin", "aarch64-apple-darwin"];
    break;

    default:
        targets = ['x86_64-unknown-linux-musl'];
        process.env["PKG_CONFIG_ALLOW_CROSS"] = "1";
        process.env["PKG_CONFIG_ALL_STATIC"] = "1";
    break;
}

targets.forEach(target => {
    buildNapiModule(target);
    buildProxyBin(target);
});

if (process.platform === "darwin") {
    fs.mkdirSync(path.join(__dirname, "target", "darwin-universal"), { recursive: true });

    let command = `lipo -create -output ${path.join(__dirname, "target", "darwin-universal", "desktop_proxy")} `;
    targets.forEach(target => {
        command += `${path.join(__dirname, "target", target, "release", "desktop_proxy")} `;
    });
    child_process.execSync(command, { stdio: 'inherit', cwd: __dirname});

}
