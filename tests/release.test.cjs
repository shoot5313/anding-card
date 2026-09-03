const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");
const css = read("styles.css");
const app = read("src/app.js");
const triviaSource = read("src/trivia.js");
const trivia = require(path.join(root, "src", "trivia.js"));
const { loadQuestions } = require(path.join(root, "scripts", "build-trivia-data.cjs"));
const svg = read("assets/icon.svg");
const secondFearNote = read("content/notes/第二层恐惧.md");
const acceptanceNote = read("content/notes/来吧老朋友.md");
const setbackNote = read("content/notes/又来了路还在.md");
const workbookNote = read("content/notes/焦虑症与恐惧症手册-阅读导览.md");
const runtimeSource = [html, css, app, triviaSource, svg].join("\n");
const publicProse = [app, read("README.md"), secondFearNote, acceptanceNote, setbackNote, workbookNote].join("\n");

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
  assert.match(html, /src="\.\/src\/trivia\.js"[\s\S]*src="\.\/src\/app\.js"/);
  assert.match(html, /src="\.\/src\/app\.js"/);
  assert.match(html, /href="\.\/styles\.css"/);
  const localResources = Array.from(html.matchAll(/(?:href|src)="\.\/([^"]+)"/g), (match) => match[1]);
  localResources.forEach((relative) => {
    assert.ok(fs.existsSync(path.join(root, relative)), `missing HTML resource: ${relative}`);
  });
});

