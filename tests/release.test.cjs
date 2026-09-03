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
const secondFearNote = read("content/notes/第二层恐惧.md");
const runtimeSource = [html, css, app, svg].join("\n");

test("package version and the one offline entry agree", () => {
  const pkg = JSON.parse(read("package.json"));
  const declared = html.match(/<meta name="version" content="([^"]+)">/);
  const changelog = read("CHANGELOG.md");

  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.ok(declared, "index.html must declare its version");
  assert.equal(declared[1], pkg.version);
  assert.ok(changelog.includes(`## ${pkg.version}`));
  assert.match(html, /<meta name="application-name" content="缓一缓">/);
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

test("the emergency route has active, focused stages and an always-available human exit", () => {
  ["先看最响的一个", "先接住身体", "接受", "飘然", "落地", "让时间过去", "你的话"].forEach((label) => {
    assert.ok(app.includes(label), `missing stage: ${label}`);
  });
  assert.match(app, /createGroundingRun/);
  assert.match(app, /takeRandom\(GROUNDING_POOLS\.see, 5\)/);
  assert.match(app, /takeRandom\(GROUNDING_POOLS\.touch, 4\)/);
  assert.match(app, /takeRandom\(GROUNDING_POOLS\.hear, 3\)/);
  assert.match(app, /直接看给我的话/);
  assert.match(app, /data-action="breath-touch"/);
  assert.match(app, /grounding-object/);
  assert.match(app, /data-action="ground-swap"/);
  assert.match(app, /swapGroundingStep/);
  assert.match(app, /id="ground-answer"/);
  assert.match(app, /groundAnswers/);
  assert.match(app, /刚才你真的找到过：/);
  assert.match(app, /data-action="wait-window"/);
  assert.match(app, /WAIT_WINDOW_POSITIONS/);
  assert.match(app, /data-action="wait-switch"/);
  assert.match(app, /id="wait-fog-canvas"/);
  assert.match(app, /clearWaitFog/);
  assert.match(app, /context\.lineWidth = 96/);
  assert.doesNotMatch(app, /id="wait-trace-board"|getPointAtLength|followWaitTrace/);
  assert.match(app, /你不用现在就好起来。按下去，我们一次只做一件事/);
  assert.doesNotMatch(app, /<p class="home-note">我也经历过惊恐/);
  assert.match(app, /data-action="support-swap"/);
  assert.match(app, /再给我一句/);
  assert.match(app, /那又怎样？/);
  assert.match(app, /我以前都挺过去了，这次也会的/);
  assert.match(css, /touch-echo-spread/);
  assert.match(html, /data-global-action="help"/);
  assert.match(app, /href="tel:12356"/);
  assert.doesNotMatch(runtimeSource, /进度条|完成度|打卡|成就/);
});

test("the calm route has four useful branches without turning them into retention mechanics", () => {
  ["看懂它", "平时练一小步", "做自己的卡", "走过之后想一想"].forEach((label) => {
    assert.ok(app.includes(label), `missing calm branch: ${label}`);
  });
  assert.match(app, /data-action="open-learn"/);
  assert.match(app, /data-action="open-practice"/);
  assert.match(app, /data-action="open-reflection"/);
  assert.match(app, /data-action="learn-layer"/);
  assert.match(app, /id="reflection-form"/);
  assert.match(app, /不会保存成发作记录/);
  assert.match(secondFearNote, /“那又怎样？”不是逞强/);
  assert.match(secondFearNote, /两声警报/);
  assert.match(secondFearNote, /个人阅读笔记与经验整理/);
  assert.doesNotMatch(app + secondFearNote, /心律不齐一点都不危险|不需要镇静剂|唯一的敌人就是自己的恐惧/);
  assert.doesNotMatch(app, /连续学习|阅读天数|完成百分比/);
});

test("time copy avoids promises the tool cannot make", () => {
  assert.match(app, /每个人的时程不同/);
  assert.match(app, /两种都可以/);
  assert.match(app, /五本可以慢慢读的书/);
  assert.match(app, /《焦虑症的自救》[\s\S]*面对、接受、飘然和等待/);
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
  assert.match(app, /我记得它退下去以后，胸口会重新平静/);
  assert.match(app, /window\.xhs && window\.xhs\.miniTool/);
  assert.match(app, /writeTempFile\(\{ data: state\.cardDataUrl \}\)/);
  assert.match(app, /saveImageToPhotosAlbum\(\{ filePath: temporary\.filePath \}\)/);
  assert.doesNotMatch(app, /\.split\(","\)\[1\]/);
  assert.doesNotMatch(app, /postNote\s*\(/);
});

test("personal memories are examples, never assigned as the reader's defaults", () => {
  assert.match(app, /anchor: ""/);
  assert.match(app, /scenePlace: ""/);
  assert.match(app, /data-action="use-anchor-example"/);
  assert.match(app, /data-action="use-scene-example"/);
  assert.match(app, /这是我的例子，不一定是你的/);
  assert.match(app, /这是我的一个真实例子/);
  assert.match(app, /draft\.anchor \|\| "还没写，也没关系"/);
  assert.doesNotMatch(app, /anchor: "雨天的假山"/);
  assert.doesNotMatch(runtimeSource, /按摩颈部|把脸埋在冰冷水里|像排便困难时那样使劲/);
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
  assert.match(css, /\.wait-window[\s\S]*min-height: 64px/);
  assert.match(css, /\.quiet-link,[\s\S]*min-height: 44px/);
  assert.match(css, /\.fog-board[\s\S]*touch-action: none/);
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
