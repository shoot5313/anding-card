const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "site");
const read = (relative) => fs.readFileSync(path.join(site, relative), "utf8");

test("the generated Pages entry adds only the Web layer", () => {
  const miniHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const webHtml = read("index.html");

  assert.doesNotMatch(miniHtml, /rel="manifest"|web\.js|serviceWorker/i);
  assert.match(webHtml, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(webHtml, /src="\.\/web\.js"/);
  assert.match(webHtml, /href="\.\/web\.css"/);
  assert.match(webHtml, /src="\.\/src\/app\.js"/);
  assert.doesNotMatch(webHtml, /<script(?![^>]*\bsrc=)/i);
});

test("every generated HTML and manifest resource exists", () => {
  const webHtml = read("index.html");
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const htmlResources = Array.from(webHtml.matchAll(/(?:href|src)="\.\/([^"]+)"/g), (match) => match[1]);
  const manifestResources = manifest.icons.map((icon) => icon.src.replace(/^\.\//, ""));

  htmlResources.concat(manifestResources).forEach((relative) => {
    assert.ok(fs.existsSync(path.join(site, relative)), `missing Web resource: ${relative}`);
  });
  assert.ok(fs.existsSync(path.join(site, ".nojekyll")));
});

test("the manifest is installable and keeps the emergency shortcut", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));

  assert.equal(manifest.name, "缓一缓 · 它会过去");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.background_color, "#f6faf4");
  assert.equal(manifest.theme_color, "#275f49");
  assert.equal(manifest.shortcuts[0].url, "./?start=1");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
});

test("the Web helper offers install guidance and the shortcut enters the existing flow", () => {
  const helper = read("web.js");

  assert.match(helper, /beforeinstallprompt/);
  assert.match(helper, /放到手机桌面/);
  assert.match(helper, /添加到主屏幕/);
  assert.match(helper, /URLSearchParams/);
  assert.match(helper, /query\.get\("start"\) !== "1"/);
  assert.match(helper, /navigator\.serviceWorker\.register\("\.\/sw\.js"\)/);
});

test("the service worker precaches the complete local runtime", () => {
  const worker = read("sw.js");
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

  assert.doesNotMatch(worker, /__VERSION__/);
  assert.match(worker, new RegExp(`anding-card-web-v${pkg.version.replace(/\./g, "\\.")}`));
  [
    "./index.html",
    "./styles.css",
    "./web.css",
    "./src/app.js",
    "./web.js",
    "./manifest.webmanifest",
    "./assets/icon-192.png",
    "./assets/icon-512.png",
  ].forEach((resource) => assert.ok(worker.includes(`"${resource}"`), `not precached: ${resource}`));
  assert.match(worker, /requestUrl\.origin !== self\.location\.origin/);
  assert.match(worker, /event\.request\.mode === "navigate"/);
});

test("the Pages workflow builds and uploads only site", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "pages.yml"), "utf8");

  assert.match(workflow, /npm run build:web/);
  assert.match(workflow, /npm run test:web:artifact/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /path: site/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
