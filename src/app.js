(function () {
  "use strict";

  var app = document.getElementById("app");
  var STORAGE_KEY = "anding-card-draft-v1";
  var CARD_WIDTH = 1080;
  var CARD_HEIGHT = 1920;
  var transitionTimer = null;
  var breathingTimer = null;
  var waitTimer = null;
  var cacheTimer = null;
  var navigating = false;

  var DEFAULT_WORDS = [
    "怕也没关系，不用把它赶走。",
    "这些感觉很难受，但感觉不是命令。",
    "先把这一分钟交给时间；下一分钟来了，再过下一分钟。",
  ];

  var DEFAULT_DRAFT = {
    anchor: "窗台上的绿萝",
    scenePlace: "靠窗的沙发上",
    sceneTemperature: "空气微凉",
    sceneSound: "雨落在遮雨棚上",
    words: DEFAULT_WORDS.slice(),
    actions: {
      breathe: true,
      ground: true,
      window: false,
      call: false,
      water: true,
      go: false,
      wait: true,
      custom: false,
    },
    callPerson: "",
    goPlace: "",
    customAction: "",
  };

  var GROUNDING_STEPS = [
    { sense: "看见", prompt: "说出你看到的一样东西。", button: "我看见了" },
    { sense: "看见", prompt: "再找一样你看见的东西。", button: "我看见了" },
    { sense: "看见", prompt: "再看一样。只说出它是什么。", button: "我看见了" },
    { sense: "看见", prompt: "让眼睛落在另一件东西上。", button: "我看见了" },
    { sense: "看见", prompt: "最后再看见一样东西。", button: "下一种感觉" },
    { sense: "触碰", prompt: "摸一摸身边的一样东西。", button: "我摸到了" },
    { sense: "触碰", prompt: "再碰一样。留意它是软还是硬。", button: "我摸到了" },
    { sense: "触碰", prompt: "再摸一样，感觉它的温度。", button: "我摸到了" },
    { sense: "触碰", prompt: "最后碰一下离你最近的东西。", button: "下一种感觉" },
    { sense: "听见", prompt: "听。说出你听见的一个声音。", button: "我听见了" },
    { sense: "听见", prompt: "再听一个近处或远处的声音。", button: "我听见了" },
    { sense: "听见", prompt: "再听一个。声音来，不用追。", button: "下一种感觉" },
    { sense: "闻到", prompt: "空气里有什么气味？没有也可以。", button: "我留意了" },
    { sense: "闻到", prompt: "再闻一下。只停在这一口气。", button: "最后一种感觉" },
    { sense: "尝到", prompt: "嘴里是什么味道？说不出来也可以。", button: "下一步" },
  ];

  var WAIT_MESSAGES = [
    { at: 0, text: "什么都不用做。我在这儿，我们等这一阵感觉变化。" },
    { at: 60, text: "一分钟过去了。你还在。" },
    { at: 120, text: "强烈的感觉通常会到一个高点，再逐渐变化。你可能正靠近它，也可能已经过了它。" },
    { at: 180, text: "不需要它现在就走。只是不追着每一个感觉跑。" },
    { at: 300, text: "五分钟过去了。时间一直在往前。" },
    { at: 480, text: "八分钟了。每个人的时程不同，不用拿自己和数字比较。" },
    { at: 600, text: "十分钟。感觉也许还强，也许已经变了一点；两种都可以。" },
    { at: 900, text: "十五分钟。等你自己觉得可以了，再按“它退了”。" },
  ];

  var state = {
    route: "home",
    returnRoute: "home",
    groundIndex: 0,
    waitStartedAt: null,
    waitAcknowledged: false,
    draft: loadDraft(),
    cardDataUrl: "",
    cardSaved: false,
  };

  function cloneDefaultDraft() {
    return {
      anchor: DEFAULT_DRAFT.anchor,
      scenePlace: DEFAULT_DRAFT.scenePlace,
      sceneTemperature: DEFAULT_DRAFT.sceneTemperature,
      sceneSound: DEFAULT_DRAFT.sceneSound,
      words: DEFAULT_DRAFT.words.slice(),
      actions: {
        breathe: DEFAULT_DRAFT.actions.breathe,
        ground: DEFAULT_DRAFT.actions.ground,
        window: DEFAULT_DRAFT.actions.window,
        call: DEFAULT_DRAFT.actions.call,
        water: DEFAULT_DRAFT.actions.water,
        go: DEFAULT_DRAFT.actions.go,
        wait: DEFAULT_DRAFT.actions.wait,
        custom: DEFAULT_DRAFT.actions.custom,
      },
      callPerson: DEFAULT_DRAFT.callPerson,
      goPlace: DEFAULT_DRAFT.goPlace,
      customAction: DEFAULT_DRAFT.customAction,
    };
  }

  function cleanText(value, maxLength) {
    var text = typeof value === "string" ? value.trim() : "";
    return text.slice(0, maxLength);
  }

  function normalizeDraft(raw) {
    var fallback = cloneDefaultDraft();
    if (!raw || typeof raw !== "object") return fallback;
    var words = Array.isArray(raw.words) ? raw.words : fallback.words;
    var actions = raw.actions && typeof raw.actions === "object" ? raw.actions : fallback.actions;
    return {
      anchor: cleanText(raw.anchor, 16),
      scenePlace: cleanText(raw.scenePlace, 18),
      sceneTemperature: cleanText(raw.sceneTemperature, 18),
      sceneSound: cleanText(raw.sceneSound, 18),
      words: [
        cleanText(words[0], 32),
        cleanText(words[1], 32),
        cleanText(words[2], 32),
      ],
      actions: {
        breathe: Boolean(actions.breathe),
        ground: Boolean(actions.ground),
        window: Boolean(actions.window),
        call: Boolean(actions.call),
        water: Boolean(actions.water),
        go: Boolean(actions.go),
        wait: Boolean(actions.wait),
        custom: Boolean(actions.custom),
      },
      callPerson: cleanText(raw.callPerson, 12),
      goPlace: cleanText(raw.goPlace, 12),
      customAction: cleanText(raw.customAction, 18),
    };
  }

  function loadDraft() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeDraft(JSON.parse(saved));
    } catch (error) {
      return cloneDefaultDraft();
    }
    return cloneDefaultDraft();
  }

  function persistDraftSoon() {
    if (cacheTimer) window.clearTimeout(cacheTimer);
    cacheTimer = window.setTimeout(function () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.draft));
      } catch (error) {
        return;
      }
    }, 240);
  }

  function escapeHtml(value) {
    var entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return String(value).replace(/[&<>"']/g, function (character) {
      return entities[character];
    });
  }

  function clearRuntimeTimers() {
    if (breathingTimer) {
      window.clearTimeout(breathingTimer);
      breathingTimer = null;
    }
    if (waitTimer) {
      window.clearInterval(waitTimer);
      waitTimer = null;
    }
  }

  function setAppHeight() {
    var height = window.innerHeight;
    if (window.visualViewport && window.visualViewport.height) {
      height = window.visualViewport.height;
    }
    document.documentElement.style.setProperty("--app-height", Math.round(height) + "px");
  }

  function navigate(route, immediate) {
    if (navigating && !immediate) return;
    clearRuntimeTimers();
    if (transitionTimer) window.clearTimeout(transitionTimer);

    if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.route = route;
      render();
      return;
    }

    navigating = true;
    app.classList.add("is-fading");
    transitionTimer = window.setTimeout(function () {
      state.route = route;
      render();
      window.requestAnimationFrame(function () {
        app.classList.remove("is-fading");
        transitionTimer = window.setTimeout(function () {
          navigating = false;
        }, 300);
      });
    }, 300);
  }

  function flowNav(label, showDirectWords) {
    var direct = showDirectWords === false
      ? '<span aria-hidden="true"></span>'
      : '<button class="quiet-link" type="button" data-action="words">直接看给我的话</button>';
    return [
      '<div class="flow-nav">',
      '<span class="flow-nav__mark">',
      escapeHtml(label),
      "</span>",
      direct,
      "</div>",
    ].join("");
  }

  function calmScreen(label, body, primaryLabel, primaryAction, nextRoute, secondary, showDirectWords) {
    var next = nextRoute ? ' data-next="' + escapeHtml(nextRoute) + '"' : "";
    return [
      '<section class="screen screen-calm">',
      flowNav(label, showDirectWords),
      '<div class="screen-calm__body">',
      body,
      "</div>",
      '<div class="calm-actions">',
      '<button class="primary-button" type="button" data-action="',
      escapeHtml(primaryAction),
      '"',
      next,
      ">",
      escapeHtml(primaryLabel),
      "</button>",
      secondary || (nextRoute ? '<button class="quiet-link" type="button" data-action="skip" data-next="' + escapeHtml(nextRoute) + '">跳过这步</button>' : ""),
      "</div>",
      "</section>",
    ].join("");
  }

  function renderHome() {
    return [
      '<section class="screen home">',
      '<header class="home__brand">',
      '<h1 class="home-title">安定卡</h1>',
      '<p class="home-subtitle">它会过</p>',
      "</header>",
      '<div class="home__main">',
      '<div class="emergency-button-wrap">',
      '<button class="emergency-button" type="button" data-action="start">我现在<br>很难受</button>',
      "</div>",
      '<p class="home-note">不需要先读说明。按下去，一次只做一件事。</p>',
      '<div class="home__secondary">',
      '<button class="secondary-button" type="button" data-action="prepare">现在还好，先准备</button>',
      '<button class="text-button" type="button" data-action="understand">先了解一下</button>',
      "</div>",
      "</div>",
      "</section>",
    ].join("");
  }

  function renderFace() {
    var body = '<h1 class="display-title">你按了。你没有绕开正在发生的感觉。<br>最难的一步，你已经开始做了。</h1>';
    return calmScreen("面对", body, "好", "next", "accept");
  }

  function renderAccept() {
    var body = [
      '<h1 class="display-title">不用赶走这些感觉。</h1>',
      '<p class="support-copy">心跳快、发麻、喘不上气、觉得要出事——先让它们待在这儿。熟悉的惊恐反应很难受，但不需要立刻把它解决。你不需要现在就好起来。</p>',
    ].join("");
    return calmScreen("接受", body, "我让它在那儿", "next", "breathe");
  }

  function renderBreathe() {
    var body = [
      '<div class="breathing-stage">',
      '<div class="breathing-orbit" aria-hidden="true">',
      '<div class="breathing-circle"><span class="breathing-label" id="breathing-label">吸</span></div>',
      "</div>",
      '<h1 class="display-title">不用吸很深，也不用做对。</h1>',
      '<p class="support-copy">轻轻跟着它飘就行。</p>',
      "</div>",
    ].join("");
    return calmScreen("飘然", body, "够了，下一步", "next", "ground");
  }

  function renderGround() {
    var step = GROUNDING_STEPS[state.groundIndex] || GROUNDING_STEPS[0];
    var body = [
      '<span class="grounding-sense" id="grounding-sense">',
      escapeHtml(step.sense),
      "</span>",
      '<h1 class="grounding-prompt" id="grounding-prompt">',
      escapeHtml(step.prompt),
      "</h1>",
      '<p class="support-copy">把注意力借给眼前一小会儿。</p>',
    ].join("");
    var secondary = '<button class="quiet-link" type="button" data-action="skip" data-next="wait">跳过这步</button>';
    return calmScreen("落地", body, step.button, "ground-next", "", secondary);
  }

  function elapsedWaitSeconds() {
    if (!state.waitStartedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - state.waitStartedAt) / 1000));
  }

  function waitMessageFor(seconds) {
    var message = WAIT_MESSAGES[0].text;
    for (var index = 0; index < WAIT_MESSAGES.length; index += 1) {
      if (seconds >= WAIT_MESSAGES[index].at) message = WAIT_MESSAGES[index].text;
    }
    if (seconds >= 1200) {
      var phase = Math.floor((seconds - 1200) / 300) % 2;
      return phase === 0
        ? "又有五分钟过去了。你不用证明什么，只是继续待在这里。"
        : "感觉可能一阵一阵。我们只过眼前这一阵。";
    }
    return message;
  }

  function formatElapsed(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainder = seconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
  }

  function renderWait() {
    if (!state.waitStartedAt) state.waitStartedAt = Date.now();
    var seconds = elapsedWaitSeconds();
    var body = [
      '<div class="timer" id="wait-timer" aria-label="已经过去 ',
      String(seconds),
      ' 秒">',
      formatElapsed(seconds),
      "</div>",
      '<h1 class="wait-copy" id="wait-copy">',
      escapeHtml(waitMessageFor(seconds)),
      "</h1>",
      '<p class="wait-acknowledgement" id="wait-acknowledgement">',
      state.waitAcknowledged ? "好。我们不赶时间。" : "",
      "</p>",
    ].join("");
    var secondary = '<button class="quiet-link" type="button" data-action="wait-more">再陪我一会儿</button>';
    return calmScreen("让时间过去", body, "它退了", "wait-done", "", secondary);
  }

  function currentWords() {
    var words = state.draft.words.filter(function (word) {
      return Boolean(cleanText(word, 32));
    });
    return words.length ? words : DEFAULT_WORDS.slice();
  }

  function renderWords() {
    var words = currentWords();
    var list = words.map(function (word) {
      return "<li>" + escapeHtml(word) + "</li>";
    }).join("");
    var body = [
      '<h1 class="display-title">给现在的你</h1>',
      '<p class="words-intro">下面这些话，是在状态好时留下来的。如果你写过自己的安定卡，现在去相册找它。</p>',
      '<ul class="words-list">',
      list,
      "</ul>",
    ].join("");
    var secondary = '<button class="quiet-link" type="button" data-action="wait-again">再陪我等一会儿</button>';
    return calmScreen("你的话", body, "回到开头", "home", "", secondary, false)
      .replace("screen screen-calm", "screen screen-calm screen-words");
  }

  function checked(value) {
    return value ? " checked" : "";
  }

  function renderPrepare() {
    var draft = state.draft;
    return [
      '<section class="screen screen-scroll">',
      '<nav class="page-nav"><button class="page-back" type="button" data-action="home">回到首页</button><span class="eyebrow">状态好时再写</span></nav>',
      '<h1 class="page-title">现在的你，比发作时的你更清楚该说什么。</h1>',
      '<p class="page-lead">写给那个时候的自己。下面先放了一份示例，你可以全改掉，也可以只用默认内容。</p>',
      '<form class="prepare-form" id="prepare-form">',
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>一个锚点</h2><span class="field-label">一眼能认出来</span></div>',
      '<p class="form-section__hint">一个词、一个物件、一个画面。</p>',
      '<label class="field-label" for="anchor">我的锚点</label>',
      '<input class="text-field" id="anchor" name="anchor" maxlength="16" value="', escapeHtml(draft.anchor), '" placeholder="例如：窗台上的绿萝">',
      "</section>",
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>一个安全场景</h2><span class="field-label">三小句就够</span></div>',
      '<div class="field-stack">',
      '<label><span class="field-label">你在哪？</span><input class="text-field" id="scene-place" maxlength="18" value="', escapeHtml(draft.scenePlace), '" placeholder="靠窗的沙发上"></label>',
      '<label><span class="field-label">什么温度？</span><input class="text-field" id="scene-temperature" maxlength="18" value="', escapeHtml(draft.sceneTemperature), '" placeholder="空气微凉"></label>',
      '<label><span class="field-label">什么声音？</span><input class="text-field" id="scene-sound" maxlength="18" value="', escapeHtml(draft.sceneSound), '" placeholder="雨落在遮雨棚上"></label>',
      "</div>",
      '<p class="scene-preview" id="scene-preview">', escapeHtml(composeScene(draft)), "</p>",
      "</section>",
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>三句话</h2><span class="field-label">给发作时的自己</span></div>',
      '<div class="field-stack">',
      '<label><span class="field-label">第一句</span><textarea class="text-area" id="word-1" maxlength="32">', escapeHtml(draft.words[0]), "</textarea></label>",
      '<label><span class="field-label">第二句</span><textarea class="text-area" id="word-2" maxlength="32">', escapeHtml(draft.words[1]), "</textarea></label>",
      '<label><span class="field-label">第三句</span><textarea class="text-area" id="word-3" maxlength="32">', escapeHtml(draft.words[2]), "</textarea></label>",
      "</div>",
      "</section>",
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>到时可以做的事</h2><span class="field-label">选几件就好</span></div>',
      '<ul class="check-list">',
      '<li><div class="check-row"><input type="checkbox" id="action-breathe"', checked(draft.actions.breathe), '><label for="action-breathe">跟着圆圈轻轻呼吸</label></div></li>',
      '<li><div class="check-row"><input type="checkbox" id="action-ground"', checked(draft.actions.ground), '><label for="action-ground">把注意力放回眼前</label></div></li>',
      '<li><div class="check-row"><input type="checkbox" id="action-window"', checked(draft.actions.window), '><label for="action-window">走到窗边</label></div></li>',
      '<li><div class="check-row check-row--fill"><input type="checkbox" id="action-call"', checked(draft.actions.call), '><label for="action-call">给</label><input class="inline-field" id="call-person" maxlength="12" value="', escapeHtml(draft.callPerson), '" placeholder="一个人"><span>打电话</span></div></li>',
      '<li><div class="check-row"><input type="checkbox" id="action-water"', checked(draft.actions.water), '><label for="action-water">喝一口温水</label></div></li>',
      '<li><div class="check-row check-row--fill"><input type="checkbox" id="action-go"', checked(draft.actions.go), '><label for="action-go">去</label><input class="inline-field" id="go-place" maxlength="12" value="', escapeHtml(draft.goPlace), '" placeholder="一个地方"></div></li>',
      '<li><div class="check-row"><input type="checkbox" id="action-wait"', checked(draft.actions.wait), '><label for="action-wait">什么都不做，只是等</label></div></li>',
      '<li><div class="check-row check-row--fill"><input type="checkbox" id="action-custom"', checked(draft.actions.custom), '><label class="visually-hidden" for="action-custom">自定义行动</label><input class="inline-field inline-field--wide" id="custom-action" maxlength="18" value="', escapeHtml(draft.customAction), '" placeholder="另一件对我有用的事"></div></li>',
      "</ul>",
      "</section>",
      '<div class="prepare-submit">',
      '<button class="primary-button" type="submit">生成我的安定卡</button>',
      '<p class="privacy-note">内容只留在这台设备上；缓存丢失也不影响急救流程。</p>',
      "</div>",
      "</form>",
      "</section>",
    ].join("");
  }

  function renderCard() {
    var savedNote = state.cardSaved
      ? '<div class="after-save-note">已经保存。把它放进相册收藏，或者设成锁屏。发作时不用找工具，翻相册就行。</div>'
      : "";
    return [
      '<section class="screen screen-scroll">',
      '<nav class="page-nav"><button class="page-back" type="button" data-action="edit-card">继续修改</button><span class="eyebrow">1080 × 1920</span></nav>',
      '<h1 class="page-title">这张卡，留给另一个时刻的你。</h1>',
      '<p class="page-lead">小红书内点“保存到相册”；普通浏览器里可以长按图片或直接截图。</p>',
      '<div class="card-preview-wrap"><img class="card-preview" src="', state.cardDataUrl, '" alt="给发作时的我的安定卡"></div>',
      '<div class="card-actions">',
      '<button class="save-button" type="button" data-action="save-card">保存到相册</button>',
      '<button class="secondary-button" type="button" data-action="home">先回到首页</button>',
      '<p class="status-message" id="save-status" aria-live="polite"></p>',
      savedNote,
      "</div>",
      "</section>",
    ].join("");
  }

  function renderUnderstand() {
    return [
      '<section class="screen screen-scroll">',
      '<nav class="page-nav"><button class="page-back" type="button" data-action="home">回到首页</button><span class="eyebrow">先知道这些就够</span></nav>',
      '<h1 class="page-title">惊恐很响，解释可以很短。</h1>',
      '<section class="info-section"><h2>这是什么</h2><p>惊恐发作像身体警报突然拉响：心跳变快、呼吸急、发麻或发晕都可能一起出现。感受很强，但仍要先排除身体原因。</p></section>',
      '<section class="info-section"><h2>为什么越来越怕</h2><p>身体反应是一层；“这些感觉是不是危险”的担心又加一层。越盯着它、越想立刻赶走它，恐惧可能被继续放大。</p></section>',
      '<section class="info-section"><h2>它会过</h2><p>强烈感觉通常会自行缓下来，但每个人持续时间不同。不要拿十分钟当倒计时，也不必用时长证明自己做得好不好。</p></section>',
      '<section class="info-section">',
      '<h2>四本可以慢慢读的书</h2>',
      '<ul class="book-list">',
      '<li><span class="book-title">《直视骄阳》</span><span class="book-copy">当“会不会死”藏在恐慌后面，它帮你把这层怕放到桌面上看。</span></li>',
      '<li><span class="book-title">《心湖上的倒影》</span><span class="book-copy">练习看见当下发生的念头，不急着评判，也不急着逃。</span></li>',
      '<li><span class="book-title">《世界上最快乐的人》</span><span class="book-copy">从觉察出发，理解身体感受和观察它的那个自己可以同时存在。</span></li>',
      '<li><span class="book-title">《庄子》</span><span class="book-copy">不是控制变化，而是在变化里，试着少抓紧一点。</span></li>',
      "</ul>",
      '<p class="book-meta">更多在笔记里</p>',
      "</section>",
      '<section class="info-section"><div class="medical-note"><strong>先把该排除的排除掉</strong><p>如果这是第一次出现，或伴随和以往不同的症状，请及时就医排除身体原因。这不是软弱，是把该排除的排除掉。</p></div></section>',
      '<section class="info-section"><p>这是一个自助放松工具，不替代医生和心理咨询师。如果发作频繁、或已经影响到生活，请找专业帮助。</p></section>',
      "</section>",
    ].join("");
  }

  function renderHelp() {
    return [
      '<section class="screen screen-scroll">',
      '<nav class="page-nav"><button class="page-back" type="button" data-action="return">回到刚才</button><span class="eyebrow">让真人接住这一会儿</span></nav>',
      '<h1 class="page-title">不必一个人等。</h1>',
      '<div class="help-panel">',
      '<span class="field-label">全国统一心理援助热线</span>',
      '<div class="help-number">12356</div>',
      '<p class="help-description">提供心理咨询、心理疏导与危机干预。各地服务时段可能不同。</p>',
      '<a class="primary-button phone-link" href="tel:12356">拨打 12356</a>',
      "</div>",
      '<div class="trusted-script">',
      '<span class="field-label">也可以打给一个信任的人，只说</span>',
      '<p>“我现在很难受。你不用解决它，陪我待一会儿就好。”</p>',
      "</div>",
      '<p class="urgent-note">如果你可能伤害自己或他人，或出现持续胸痛、昏厥、明显呼吸困难等紧急或与以往不同的症状，请立即联系 110 / 120 或前往急诊。</p>',
      '<p class="urgent-note">本工具不提供诊断，也不替代医生和心理咨询师。</p>',
      "</section>",
    ].join("");
  }

  function render() {
    var markup = "";
    if (state.route === "home") markup = renderHome();
    else if (state.route === "face") markup = renderFace();
    else if (state.route === "accept") markup = renderAccept();
    else if (state.route === "breathe") markup = renderBreathe();
    else if (state.route === "ground") markup = renderGround();
    else if (state.route === "wait") markup = renderWait();
    else if (state.route === "words") markup = renderWords();
    else if (state.route === "prepare") markup = renderPrepare();
    else if (state.route === "card") markup = renderCard();
    else if (state.route === "understand") markup = renderUnderstand();
    else if (state.route === "help") markup = renderHelp();
    else markup = renderHome();

    app.innerHTML = markup;
    if (state.route === "breathe") startBreathingGuide();
    if (state.route === "wait") startWaitClock();
  }

  function startBreathingGuide() {
    var label = document.getElementById("breathing-label");
    if (!label) return;
    var inhale = true;

    function changePhase() {
      if (state.route !== "breathe") return;
      label.textContent = inhale ? "吸" : "呼";
      breathingTimer = window.setTimeout(function () {
        inhale = !inhale;
        changePhase();
      }, inhale ? 4000 : 6000);
    }

    changePhase();
  }

  function updateWaitClock() {
    var timer = document.getElementById("wait-timer");
    var copy = document.getElementById("wait-copy");
    if (!timer || !copy) return;
    var seconds = elapsedWaitSeconds();
    timer.textContent = formatElapsed(seconds);
    timer.setAttribute("aria-label", "已经过去 " + String(seconds) + " 秒");
    copy.textContent = waitMessageFor(seconds);
  }

  function startWaitClock() {
    updateWaitClock();
    waitTimer = window.setInterval(updateWaitClock, 1000);
  }

  function updateGroundingStep() {
    var step = GROUNDING_STEPS[state.groundIndex];
    var sense = document.getElementById("grounding-sense");
    var prompt = document.getElementById("grounding-prompt");
    var button = app.querySelector('[data-action="ground-next"]');
    if (!step || !sense || !prompt || !button) return;
    sense.textContent = step.sense;
    prompt.textContent = step.prompt;
    button.textContent = step.button;
  }

  function composeScene(draft) {
    var parts = [];
    if (draft.scenePlace) parts.push("我在" + draft.scenePlace);
    if (draft.sceneTemperature) parts.push(draft.sceneTemperature);
    if (draft.sceneSound) parts.push("我能听见" + draft.sceneSound);
    return parts.length ? parts.join("。") + "。" : "留一个你熟悉的地方、温度和声音。";
  }

  function readDraftFromForm() {
    function value(id) {
      var field = document.getElementById(id);
      return field ? field.value : "";
    }

    function isChecked(id) {
      var field = document.getElementById(id);
      return Boolean(field && field.checked);
    }

    return normalizeDraft({
      anchor: value("anchor"),
      scenePlace: value("scene-place"),
      sceneTemperature: value("scene-temperature"),
      sceneSound: value("scene-sound"),
      words: [value("word-1"), value("word-2"), value("word-3")],
      actions: {
        breathe: isChecked("action-breathe"),
        ground: isChecked("action-ground"),
        window: isChecked("action-window"),
        call: isChecked("action-call"),
        water: isChecked("action-water"),
        go: isChecked("action-go"),
        wait: isChecked("action-wait"),
        custom: isChecked("action-custom"),
      },
      callPerson: value("call-person"),
      goPlace: value("go-place"),
      customAction: value("custom-action"),
    });
  }

  function updateDraftFromForm() {
    if (state.route !== "prepare") return;
    state.draft = readDraftFromForm();
    var preview = document.getElementById("scene-preview");
    if (preview) preview.textContent = composeScene(state.draft);
    persistDraftSoon();
  }

  function selectedActions(draft) {
    var actions = [];
    if (draft.actions.breathe) actions.push("跟着圆圈轻轻呼吸");
    if (draft.actions.ground) actions.push("把注意力放回眼前");
    if (draft.actions.window) actions.push("走到窗边");
    if (draft.actions.call) actions.push(draft.callPerson ? "给" + draft.callPerson + "打电话" : "给信任的人打电话");
    if (draft.actions.water) actions.push("喝一口温水");
    if (draft.actions.go) actions.push(draft.goPlace ? "去" + draft.goPlace : "去一个熟悉的地方");
    if (draft.actions.wait) actions.push("什么都不做，只是等");
    if (draft.actions.custom && draft.customAction) actions.push(draft.customAction);
    if (!actions.length) actions.push("什么都不做，只是等");
    return actions;
  }

  function localDateString() {
    var now = new Date();
    var year = String(now.getFullYear());
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function canvasFont(size, family, weight) {
    return String(weight || 400) + " " + String(Math.round(size)) + "px " + family;
  }

  function wrapCanvasText(context, text, maxWidth) {
    var paragraphs = String(text || "").split("\n");
    var lines = [];
    paragraphs.forEach(function (paragraph) {
      var characters = Array.from(paragraph);
      var line = "";
      if (!characters.length) {
        lines.push("");
        return;
      }
      characters.forEach(function (character) {
        var trial = line + character;
        if (line && context.measureText(trial).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line = trial;
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
    var lines = wrapCanvasText(context, text, maxWidth);
    lines.forEach(function (line, index) {
      context.fillText(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  }

  function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function drawCardContent(context, draft, scale, shouldDraw) {
    var sans = '"PingFang SC", "Microsoft YaHei", sans-serif';
    var serif = '"Songti SC", "STSong", serif';
    var x = 94;
    var maxWidth = 892;
    var y = 102;
    var words = draft.words.filter(function (word) { return Boolean(word); });
    if (!words.length) words = DEFAULT_WORDS.slice();
    var actions = selectedActions(draft);
    var anchor = draft.anchor || "窗边的一点光";
    var scene = composeScene(draft);
    var titleSize = 70 * scale;
    var bodySize = 51 * scale;
    var actionSize = 42 * scale;
    var labelSize = 37 * scale;
    var bodyLine = 70 * scale;
    var labelLine = 50 * scale;
    var sectionGap = 30 * scale;

    function setText(font, color) {
      context.font = font;
      context.textBaseline = "top";
      if (shouldDraw) context.fillStyle = color;
    }

    function measureLines(text, width) {
      return wrapCanvasText(context, text, width).length;
    }

    setText(canvasFont(titleSize, serif, 500), "#ebe6db");
    if (shouldDraw) context.fillText("给发作时的我", x, y);
    y += 92 * scale;

    setText(canvasFont(29 * scale, sans, 600), "#9eaaa4");
    if (shouldDraw) context.fillText("面对 · 接受 · 飘然 · 等它过去", x, y);
    y += 66 * scale;

    if (shouldDraw) {
      context.fillStyle = "rgba(235,230,219,0.20)";
      context.fillRect(x, y, maxWidth, Math.max(1, 2 * scale));
    }
    y += 42 * scale;

    function sectionLabel(label) {
      setText(canvasFont(labelSize, sans, 600), "#9eaaa4");
      if (shouldDraw) context.fillText(label, x, y);
      y += labelLine;
    }

    sectionLabel("我的锚点");
    setText(canvasFont(58 * scale, serif, 500), "#ebe6db");
    if (shouldDraw) y = drawWrappedText(context, anchor, x, y, maxWidth, 76 * scale);
    else y += measureLines(anchor, maxWidth) * 76 * scale;
    y += sectionGap;

    sectionLabel("我熟悉的地方");
    setText(canvasFont(bodySize, serif, 400), "#d8d2c6");
    if (shouldDraw) y = drawWrappedText(context, scene, x, y, maxWidth, bodyLine);
    else y += measureLines(scene, maxWidth) * bodyLine;
    y += sectionGap;

    sectionLabel("我想对自己说");
    setText(canvasFont(bodySize, serif, 400), "#ebe6db");
    words.forEach(function (word) {
      if (shouldDraw) {
        context.fillStyle = "#829a91";
        context.beginPath();
        context.arc(x + 8 * scale, y + 27 * scale, 5 * scale, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ebe6db";
        y = drawWrappedText(context, word, x + 30 * scale, y, maxWidth - 30 * scale, bodyLine);
      } else {
        y += measureLines(word, maxWidth - 30 * scale) * bodyLine;
      }
      y += 12 * scale;
    });
    y += 12 * scale;

    sectionLabel("到时可以做");
    setText(canvasFont(actionSize, sans, 500), "#d8d2c6");
    var rowHeight = 60 * scale;
    actions.forEach(function (action, index) {
      var column = index % 2;
      var row = Math.floor(index / 2);
      var actionX = x + column * 455;
      var actionY = y + row * rowHeight;
      if (shouldDraw) {
        context.fillStyle = "#829a91";
        context.fillText("·", actionX, actionY);
        context.fillStyle = "#d8d2c6";
        context.fillText(action, actionX + 25 * scale, actionY);
      }
    });
    y += Math.ceil(actions.length / 2) * rowHeight;
    return y;
  }

  function generateCardDataUrl(draft) {
    var canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    var context = canvas.getContext("2d");
    if (!context) return "";

    var background = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    background.addColorStop(0, "#25282c");
    background.addColorStop(0.55, "#1a1c20");
    background.addColorStop(1, "#1c1a17");
    context.fillStyle = background;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    var halo = context.createRadialGradient(880, 190, 0, 880, 190, 360);
    halo.addColorStop(0, "rgba(130,154,145,0.16)");
    halo.addColorStop(1, "rgba(130,154,145,0)");
    context.fillStyle = halo;
    context.fillRect(500, 0, 580, 600);

    context.strokeStyle = "rgba(235,230,219,0.11)";
    context.lineWidth = 2;
    roundedRect(context, 58, 58, 964, 1804, 52);
    context.stroke();

    context.font = canvasFont(51, '"Songti SC", "STSong", serif', 400);
    var measuredBottom = drawCardContent(context, draft, 1, false);
    var footerTop = 1660;
    var available = footerTop - 102;
    var scale = measuredBottom > available ? Math.max(0.84, available / measuredBottom) : 1;
    drawCardContent(context, draft, scale, true);

    context.fillStyle = "rgba(235,230,219,0.18)";
    context.fillRect(94, footerTop, 892, 2);
    context.textBaseline = "top";
    context.font = canvasFont(39, '"PingFang SC", "Microsoft YaHei", sans-serif', 500);
    context.fillStyle = "#9eaaa4";
    context.fillText("写于 " + localDateString() + "，那天我状态很好", 94, footerTop + 38);
    context.font = canvasFont(44, '"Songti SC", "STSong", serif', 400);
    context.fillStyle = "#d8d2c6";
    context.fillText("平静不是假的；它一直是我身上的", 94, footerTop + 102);
    context.fillText("另一种可能。", 94, footerTop + 157);
    return canvas.toDataURL("image/png");
  }

  function setSaveStatus(message) {
    var status = document.getElementById("save-status");
    if (status) status.textContent = message;
  }

  async function saveCardToAlbum(button) {
    if (!state.cardDataUrl || button.disabled) return;
    button.disabled = true;
    button.textContent = "正在保存…";
    setSaveStatus("");

    var bridge = window.xhs && window.xhs.miniTool;
    if (!bridge || typeof bridge.writeTempFile !== "function" || typeof bridge.saveImageToPhotosAlbum !== "function") {
      setSaveStatus("图片已经生成。当前是浏览器预览，请长按上面的卡片保存，或使用系统截图。");
      button.disabled = false;
      button.textContent = "保存到相册";
      return;
    }

    try {
      var temporary = await bridge.writeTempFile({ data: state.cardDataUrl });
      if (!temporary || !temporary.filePath) throw new Error("未取得临时图片路径");
      await bridge.saveImageToPhotosAlbum({ filePath: temporary.filePath });
      state.cardSaved = true;
      setSaveStatus("已保存到相册。");
      button.textContent = "已经保存";
      var note = document.createElement("div");
      note.className = "after-save-note";
      note.textContent = "把它放进相册收藏，或者设成锁屏。发作时不用找工具，翻相册就行。";
      button.parentNode.appendChild(note);
    } catch (error) {
      setSaveStatus("没有保存成功。你仍可以用系统截图留下这张卡，再检查相册权限后重试。");
      button.disabled = false;
      button.textContent = "再试一次";
    }
  }

  function resetEmergencyRun() {
    state.groundIndex = 0;
    state.waitStartedAt = null;
    state.waitAcknowledged = false;
  }

  app.addEventListener("click", function (event) {
    var control = event.target.closest("[data-action]");
    if (!control) return;
    var action = control.getAttribute("data-action");
    var next = control.getAttribute("data-next");

    if (action === "start") {
      resetEmergencyRun();
      navigate("face");
    } else if (action === "prepare") {
      navigate("prepare");
    } else if (action === "understand") {
      navigate("understand");
    } else if (action === "next" || action === "skip") {
      if (next === "wait" && !state.waitStartedAt) state.waitStartedAt = Date.now();
      navigate(next);
    } else if (action === "words") {
      navigate("words");
    } else if (action === "ground-next") {
      if (state.groundIndex < GROUNDING_STEPS.length - 1) {
        state.groundIndex += 1;
        updateGroundingStep();
      } else {
        if (!state.waitStartedAt) state.waitStartedAt = Date.now();
        navigate("wait");
      }
    } else if (action === "wait-more") {
      state.waitAcknowledged = true;
      var acknowledgement = document.getElementById("wait-acknowledgement");
      if (acknowledgement) acknowledgement.textContent = "好。我们不赶时间。";
    } else if (action === "wait-done") {
      navigate("words");
    } else if (action === "wait-again") {
      if (!state.waitStartedAt) state.waitStartedAt = Date.now();
      navigate("wait");
    } else if (action === "home") {
      resetEmergencyRun();
      navigate("home");
    } else if (action === "edit-card") {
      navigate("prepare");
    } else if (action === "save-card") {
      saveCardToAlbum(control);
    } else if (action === "return") {
      navigate(state.returnRoute || "home");
    }
  });

  app.addEventListener("input", updateDraftFromForm);
  app.addEventListener("change", updateDraftFromForm);
  app.addEventListener("submit", function (event) {
    if (event.target.id !== "prepare-form") return;
    event.preventDefault();
    state.draft = readDraftFromForm();
    persistDraftSoon();
    state.cardDataUrl = generateCardDataUrl(state.draft);
    state.cardSaved = false;
    if (state.cardDataUrl) navigate("card");
  });

  document.addEventListener("click", function (event) {
    var control = event.target.closest("[data-global-action]");
    if (!control) return;
    if (control.getAttribute("data-global-action") === "help") {
      state.returnRoute = state.route;
      navigate("help");
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearRuntimeTimers();
    } else if (state.route === "breathe") {
      startBreathingGuide();
    } else if (state.route === "wait") {
      startWaitClock();
    }
  });

  window.addEventListener("resize", setAppHeight);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", setAppHeight);
  setAppHeight();
  navigate("home", true);

  window.__ANDING_CARD__ = {
    version: "0.1.0",
    getRoute: function () { return state.route; },
    getGroundIndex: function () { return state.groundIndex; },
    getCardSize: function () { return { width: CARD_WIDTH, height: CARD_HEIGHT }; },
    getWaitMessage: waitMessageFor,
    generateCard: function () {
      state.cardDataUrl = generateCardDataUrl(state.draft);
      return state.cardDataUrl;
    },
  };
}());
