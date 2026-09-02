const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");
const css = read("styles.css");
const app = read("src/app.js");
const svg = read("assets/icon.svg");
const runtimeSource = [html, css, app, svg].join("\n");

test("package version and the one offline entry agree", () => {
  const pkg = JSON.parse(read("package.json"));
  const declared = html.match(/<meta name="version" content="([^"]+)">/);
  const changelog = read("CHANGELOG.md");

  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.ok(declared, "index.html must declare its version");
  assert.equal(declared[1], pkg.version);
  assert.ok(changelog.includes(`## ${pkg.version}`));
  assert.match(html, /<meta name="application-name" content="安定卡">/);
  assert.match(html, /width=device-width, initial-scale=1\.0, maximum-scale=1\.0, user-scalable=no, viewport-fit=cover/);
});

test("the entry obeys the mini-tool container contract", () => {
  assert.doesNotMatch(html, /Content-Security-Policy/i);
  assert.doesNotMatch(html, /rel="manifest"|\.webmanifest/i);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)/i);
  assert.doesNotMatch(html, /\son[a-z]+\s*=|javascript:|<base\b|<iframe\b|<object\b/i);
  assert.doesNotMatch(html, /type="module"/i);
  assert.doesNotMatch(html, /https?:\/\//);
  assert.match(html, /src="\.\/src\/app\.js"/);
  assert.match(html, /href="\.\/styles\.css"/);
  const localResources = Array.from(html.matchAll(/(?:href|src)="\.\/([^"]+)"/g), (match) => match[1]);
  localResources.forEach((relative) => {
    assert.ok(fs.existsSync(path.join(root, relative)), `missing HTML resource: ${relative}`);
  });
});

test("the emergency route has six focused stages and an always-available human exit", () => {
  ["面对", "接受", "飘然", "落地", "让时间过去", "你的话"].forEach((label) => {
    assert.ok(app.includes(label), `missing stage: ${label}`);
  });
  assert.equal((app.match(/sense: "(?:看见|触碰|听见|闻到|尝到)"/g) || []).length, 15);
  assert.match(app, /直接看给我的话/);
  assert.match(html, /data-global-action="help"/);
  assert.match(app, /href="tel:12356"/);
  assert.doesNotMatch(runtimeSource, /进度条|完成度|打卡|成就/);
});

test("time copy avoids promises the tool cannot make", () => {
  assert.match(app, /每个人的时程不同/);
  assert.match(app, /两种都可以/);
  assert.doesNotMatch(app, /你没事(?:的)?|十分钟。它开始退了|峰值通常在十分钟前后|每一次都会退/);
  assert.match(app, /Date\.now\(\)/);
  assert.match(app, /setInterval\(updateWaitClock, 1000\)/);
});

test("the generated card is a local 1080 by 1920 PNG with manual wrapping", () => {
  assert.match(app, /CARD_WIDTH = 1080/);
  assert.match(app, /CARD_HEIGHT = 1920/);
  assert.match(app, /wrapCanvasText/);
  assert.match(app, /canvas\.toDataURL\("image\/png"\)/);
  assert.match(app, /写于 /);
  assert.match(app, /那天我状态很好/);
  assert.match(app, /平静不是假的；它一直是我身上的/);
  assert.match(app, /window\.xhs && window\.xhs\.miniTool/);
  assert.match(app, /writeTempFile\(\{ data: state\.cardDataUrl \}\)/);
  assert.match(app, /saveImageToPhotosAlbum\(\{ filePath: temporary\.filePath \}\)/);
  assert.doesNotMatch(app, /\.split\(","\)\[1\]/);
  assert.doesNotMatch(app, /postNote\s*\(/);
});

test("runtime is offline, permission-light, and stores only an optional draft", () => {
  assert.doesNotMatch(runtimeSource, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|getUserMedia)\s*\(/);
  assert.doesNotMatch(runtimeSource, /navigator\.(?:geolocation|clipboard|serviceWorker|bluetooth|usb|hid|serial)/);
  assert.doesNotMatch(runtimeSource, /\b(?:eval|Function)\s*\(|\bWebAssembly\b|\b(?:Worker|SharedWorker)\s*\(/);
  assert.doesNotMatch(runtimeSource, /window\.open\s*\(|<a[^>]+\bdownload\b/i);
  assert.match(app, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(app, /try \{/);

  const absoluteUrls = Array.from(runtimeSource.matchAll(/https?:\/\/[^\s"']+/g), (match) => match[0]);
  assert.deepEqual(absoluteUrls, ["http://www.w3.org/2000/svg"]);
});

test("release JavaScript remains within the Chrome 61 and ES2017 baseline", () => {
  assert.doesNotMatch(app, /\?\.[A-Za-z_$[(]/);
  assert.doesNotMatch(app, /(?:\|\|=|&&=|\?\?=)/);
  assert.doesNotMatch(app, /[{,]\s*\.\.\.[A-Za-z_$]/);
  assert.doesNotMatch(app, /\.replaceAll\s*\(|\.at\s*\(|Object\.hasOwn\s*\(|structuredClone\s*\(/);
  assert.doesNotMatch(app, /\b(?:import|export)\s+/);
});

test("core CSS has old-WebView fallbacks and no touch-only dead ends", () => {
  assert.match(css, /height: 100vh;\s*height: var\(--app-height, 100vh\)/);
  assert.match(css, /padding-bottom: 9px;\s*padding-bottom: calc\(9px \+ var\(--safe-area-inset-bottom/);
  assert.doesNotMatch(css, /\b(?:clamp|min|max)\s*\(/);
  assert.doesNotMatch(css, /aspect-ratio\s*:/);
  assert.doesNotMatch(css, /:has\s*\(/);
  assert.doesNotMatch(css, /\b(?:dvh|svh|lvh)\b/);
  assert.match(css, /button:focus/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("release sources are comfortably below the upload ceiling", () => {
  const releaseFiles = [
    "index.html",
    "styles.css",
    "src/app.js",
    "assets/icon.svg",
    "assets/icon-180.png",
    "assets/icon-192.png",
  ];
  let bytes = 0;
  releaseFiles.forEach((relative) => {
    const absolute = path.join(root, relative);
    assert.ok(fs.existsSync(absolute), `missing ${relative}`);
    bytes += fs.statSync(absolute).size;
  });
  assert.ok(bytes < 2 * 1024 * 1024, `release text sources total ${bytes} bytes`);
});
