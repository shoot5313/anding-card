const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "site");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const sourceHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");

const headMarker = '    <link rel="stylesheet" href="./styles.css">';
const scriptMarker = '    <script src="./src/app.js" defer></script>';
if (!sourceHtml.includes(headMarker) || !sourceHtml.includes(scriptMarker)) {
  throw new Error("index.html no longer contains the Web build injection markers");
}

const webHead = [
  '    <meta name="mobile-web-app-capable" content="yes">',
  '    <meta name="apple-mobile-web-app-capable" content="yes">',
  '    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '    <meta property="og:type" content="website">',
  '    <meta property="og:title" content="安定卡 · 它会过">',
  '    <meta property="og:description" content="发作时一次只做一件事；平静时，为自己留一张安定卡。">',
  '    <meta property="og:image" content="https://shoot5313.github.io/anding-card/assets/icon-1024.png">',
  '    <link rel="canonical" href="https://shoot5313.github.io/anding-card/">',
  '    <link rel="manifest" href="./manifest.webmanifest">',
  headMarker,
  '    <link rel="stylesheet" href="./web.css">',
].join("\n");

const webScripts = [
  scriptMarker,
  '    <script src="./web.js" defer></script>',
].join("\n");

const webHtml = sourceHtml
  .replace(headMarker, webHead)
  .replace(scriptMarker, webScripts);

fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(site, "src"), { recursive: true });
fs.mkdirSync(path.join(site, "assets"), { recursive: true });

fs.writeFileSync(path.join(site, "index.html"), webHtml);
fs.writeFileSync(path.join(site, ".nojekyll"), "");
fs.copyFileSync(path.join(root, "styles.css"), path.join(site, "styles.css"));
fs.copyFileSync(path.join(root, "src", "app.js"), path.join(site, "src", "app.js"));

[
  "icon.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "icon-1024.png",
].forEach((name) => {
  fs.copyFileSync(path.join(root, "assets", name), path.join(site, "assets", name));
});

fs.copyFileSync(path.join(root, "web", "web.css"), path.join(site, "web.css"));
fs.copyFileSync(path.join(root, "web", "web.js"), path.join(site, "web.js"));
fs.copyFileSync(path.join(root, "web", "manifest.webmanifest"), path.join(site, "manifest.webmanifest"));

const serviceWorker = fs.readFileSync(path.join(root, "web", "sw.js"), "utf8")
  .replace("__VERSION__", pkg.version);
fs.writeFileSync(path.join(site, "sw.js"), serviceWorker);

process.stdout.write(`Built site/ for 安定卡 ${pkg.version}\n`);