test("the emergency route has active, focused stages and an always-available human exit", () => {
  ["先看最抢注意力的一个", "先接住身体", "接受", "飘然", "落地", "让时间过去", "你的话"].forEach((label) => {
    assert.ok(app.includes(label), `missing stage: ${label}`);
  });
  assert.match(app, /createGroundingRun/);
  assert.match(app, /takeGroundingPrompts\(GROUNDING_POOLS\.see, 3, excludedPrompts\)/);
  assert.match(app, /takeGroundingPrompts\(GROUNDING_POOLS\.touch, 2, excludedPrompts\)/);
  assert.match(app, /takeGroundingPrompts\(GROUNDING_POOLS\.hear, 1, excludedPrompts\)/);
  assert.doesNotMatch(app, /takeGroundingPrompts\(GROUNDING_POOLS\.(?:smell|taste)/);
  assert.match(app, /直接看给我的话/);
  assert.match(app, /data-action="breath-touch"/);
  assert.match(app, /grounding-object/);
  assert.match(app, /data-action="ground-swap"/);
  assert.match(app, /swapGroundingStep/);
  assert.match(app, /data-action="ground-again"/);
  assert.match(app, /"ground-wait"/);
  assert.match(app, /id="ground-answer"/);
  assert.match(app, /看见", prompt: "(?:环顾|扫一眼|看看)四周/);
  assert.doesNotMatch(app, /把眼睛从手机上抬起来/);
  assert.doesNotMatch(app, /把手伸向身边|先不用看手机，听听四周|留意你所在的地方和手边的东西/);
  assert.match(app, /primaryDisabled/);
  assert.match(app, /button\.disabled = !hasAnswer/);
  assert.doesNotMatch(app, /不方便输入，也可以直接继续/);
  assert.match(app, /groundAnswers/);
  assert.match(app, /刚才你真的找到过：/);
  assert.match(app, /data-action="wait-window"/);
  assert.match(app, /WAIT_WINDOW_POSITIONS/);
  assert.match(app, /WAIT_WINDOW_MIN_LENGTH = 3/);
  assert.match(app, /WAIT_WINDOW_MAX_LENGTH = 6/);
  assert.match(app, /createWaitWindowSequence/);
  assert.match(app, /data-action="wait-replay"/);
  assert.match(app, /data-action="wait-difficulty"/);
  assert.match(app, /changeWaitWindowDifficulty/);
  assert.match(app, /没关系，忘了很正常。再看一遍/);
  assert.match(app, /data-action="wait-switch"/);
  assert.match(app, /id="wait-fog-scene"/);
  assert.match(app, /id="wait-fog-canvas"/);
  assert.match(app, /drawFogScene/);
  assert.match(app, /data-action="fog-new"/);
  assert.match(app, /clearWaitFog/);
  assert.match(app, /FOG_BRUSH_RADIUS = 30/);
  assert.match(app, /revealed >= 0\.78/);
  assert.doesNotMatch(app, /id="wait-trace-board"|getPointAtLength|followWaitTrace/);
  assert.match(app, /现在只按一下。接下来的事，我们一件一件来/);
  assert.doesNotMatch(app, /<p class="home-note">我也经历过惊恐/);
  assert.match(app, /data-action="start-game"/);
  assert.match(app, /data-action="emergency-exit"/);
  assert.match(app, /直接玩小游戏/);
  assert.match(app, /亮窗记忆 \/ 擦开图景 \/ 冷知识问答/);
  assert.match(app, /data-action="support-swap"/);
  assert.match(app, /再给我一句/);
  assert.match(app, /var DEFAULT_WORDS = \[\s*"怕可以在这里，我也可以在这里。"/);
  assert.doesNotMatch(app, /var DEFAULT_WORDS = \[\s*"那又怎样？"/);
  assert.match(app, /惊恐想夺取我全部注意力，我偏要留一点给眼前/);
  assert.match(app, /哪怕只松开一点点，也值得我鼓励自己/);
  assert.match(app, /那又怎样？/);
  assert.match(app, /我以前都挺过去了，这次也会的/);
  assert.match(css, /touch-echo-spread/);
  assert.match(html, /data-global-action="help"/);
  assert.match(app, /href="tel:12356"/);
  assert.doesNotMatch(runtimeSource, /进度条|完成度|打卡|成就/);
});

test("the cold-knowledge cabinet has 100 sourced, pressure-free questions", () => {
  const counts = trivia.reduce((result, question) => {
    result[question.category] = (result[question.category] || 0) + 1;
    return result;
  }, {});
  const answerCounts = trivia.reduce((result, question) => {
    result[question.answerIndex] += 1;
    return result;
  }, [0, 0, 0]);

  assert.equal(trivia.length, 100);
  assert.deepEqual(counts, { nature: 34, animal: 33, art: 33 });
  assert.deepEqual(answerCounts, [33, 34, 33]);
  assert.deepEqual(trivia, loadQuestions(), "generated runtime data must match the reviewed Markdown");
  trivia.forEach((question) => {
    assert.equal(question.choices.length, 3, question.id);
    assert.ok(question.explanation.length > 20, question.id);
    assert.ok(question.sourceLabel, question.id);
    assert.equal(question.verifiedOn, "2026-09-03", question.id);
  });
  assert.doesNotMatch(triviaSource, /https?:\/\//);
  assert.match(app, /TRIVIA_STORAGE_KEY = "anding-card-trivia-seen-v1"/);
  assert.match(app, /random[\s\S]*unseen|var unseen/);
  assert.match(app, /state\.triviaRecentIds\.length > 10/);
  assert.match(app, /答案是「/);
  assert.match(app, /这里没有分数，也不记对错/);
  assert.doesNotMatch(app, /你答对了|你答错了|今天又知道了一件暂时用不上/);
  assert.match(css, /grid-template-columns: repeat\(5, minmax\(48px, 1fr\)\)/);
  assert.match(css, /\.trivia-drawer\.is-seen \.trivia-drawer__paper/);
});

test("the calm route has four useful branches without turning them into retention mechanics", () => {
  ["看懂它", "平时练一小步", "做自己的卡", "走过之后想一想"].forEach((label) => {
    assert.ok(app.includes(label), `missing calm branch: ${label}`);
  });
  assert.match(app, /data-action="open-learn"/);
  assert.match(app, /data-action="open-practice"/);
  assert.match(app, /data-action="open-reflection"/);
  assert.match(app, /data-action="learn-layer"/);
  assert.match(app, /data-note="accept"/);
  assert.match(app, /data-note="setback"/);
  assert.match(app, /data-note="workbook"/);
  assert.match(app, /id="reflection-form"/);
  assert.match(app, /离开后就散了/);
  assert.match(secondFearNote, /“那又怎样？”把选择拿回来/);
  assert.match(secondFearNote, /两声警报/);
  assert.match(secondFearNote, /个人阅读笔记与经验整理/);
  assert.match(acceptanceNote, /来吧，老朋友/);
  assert.match(acceptanceNote, /先给它一把椅子/);
  assert.match(setbackNote, /又来了，路还在/);
  assert.match(workbookNote, /第 6 章“应对惊恐发作”/);
  assert.match(workbookNote, /这篇是阅读导览/);
  assert.doesNotMatch(app + secondFearNote + acceptanceNote + setbackNote + workbookNote, /心律不齐一点都不危险|不需要镇静剂|唯一的敌人就是自己的恐惧/);
  assert.doesNotMatch(app, /连续学习|阅读天数|完成百分比/);
});

test("the calm practice is playful, stoppable, and makes no physiological claim", () => {
  ["吹一片叶子", "机器人下班", "小蜜蜂试音"].forEach((label) => {
    assert.ok(app.includes(label), `missing practice: ${label}`);
  });
  assert.match(app, /data-action="practice-select"/);
  assert.match(app, /data-action="practice-start"/);
  assert.match(app, /data-action="practice-hold"/);
  assert.match(app, /data-action="practice-finish"/);
  assert.match(app, /data-action="practice-feeling"/);
  assert.match(app, /beginLeafInhale/);
  assert.match(app, /beginLeafExhale/);
  assert.match(app, /beginPracticeHold/);
  assert.match(app, /endPracticeHold/);
  assert.match(app, /不要刻意吸深或憋气；头晕、发麻或胸闷加重就停/);
  assert.match(app, /它不听麦克风，只负责把波纹画出来/);
  assert.match(app, /这个选择不会被保存/);
  assert.match(app, /if \(state\.practiceRound >= 4\)/);
  assert.doesNotMatch(app, /激活副交感|刺激迷走神经|调节迷走神经|纠正二氧化碳|心率变异性/);
  assert.doesNotMatch(app, /练习分数|练习记录|连续练习|今日目标/);
  assert.match(css, /@keyframes practice-leaf-sail/);
  assert.match(css, /@keyframes practice-bee-wave/);
  assert.match(css, /\.practice-stage[\s\S]*touch-action: none/);
  assert.match(css, /\.practice-feeling-choices button[\s\S]*min-height: 62px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.practice-leaf-scene\.is-exhaling/);
});

test("time copy avoids promises the tool cannot make", () => {
  assert.match(app, /每个人走完这一阵的时间各不相同/);
  assert.match(app, /此刻是什么样就是什么样/);
  assert.match(app, /可以慢慢读的书/);
  assert.match(app, /《焦虑症的自救》[\s\S]*《焦虑症与恐惧症手册》[\s\S]*《直视骄阳》/);
  assert.match(app, /惊恐总会想办法[\s\S]*夺取你全部注意力[\s\S]*它是纸老虎/);
  assert.doesNotMatch(app, /常常[^。]{0,16}纸老虎/);
  assert.match(app, /难受是真的，危险未必是真的/);
  assert.match(app, /每次发作都给你一回练习机会/);
  assert.match(app, /经验就在这些时刻慢慢攒起来/);
  assert.match(app, /这一回没有时间要求，照自己的步调来/);
  assert.match(app, /哪怕只进步一点，也值得好好鼓励自己/);
  assert.doesNotMatch(app, /十分钟只是数字，拿它给自己打分很吃亏/);
  assert.match(secondFearNote, /这样的经验很宝贵/);
  assert.doesNotMatch(app, /你没事(?:的)?|十分钟。它开始退了|峰值通常在十分钟前后|每一次都会退/);
  assert.match(app, /Date\.now\(\)/);
  assert.match(app, /setInterval\(updateWaitClock, 1000\)/);
});

test("public copy welcomes the familiar feeling without negative parallelisms", () => {
  assert.match(app, /哦，是你。来吧，老朋友/);
  assert.match(app + acceptanceNote, /给它一把椅子/);
  assert.doesNotMatch(publicProse, /不只是|不是[^。！？\n]{0,80}(?:也不是|更不是|而是)/);
  assert.doesNotMatch(publicProse, /惊恐[^。！？\n]{0,50}(?:很吵|很响|吵闹)|惊恐一来，身体已经够吵了/);
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
  assert.match(app, /先借我的记忆找找感觉/);
  assert.match(app, /我记得这样一幕/);
  assert.match(app, /draft\.anchor \|\| "还没写，也没关系"/);
  assert.doesNotMatch(app, /anchor: "雨天的假山"/);
  assert.doesNotMatch(runtimeSource, /按摩颈部|把脸埋在冰冷水里|像排便困难时那样使劲/);
});

test("runtime is offline, permission-light, and stores only the draft and seen question IDs", () => {
  assert.doesNotMatch(runtimeSource, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|getUserMedia)\s*\(/);
  assert.doesNotMatch(runtimeSource, /navigator\.(?:geolocation|clipboard|serviceWorker|bluetooth|usb|hid|serial)/);
  assert.doesNotMatch(runtimeSource, /\b(?:eval|Function)\s*\(|\bWebAssembly\b|\b(?:Worker|SharedWorker)\s*\(/);
  assert.doesNotMatch(runtimeSource, /window\.open\s*\(|<a[^>]+\bdownload\b/i);
  assert.match(app, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(app, /window\.localStorage\.setItem\(TRIVIA_STORAGE_KEY, JSON\.stringify\(state\.triviaSeenIds\)\)/);
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
  assert.match(css, /--night: #132823/);
  assert.match(css, /--paper: #f2ebdd/);
  assert.match(css, /--action: #376c53/);
  assert.match(css, /\.primary-button:disabled/);
});

test("release sources are comfortably below the upload ceiling", () => {
  const releaseFiles = [
    "index.html",
    "styles.css",
    "src/app.js",
    "src/trivia.js",
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
