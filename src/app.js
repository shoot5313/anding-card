(function () {
  "use strict";

  var app = document.getElementById("app");
  var STORAGE_KEY = "anding-card-draft-v1";
  var CARD_WIDTH = 1080;
  var CARD_HEIGHT = 1920;
  var transitionTimer = null;
  var breathingTimer = null;
  var breathingTouchTimer = null;
  var activeBreathingControl = null;
  var suppressBreathingClick = false;
  var groundingAnimationTimer = null;
  var waitTimer = null;
  var waitActivityTimer = null;
  var fogDrawing = false;
  var fogLastPoint = null;
  var fogDistance = 0;
  var cacheTimer = null;
  var navigating = false;

  var LEGACY_DEFAULT_WORDS = [
    "怕也没关系，不用把它赶走。",
    "这些感觉很难受，但感觉不是命令。",
    "先把这一分钟交给时间；下一分钟来了，再过下一分钟。",
  ];

  var DEFAULT_WORDS = [
    "那又怎样？",
    "我以前都挺过去了，这次也会的。",
    "我能处理。按照自己的步调，一次一小步。",
  ];

  var LIVED_EXTRA_WORDS = [
    "我正在学着与焦虑和恐惧做朋友。",
    "惊恐，来吧。你可以在这里，我也在这里。",
    "来吧，惊恐。你就这点本事吗？",
  ];

  var PRACTICE_OPTIONS = {
    feet: {
      label: "脚底碰着地面",
      prompt: "脚底和地面接触时，最像下面哪一个？",
      qualities: ["硬", "软", "有压力", "说不清"],
    },
    hands: {
      label: "手心的温度",
      prompt: "手心现在最像下面哪一个？",
      qualities: ["有点凉", "有点暖", "微微潮", "说不清"],
    },
    sound: {
      label: "远处一个声音",
      prompt: "那个声音现在最像下面哪一个？",
      qualities: ["持续着", "一阵一阵", "很远", "说不清"],
    },
  };

  var DEFAULT_DRAFT = {
    anchor: "",
    scenePlace: "",
    sceneTemperature: "",
    sceneSound: "",
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

  var GROUNDING_POOLS = {
    see: [
      { sense: "看见", prompt: "找一样有直边的东西。它是什么？", button: "找到了" },
      { sense: "看见", prompt: "找一样圆的，或带弧线的东西。它是什么？", button: "找到了" },
      { sense: "看见", prompt: "找一个上面有字的地方。最短的词是什么？", button: "找到了" },
      { sense: "看见", prompt: "找两样颜色不同的东西。是哪两种颜色？", button: "找到了" },
      { sense: "看见", prompt: "先看最远的一样，再看最近的一样。写下其中一个。", button: "都找到了" },
      { sense: "看见", prompt: "找一个影子、亮点或反光。它落在哪里？", button: "找到了" },
      { sense: "看见", prompt: "找一样比手掌小的东西。它是什么？", button: "找到了" },
      { sense: "看见", prompt: "扫一眼四周，找一样能移动的东西。它是什么？", button: "找到了" },
    ],
    touch: [
      { sense: "触碰", prompt: "摸一样有纹理的东西，停三秒。是什么手感？", button: "摸过了" },
      { sense: "触碰", prompt: "碰一下身边的东西。它比手背凉还是暖？", button: "碰到了" },
      { sense: "触碰", prompt: "用脚踩一下地面。它硬还是软？", button: "踩到了" },
      { sense: "触碰", prompt: "捏一下衣角。它是薄、厚、软，还是硬？", button: "碰到了" },
      { sense: "触碰", prompt: "把掌心压在身边的平面上，停三秒。", button: "压住了" },
      { sense: "触碰", prompt: "找一个边角，用手指沿着它走一小段。", button: "走完了" },
    ],
    hear: [
      { sense: "听见", prompt: "找一个最远的声音。它从哪里来？", button: "听到了" },
      { sense: "听见", prompt: "找一个持续着的声音。跟着它听三秒。", button: "听过了" },
      { sense: "听见", prompt: "找一个来自左边或右边的声音。", button: "找到了" },
      { sense: "听见", prompt: "写下你现在所在的地方。再听一听自己的声音。", button: "听到了" },
      { sense: "听见", prompt: "找一个刚才没留意到的小声音。", button: "找到了" },
    ],
    smell: [
      { sense: "闻到", prompt: "找一种气味。没有明显气味，也可以写“没有”。", button: "闻过了" },
      { sense: "闻到", prompt: "闻一下衣袖或手边的东西。它像什么？", button: "闻过了" },
      { sense: "闻到", prompt: "留意这一口气经过鼻尖时，有没有气味。", button: "留意了" },
    ],
    taste: [
      { sense: "尝到", prompt: "留意嘴里现在的味道。说不出来，也可以写“没有”。", button: "留意了" },
      { sense: "尝到", prompt: "动一下舌头，找一个最明显的味道。没有也算。", button: "找过了" },
    ],
  };

  function takeRandom(source, count) {
    var copy = source.slice();
    for (var index = copy.length - 1; index > 0; index -= 1) {
      var swapIndex = Math.floor(Math.random() * (index + 1));
      var value = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = value;
    }
    return copy.slice(0, count);
  }

  function createGroundingRun() {
    return takeRandom(GROUNDING_POOLS.see, 5)
      .concat(takeRandom(GROUNDING_POOLS.touch, 4))
      .concat(takeRandom(GROUNDING_POOLS.hear, 3))
      .concat(takeRandom(GROUNDING_POOLS.smell, 2))
      .concat(takeRandom(GROUNDING_POOLS.taste, 1));
  }

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

  var WAIT_WINDOW_POSITIONS = ["左上", "右上", "左下", "右下"];

  function randomWaitWindowTarget(exclude) {
    var choices = [0, 1, 2, 3].filter(function (index) {
      return index !== exclude;
    });
    return choices[Math.floor(Math.random() * choices.length)];
  }

  var state = {
    route: "home",
    returnRoute: "home",
    prepareReturnRoute: "home",
    understandReturnRoute: "home",
    need: "",
    orientStep: 0,
    position: "",
    groundIndex: 0,
    groundSteps: createGroundingRun(),
    groundUsedPrompts: [],
    groundAnswers: [],
    waitStartedAt: null,
    waitAcknowledged: false,
    waitSupportIndex: -1,
    supportWordIndex: 0,
    waitActivity: "windows",
    waitWindowTarget: randomWaitWindowTarget(-1),
    waitWindowRound: 0,
    learnLayer: "",
    practiceStep: 0,
    practiceFocus: "",
    practiceQuality: "",
    reflection: {
      fear: "",
      meaning: "",
      reality: "",
      next: "",
    },
    reflectionDone: false,
    reflectionStatus: "",
    draft: loadDraft(),
    cardDataUrl: "",
    cardSaved: false,
  };

  state.groundUsedPrompts = state.groundSteps.map(function (step) {
    return step.prompt;
  });

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

  function sameWords(left, right) {
    if (!Array.isArray(left) || left.length !== right.length) return false;
    for (var index = 0; index < right.length; index += 1) {
      if (left[index] !== right[index]) return false;
    }
    return true;
  }

  function migrateLegacyDefaults(draft) {
    var hasLegacyMemoryExample = draft.anchor === "窗台上的绿萝"
      && draft.scenePlace === "靠窗的沙发上"
      && draft.sceneTemperature === "空气微凉"
      && draft.sceneSound === "雨落在遮雨棚上";
    if (hasLegacyMemoryExample) {
      draft.anchor = DEFAULT_DRAFT.anchor;
      draft.scenePlace = DEFAULT_DRAFT.scenePlace;
      draft.sceneTemperature = DEFAULT_DRAFT.sceneTemperature;
      draft.sceneSound = DEFAULT_DRAFT.sceneSound;
    }
    if (sameWords(draft.words, LEGACY_DEFAULT_WORDS)) draft.words = DEFAULT_WORDS.slice();
    return draft;
  }

  function loadDraft() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return migrateLegacyDefaults(normalizeDraft(JSON.parse(saved)));
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
    if (activeBreathingControl) {
      activeBreathingControl.classList.remove("is-held");
      activeBreathingControl.classList.remove("is-releasing");
    }
    activeBreathingControl = null;
    suppressBreathingClick = false;
    if (breathingTimer) {
      window.clearTimeout(breathingTimer);
      breathingTimer = null;
    }
    if (breathingTouchTimer) {
      window.clearTimeout(breathingTouchTimer);
      breathingTouchTimer = null;
    }
    if (groundingAnimationTimer) {
      window.clearTimeout(groundingAnimationTimer);
      groundingAnimationTimer = null;
    }
    if (waitTimer) {
      window.clearInterval(waitTimer);
      waitTimer = null;
    }
    if (waitActivityTimer) {
      window.clearTimeout(waitActivityTimer);
      waitActivityTimer = null;
    }
    fogDrawing = false;
    fogLastPoint = null;
    fogDistance = 0;
  }

  function setAppHeight() {
    var height = window.innerHeight;
    if (window.visualViewport && window.visualViewport.height) {
      height = window.visualViewport.height;
    }
    document.documentElement.style.setProperty("--app-height", Math.round(height) + "px");
    var answerFocused = document.activeElement && document.activeElement.id === "ground-answer";
    document.documentElement.classList.toggle("ground-keyboard-open", Boolean(answerFocused && height < 520));
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
      : '<button class="quiet-link" type="button" data-action="words">直接看给我的话&nbsp;→</button>';
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
      secondary || (nextRoute ? '<button class="quiet-link" type="button" data-action="skip" data-next="' + escapeHtml(nextRoute) + '">跳过这步&nbsp;→</button>' : ""),
      "</div>",
      "</section>",
    ].join("");
  }

  function renderHome() {
    return [
      '<section class="screen home">',
      '<header class="home__brand">',
      '<h1 class="home-title">缓一缓</h1>',
      '<p class="home-subtitle">它会过去</p>',
      "</header>",
      '<div class="home__main">',
      '<div class="emergency-button-wrap">',
      '<button class="emergency-button" type="button" data-action="start">我现在<br>很难受</button>',
      "</div>",
      '<p class="home-note">我也经历过惊恐。现在不用读说明，按下去，一次只做一件事。</p>',
      '<div class="home__secondary">',
      '<button class="secondary-button" type="button" data-action="calm">我现在还好</button>',
      '<button class="text-button" type="button" data-action="understand">先了解一下&nbsp;→</button>',
      "</div>",
      "</div>",
      "</section>",
    ].join("");
  }

  function innerPageNav(backAction, backLabel, eyebrow) {
    return [
      '<nav class="page-nav">',
      '<button class="page-back" type="button" data-action="', escapeHtml(backAction), '">',
      escapeHtml(backLabel),
      "</button>",
      '<span class="eyebrow">', escapeHtml(eyebrow), "</span>",
      "</nav>",
    ].join("");
  }

  function renderCalmHome() {
    return [
      '<section class="screen screen-scroll calm-hub">',
      innerPageNav("home", "回到首页", "状态好时"),
      '<header class="calm-hub__intro">',
      '<span class="calm-hub__kicker">我现在还好</span>',
      '<h1>现在不用急着做什么。<br>时间是你的。</h1>',
      '<p>可以看懂一点，也可以只留一句话给下一次。这里没有必须完成的顺序。</p>',
      "</header>",
      '<div class="calm-ledger" aria-label="平时可以做的事">',
      '<button class="calm-entry" type="button" data-action="open-learn">',
      '<span class="calm-entry__mark">理解</span>',
      '<span class="calm-entry__text"><strong>看懂它</strong><small>先从“为什么越怕越响”开始</small></span>',
      '<span class="calm-entry__arrow" aria-hidden="true">打开&nbsp;→</span>',
      "</button>",
      '<button class="calm-entry" type="button" data-action="open-practice">',
      '<span class="calm-entry__mark">练习</span>',
      '<span class="calm-entry__text"><strong>平时练一小步</strong><small>练习看见感觉，不急着处理</small></span>',
      '<span class="calm-entry__arrow" aria-hidden="true">打开&nbsp;→</span>',
      "</button>",
      '<button class="calm-entry" type="button" data-action="prepare">',
      '<span class="calm-entry__mark">准备</span>',
      '<span class="calm-entry__text"><strong>做自己的卡</strong><small>留下锚点、场景和真正相信的话</small></span>',
      '<span class="calm-entry__arrow" aria-hidden="true">打开&nbsp;→</span>',
      "</button>",
      '<button class="calm-entry" type="button" data-action="open-reflection">',
      '<span class="calm-entry__mark">回看</span>',
      '<span class="calm-entry__text"><strong>走过之后想一想</strong><small>把“我以为”与“后来发生”放在一起</small></span>',
      '<span class="calm-entry__arrow" aria-hidden="true">打开&nbsp;→</span>',
      "</button>",
      "</div>",
      '<p class="calm-hub__leave">不需要全部做完。看一页也算，随时可以离开。</p>',
      "</section>",
    ].join("");
  }

  function renderLearn() {
    return [
      '<section class="screen screen-scroll learning-index">',
      innerPageNav("calm", "回到平时", "看懂它"),
      '<header class="learning-index__intro">',
      '<h1>先弄懂一个<br>真正卡住你的地方。</h1>',
      '<p>不是考试，也不需要一次读完。每篇只回答一个问题。</p>',
      "</header>",
      '<button class="featured-note" type="button" data-action="open-learn-article">',
      '<span class="featured-note__meta">第一篇 · 第二层恐惧</span>',
      '<strong>“那又怎样？”<br>不是逞强</strong>',
      '<span>身体刚响了一声，脑子里的第二声警报为什么会跟上来？</span>',
      '<i aria-hidden="true">读这一篇 →</i>',
      "</button>",
      '<button class="brief-link" type="button" data-action="open-understand">',
      '<span><strong>先知道最基本的三件事</strong><small>身体警报、第二层恐惧、它会变化</small></span>',
      '<span aria-hidden="true">→</span>',
      "</button>",
      '<section class="learning-coming">',
      '<span class="eyebrow">接下来慢慢写</span>',
      '<ul>',
      '<li>接受不是认输，是不再跟身体拔河</li>',
      '<li>“飘然”不是强迫自己放松</li>',
      '<li>症状又来了，不等于回到原点</li>',
      "</ul>",
      "</section>",
      '<section class="quiet-bookshelf">',
      '<span class="eyebrow">这些书会成为线索</span>',
      '<p>《焦虑症的自救》 · 《直视骄阳》 · 《心湖上的倒影》 · 《世界上最快乐的人》 · 《庄子》</p>',
      '<small>书不是答案。这里会保留真正有用的部分，也会删掉过时、绝对或让人羞耻的说法。</small>',
      "</section>",
      "</section>",
    ].join("");
  }

  function learnLayerCopy() {
    if (state.learnLayer === "first") {
      return "这是第一声：身体和情绪正在发生反应。先只描述它，不急着替它解释。";
    }
    if (state.learnLayer === "second") {
      return "这是第二声：脑子开始解释、预测并催你立刻处理。它可能继续把警报抬高。";
    }
    return "点一下两句话，看看它们做的事有什么不同。";
  }

  function renderLearnArticle() {
    return [
      '<section class="screen screen-scroll note-article">',
      innerPageNav("open-learn", "回到看懂它", "个人阅读笔记"),
      '<article>',
      '<header class="note-article__header">',
      '<span>第二层恐惧</span>',
      '<h1>“那又怎样？”<br>不是逞强</h1>',
      '<p>惊恐最难受的地方，往往不只是一阵心跳、发麻或眩晕。身体刚响了一声，脑子里的第二声警报就跟上来了。</p>',
      "</header>",
      '<section class="note-section">',
      '<h2>两声警报</h2>',
      '<p>克莱尔·威克斯给了我一个很有用的分法。第一层是身体和情绪本来的反应；第二层，是我开始害怕这些反应，盯着它们，催它们消失，再把每一次波动解释成危险。</p>',
      '<div class="fear-layer-demo">',
      '<button class="', state.learnLayer === "first" ? "is-selected" : "", '" type="button" data-action="learn-layer" data-layer="first" aria-pressed="', state.learnLayer === "first" ? "true" : "false", '"><span>第一声</span><strong>心跳突然变快</strong></button>',
      '<button class="', state.learnLayer === "second" ? "is-selected" : "", '" type="button" data-action="learn-layer" data-layer="second" aria-pressed="', state.learnLayer === "second" ? "true" : "false", '"><span>第二声</span><strong>它是不是要出事？</strong></button>',
      '<p id="learn-layer-copy" aria-live="polite">', escapeHtml(learnLayerCopy()), "</p>",
      "</div>",
      '<p>这个模型不是对所有症状的诊断，却能解释我为什么会越怕越响：我不只在经历感觉，还在害怕自己正在经历感觉。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>它在回答什么</h2>',
      '<p>“那又怎样”不是说身体怎样都无所谓，也不是拿一句狠话证明自己不怕。我是在回答第二声警报：我听见你说最坏的事情要发生了，但我不必马上检查、逃开，也不必强迫自己立刻平静。</p>',
      '<blockquote class="personal-line">怕可以在这里，<br>我也可以在这里。</blockquote>',
      "</section>",
      '<section class="note-section note-questions">',
      '<h2>下次先问三句</h2>',
      '<ol>',
      '<li>现在最响的是哪一种感觉？</li>',
      '<li>我又在害怕它意味着什么？</li>',
      '<li>第二个问题，能不能先不解决？</li>',
      "</ol>",
      '<p>“那又怎样”没有替我赶走惊恐。它只是让我不再继续给惊恐添一层惊恐。对我来说，这不是逞强，而是把一点选择权拿回来。</p>',
      "</section>",
      '<aside class="note-boundary">第一次出现的症状，或与以往明显不同的症状，仍然应该交给医生判断。</aside>',
      '<footer class="note-source">阅读线索：克莱尔·威克斯《焦虑症的自救》。本文是个人阅读笔记与经验整理，不替代诊断和治疗。</footer>',
      "</article>",
      '<div class="article-actions">',
      '<button class="primary-button" type="button" data-action="open-practice">平时练一小步</button>',
      '<button class="secondary-button" type="button" data-action="open-learn">回到全部内容</button>',
      "</div>",
      "</section>",
    ].join("");
  }

  function practiceOption() {
    return PRACTICE_OPTIONS[state.practiceFocus] || PRACTICE_OPTIONS.feet;
  }

  function renderPractice() {
    var content = "";
    if (state.practiceStep === 0) {
      content = [
        '<header class="calm-tool__intro">',
        '<span class="eyebrow">平时练一小步</span>',
        '<h1>不是练到不怕。<br>只练习先不处理。</h1>',
        '<p>选一样此刻很轻、很普通的感觉。不诱发症状，也不用坚持。</p>',
        "</header>",
        '<div class="practice-choices">',
        '<button type="button" data-action="practice-focus" data-focus="feet">脚底碰着地面</button>',
        '<button type="button" data-action="practice-focus" data-focus="hands">手心的温度</button>',
        '<button type="button" data-action="practice-focus" data-focus="sound">远处一个声音</button>',
        "</div>",
      ].join("");
    } else if (state.practiceStep === 1) {
      var option = practiceOption();
      var qualities = option.qualities.map(function (quality) {
        return '<button type="button" data-action="practice-quality" data-quality="' + escapeHtml(quality) + '">' + escapeHtml(quality) + "</button>";
      }).join("");
      content = [
        '<header class="calm-tool__intro">',
        '<span class="eyebrow">只说能确认的事实</span>',
        '<h1>', escapeHtml(option.label), "</h1>",
        '<p>', escapeHtml(option.prompt), "</p>",
        "</header>",
        '<div class="quality-choices">', qualities, "</div>",
      ].join("");
    } else {
      content = [
        '<div class="practice-result">',
        '<span class="practice-result__mark" aria-hidden="true"></span>',
        '<p>你刚才注意到</p>',
        '<h1>“', escapeHtml(state.practiceQuality), '”</h1>',
        '<p>你没有负责把它变成别的感觉，只是看见了它。这一小步练的不是放松，而是感觉出现时，先不急着服从警报。</p>',
        '<blockquote>那又怎样？<br>它可以先在这里。</blockquote>',
        "</div>",
        '<div class="calm-tool__actions">',
        '<button class="primary-button" type="button" data-action="practice-restart">再练一个</button>',
        '<button class="secondary-button" type="button" data-action="calm">练到这里就好</button>',
        "</div>",
      ].join("");
    }
    return [
      '<section class="screen screen-scroll calm-tool">',
      innerPageNav("calm", "回到平时", "不用做对"),
      content,
      state.practiceStep < 2
        ? '<div class="practice-exit"><button class="quiet-link" type="button" data-action="practice-emergency">现在开始难受了&nbsp;→</button><span>只在状态平稳时练；明显不适就停。</span></div>'
        : "",
      "</section>",
    ].join("");
  }

  function reflectionItem(label, value) {
    if (!value) return "";
    return '<div class="reflection-item"><span>' + escapeHtml(label) + "</span><p>" + escapeHtml(value) + "</p></div>";
  }

  function renderReflection() {
    if (state.reflectionDone) {
      return [
        '<section class="screen screen-scroll reflection-page">',
        innerPageNav("calm", "回到平时", "走过之后"),
        '<header class="reflection-page__intro">',
        '<h1>把两件事<br>放在一起看。</h1>',
        '<p>当时的担心是真的很响；后来实际发生的事，也值得留下来。</p>',
        "</header>",
        '<div class="reflection-sheet">',
        reflectionItem("当时最吓我的", state.reflection.fear),
        reflectionItem("我以为会发生", state.reflection.meaning),
        reflectionItem("后来实际发生", state.reflection.reality),
        reflectionItem("我想留给下次", state.reflection.next),
        "</div>",
        '<p class="reflection-privacy">这不是成绩，也不会形成次数或时长记录。</p>',
        '<div class="calm-tool__actions">',
        '<button class="primary-button" type="button" data-action="reflection-reset">重新写一次</button>',
        '<button class="secondary-button" type="button" data-action="calm">回到平时</button>',
        "</div>",
        "</section>",
      ].join("");
    }
    return [
      '<section class="screen screen-scroll reflection-page">',
      innerPageNav("calm", "回到平时", "走过之后"),
      '<header class="reflection-page__intro">',
      '<h1>不是复盘表现。<br>只看发生了什么。</h1>',
      '<p>不用写完整。内容只留在这次打开里，不会保存成发作记录。</p>',
      "</header>",
      '<form class="reflection-form" id="reflection-form">',
      '<label><span>刚才最吓我的是什么？</span><textarea id="reflection-fear" maxlength="120" placeholder="一个感觉、念头或画面">', escapeHtml(state.reflection.fear), "</textarea></label>",
      '<label><span>我当时以为会发生什么？</span><textarea id="reflection-meaning" maxlength="120" placeholder="例如：我怕自己会失控">', escapeHtml(state.reflection.meaning), "</textarea></label>",
      '<label><span>后来实际发生了什么？</span><textarea id="reflection-reality" maxlength="120" placeholder="只写事实，不用总结得很好">', escapeHtml(state.reflection.reality), "</textarea></label>",
      '<label><span>现在想留给下次一句什么？</span><textarea id="reflection-next" maxlength="80" placeholder="也可以借用：那又怎样？">', escapeHtml(state.reflection.next), "</textarea></label>",
      '<button class="primary-button" type="submit">把它们放在一起</button>',
      '<p class="reflection-status" id="reflection-status" aria-live="polite">', escapeHtml(state.reflectionStatus), "</p>",
      "</form>",
      "</section>",
    ].join("");
  }

  function renderCheckin() {
    return [
      '<section class="screen screen-calm screen-choice">',
      flowNav("先看最响的一个", true),
      '<div class="screen-calm__body">',
      '<h1 class="choice-title">现在最抢注意力的是哪一种？</h1>',
      '<p class="support-copy">不用找一个准确的名字。哪个最响，就先告诉我哪个。</p>',
      '<div class="choice-grid">',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="heart"><span>心跳很快</span><small>身体反应很响</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="breath"><span>呼吸很乱</span><small>总觉得吸不够</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="unreal"><span>周围不真实</span><small>像隔着一层</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="control"><span>怕会失控</span><small>怕自己撑不住</small></button>',
      "</div>",
      '<button class="quiet-link choice-unclear" type="button" data-action="choose-need" data-need="unclear">说不清，直接陪我&nbsp;→</button>',
      "</div>",
      "</section>",
    ].join("");
  }

  function renderOrient() {
    if (state.orientStep === 0) {
      return [
        '<section class="screen screen-calm screen-choice">',
        flowNav("先接住身体", true),
        '<div class="screen-calm__body">',
        '<h1 class="choice-title">你现在坐着，还是站着？</h1>',
        '<p class="support-copy">不用改变姿势，先告诉我就好。</p>',
        '<div class="choice-row">',
        '<button class="choice-button" type="button" data-action="choose-position" data-position="sitting"><span>坐着</span></button>',
        '<button class="choice-button" type="button" data-action="choose-position" data-position="standing"><span>站着</span></button>',
        "</div>",
        '<button class="quiet-link choice-unclear" type="button" data-action="choose-position" data-position="unclear">现在说不清&nbsp;→</button>',
        "</div>",
        "</section>",
      ].join("");
    }

    var instruction = state.position === "standing"
      ? "如果方便，坐下来，或让身体靠住一样东西。"
      : state.position === "sitting"
        ? "让背后、手边或脚下的一样东西托住你一点。"
        : "让脚或手碰住一样不会移动的东西。";
    return [
      '<section class="screen screen-calm screen-choice">',
      flowNav("先接住身体", true),
      '<div class="screen-calm__body">',
      '<h1 class="choice-title">', escapeHtml(instruction), "</h1>",
      '<p class="support-copy">不用做到标准，只找一个接触点。</p>',
      '<div class="choice-row">',
      '<button class="choice-button" type="button" data-action="orient-ready"><span>碰到了</span></button>',
      '<button class="choice-button" type="button" data-action="orient-ready"><span>现在不方便</span></button>',
      "</div>",
      "</div>",
      "</section>",
    ].join("");
  }

  function routeForNeed() {
    if (state.need === "breath") return "breathe";
    if (state.need === "unreal") return "ground";
    return "accept";
  }

  function renderAccept() {
    var title = "不用赶走这些感觉。";
    var copy = "先让熟悉的惊恐反应待在这儿。不需要立刻解决，也不需要现在就好起来。";
    if (state.need === "heart") {
      title = "心跳很响。先不替它下结论。";
      copy = "让心脏自己跳一会儿，不用检查每一下，也不用现在证明身体发生了什么。";
    } else if (state.need === "control") {
      title = "“会失控”是一个很吓人的念头。";
      copy = "先把它当成一个念头，不把它当成命令。此刻只留意身体和什么东西接触着。";
    }
    var body = [
      '<h1 class="display-title">', escapeHtml(title), "</h1>",
      '<p class="support-copy">', escapeHtml(copy), "</p>",
      renderLivedVoice(),
    ].join("");
    return calmScreen("接受", body, "我先让它在这儿", "next", "ground");
  }

  function supportWordsForCurrentRun() {
    return currentWords().concat(LIVED_EXTRA_WORDS);
  }

  function currentSupportWord() {
    var words = supportWordsForCurrentRun();
    return words[state.supportWordIndex % words.length];
  }

  function renderLivedVoice() {
    return [
      '<aside class="lived-voice">',
      '<span class="lived-voice__label">我以前也在这种时候，这样对自己说</span>',
      '<p class="lived-voice__word" id="lived-support-word">“',
      escapeHtml(currentSupportWord()),
      '”</p>',
      '<button class="lived-voice__swap" type="button" data-action="support-swap">换一句&nbsp;↻</button>',
      "</aside>",
    ].join("");
  }

  function renderBreathe() {
    var title = state.need === "breath"
      ? "别吸满。只让一小口气进来。"
      : "圆圈跟着你，不用你跟它。";
    var response = state.need === "breath"
      ? "短短按住，再松开。让呼气自己慢下来。"
      : "按住时吸，松开时呼。按多久都可以。";
    var body = [
      '<div class="breathing-stage">',
      '<div class="breathing-orbit">',
      '<button class="breathing-circle" type="button" data-action="breath-touch" aria-label="按住时吸气，松开时呼气">',
      '<span class="breathing-label" id="breathing-label">按住</span>',
      '</button>',
      "</div>",
      '<h1 class="display-title">', escapeHtml(title), "</h1>",
      '<p class="support-copy breathing-response" id="breathing-response" aria-live="polite">', escapeHtml(response), "</p>",
      "</div>",
    ].join("");
    return calmScreen("飘然", body, "够了，下一步", "next", "ground");
  }

  function renderGround() {
    var step = state.groundSteps[state.groundIndex] || state.groundSteps[0];
    var answerEcho = groundingAnswerEcho();
    var body = [
      '<div class="grounding-object grounding-object--',
      groundingVisualClass(step.sense),
      '" id="grounding-object" aria-hidden="true"><span class="grounding-object__shape"></span></div>',
      '<span class="grounding-sense" id="grounding-sense">',
      escapeHtml(step.sense),
      "</span>",
      '<h1 class="grounding-prompt" id="grounding-prompt" aria-live="polite">',
      escapeHtml(step.prompt),
      "</h1>",
      '<div class="grounding-answer-wrap">',
      '<label class="visually-hidden" for="ground-answer">写下你找到的答案</label>',
      '<input class="grounding-answer" id="ground-answer" type="text" maxlength="16" autocomplete="off" autocapitalize="off" enterkeyhint="done" spellcheck="false" placeholder="',
      escapeHtml(groundingAnswerPlaceholder(step.sense)),
      '">',
      '<p class="grounding-answer-echo" id="ground-answer-echo" aria-live="polite">',
      escapeHtml(answerEcho),
      "</p>",
      "</div>",
    ].join("");
    var secondary = [
      '<div class="grounding-secondary">',
      '<button class="quiet-link" type="button" data-action="ground-swap" aria-label="当前任务不合适，换一个同类任务">换一个&nbsp;↻</button>',
      '<button class="quiet-link" type="button" data-action="skip" data-next="wait">跳过这步&nbsp;→</button>',
      "</div>",
    ].join("");
    return calmScreen("落地", body, step.button, "ground-next", "", secondary)
      .replace("screen screen-calm", "screen screen-calm screen-ground");
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

  function renderWaitWindows() {
    var windows = WAIT_WINDOW_POSITIONS.map(function (position, index) {
      var isLit = index === state.waitWindowTarget;
      return [
        '<button class="wait-window',
        isLit ? " is-lit" : "",
        '" type="button" data-action="wait-window" data-window="',
        String(index),
        '" aria-label="',
        escapeHtml(position + "方的窗" + (isLit ? "，现在亮着" : "")),
        '">',
        '<span class="wait-window__pane" aria-hidden="true"><span></span></span>',
        "</button>",
      ].join("");
    }).join("");
    return [
      '<div class="wait-activity wait-windows" id="wait-activity">',
      '<p class="wait-activity__prompt">看哪一扇窗慢慢亮起来，点那一整格。</p>',
      '<div class="wait-window-grid" id="wait-window-grid">', windows, "</div>",
      '<p class="wait-activity__status" id="wait-activity-status" aria-live="polite">不用抢。亮着的那扇会等你。</p>',
      "</div>",
    ].join("");
  }

  function renderWaitFog() {
    return [
      '<div class="wait-activity wait-fog" id="wait-activity">',
      '<p class="wait-activity__prompt">手指放在哪里都可以，慢慢擦开一小片。</p>',
      '<button class="fog-board" id="wait-fog-board" type="button" data-action="fog-reveal" aria-describedby="wait-activity-status" aria-label="擦开雾气。按住并移动手指，或按空格擦开中间一片">',
      '<span class="fog-scene" aria-hidden="true">',
      '<span class="fog-horizon"></span>',
      '<span class="fog-ripple fog-ripple--one"></span>',
      '<span class="fog-ripple fog-ripple--two"></span>',
      "</span>",
      '<canvas id="wait-fog-canvas" aria-hidden="true"></canvas>',
      "</button>",
      '<p class="wait-activity__status" id="wait-activity-status" aria-live="polite">不用擦完整。手指走过的地方会留下来。</p>',
      "</div>",
    ].join("");
  }

  function renderWaitActivity() {
    return state.waitActivity === "fog" ? renderWaitFog() : renderWaitWindows();
  }

  function renderWait() {
    if (!state.waitStartedAt) state.waitStartedAt = Date.now();
    var seconds = elapsedWaitSeconds();
    var recentAnswers = state.groundAnswers.slice(-3).map(function (entry) {
      return entry.answer;
    }).join(" · ");
    var body = [
      '<div class="wait-stage">',
      '<div class="wait-elapsed">已经过去 <span id="wait-timer" aria-label="已经过去 ',
      String(seconds),
      ' 秒">',
      formatElapsed(seconds),
      "</span></div>",
      renderWaitActivity(),
      "</div>",
      recentAnswers ? '<p class="grounding-recall">刚才你真的找到过：' + escapeHtml(recentAnswers) + "</p>" : "",
      '<h1 class="wait-copy" id="wait-copy">',
      escapeHtml(waitMessageFor(seconds)),
      "</h1>",
      '<p class="wait-acknowledgement" id="wait-acknowledgement">',
      state.waitAcknowledged ? escapeHtml(currentWaitSupportMessage()) : "",
      "</p>",
    ].join("");
    var secondary = [
      '<div class="wait-action-row">',
      '<button class="quiet-link" type="button" data-action="wait-switch" aria-label="换一种等待时的小活动">换一种&nbsp;↻</button>',
      '<button class="quiet-link" type="button" data-action="wait-more">再给我一句&nbsp;→</button>',
      "</div>",
    ].join("");
    return calmScreen("让时间过去", body, "它退了", "wait-done", "", secondary)
      .replace("screen screen-calm", "screen screen-calm screen-wait");
  }

  function waitSupportMessages() {
    var messages = supportWordsForCurrentRun().map(function (word) {
      return "“" + word + "”";
    });
    if (state.draft.anchor) {
      messages.push("想一眼“" + state.draft.anchor + "”。不用把画面想完整。");
    }
    messages.push("我记得：惊恐退下去以后，胸口会重新平静。");
    return messages;
  }

  function currentWaitSupportMessage() {
    var messages = waitSupportMessages();
    if (state.waitSupportIndex < 0) return "";
    return messages[state.waitSupportIndex % messages.length];
  }

  function currentWords() {
    var words = state.draft.words.filter(function (word) {
      return Boolean(cleanText(word, 32));
    });
    return words.length ? words : DEFAULT_WORDS.slice();
  }

  function renderWords() {
    var words = currentWords();
    var usesDefaultWords = sameWords(words, DEFAULT_WORDS);
    var list = words.map(function (word) {
      return "<li>" + escapeHtml(word) + "</li>";
    }).join("");
    var body = [
      '<h1 class="display-title">给现在的你</h1>',
      '<p class="words-intro">',
      usesDefaultWords
        ? "这些不是临时拼出来的安慰。我也经历过惊恐，它们是我曾经真正说给自己的话。"
        : "这是状态好时的你，真正留给现在的自己的话。如果做过卡片，现在也可以去相册找它。",
      "</p>",
      '<ul class="words-list">',
      list,
      "</ul>",
      '<aside class="words-memory">',
      '<span>我记得</span>',
      '<p>惊恐退下去后，胸口像岩浆起伏后终于归于平静。那个镇定、有勇气的自己也是真的。</p>',
      "</aside>",
    ].join("");
    var secondary = '<button class="quiet-link" type="button" data-action="wait-again">再陪我等一会儿&nbsp;→</button>';
    return calmScreen("你的话", body, "回到开头", "home", "", secondary, false)
      .replace("screen screen-calm", "screen screen-calm screen-words");
  }

  function checked(value) {
    return value ? " checked" : "";
  }

  function renderPrepare() {
    var draft = state.draft;
    var prepareBackLabel = state.prepareReturnRoute === "calm" ? "回到平时" : "回到首页";
    return [
      '<section class="screen screen-scroll">',
      innerPageNav("prepare-back", prepareBackLabel, "状态好时再写"),
      '<h1 class="page-title">现在的你，比发作时的你更清楚该说什么。</h1>',
      '<p class="page-lead">写给那个时候的自己。想不到时，先借一个真实例子看看，再慢慢换成你自己的。</p>',
      '<form class="prepare-form" id="prepare-form">',
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>一个锚点</h2><span class="field-label">一眼能认出来</span></div>',
      '<p class="form-section__hint">一个词、一个物件、一个画面。</p>',
      '<label class="field-label" for="anchor">我的锚点</label>',
      '<input class="text-field" id="anchor" name="anchor" maxlength="16" value="', escapeHtml(draft.anchor), '" placeholder="例如：雨天的假山">',
      '<div class="example-block">',
      '<span class="example-block__label">这是我的例子，不一定是你的</span>',
      '<div class="example-chips">',
      '<button class="example-chip" type="button" data-action="use-anchor-example" data-value="雨天的假山">雨天的假山</button>',
      '<button class="example-chip" type="button" data-action="use-anchor-example" data-value="第一次看见海">第一次看见海</button>',
      '<button class="example-chip" type="button" data-action="use-anchor-example" data-value="刚走进游戏房时">刚走进游戏房时</button>',
      "</div>",
      "</div>",
      "</section>",
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>一个安全场景</h2><span class="field-label">三小句就够</span></div>',
      '<div class="field-stack">',
      '<label><span class="field-label">你在哪？</span><input class="text-field" id="scene-place" maxlength="18" value="', escapeHtml(draft.scenePlace), '" placeholder="雪天的公园湖边"></label>',
      '<label><span class="field-label">什么温度？</span><input class="text-field" id="scene-temperature" maxlength="18" value="', escapeHtml(draft.sceneTemperature), '" placeholder="空气很冷，雪在落"></label>',
      '<label><span class="field-label">什么声音？</span><input class="text-field" id="scene-sound" maxlength="18" value="', escapeHtml(draft.sceneSound), '" placeholder="家人朋友在随便聊天"></label>',
      "</div>",
      '<p class="scene-preview" id="scene-preview">', escapeHtml(composeScene(draft)), "</p>",
      '<div class="scene-example">',
      '<span class="example-block__label">这是我的一个真实例子</span>',
      '<p>我在雪天的公园湖边。空气很冷，雪在落。我能听见家人朋友在随便聊天。</p>',
      '<button type="button" data-action="use-scene-example">借这个例子试试&nbsp;→</button>',
      "</div>",
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
      '<button class="primary-button" type="submit">生成给自己的卡片</button>',
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
      '<div class="card-preview-wrap"><img class="card-preview" src="', state.cardDataUrl, '" alt="给发作时的我的卡片"></div>',
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
      innerPageNav("understand-back", state.understandReturnRoute === "learn" ? "回到看懂它" : "回到首页", "先知道这些就够"),
      '<h1 class="page-title">惊恐很响，解释可以很短。</h1>',
      '<section class="info-section"><h2>这是什么</h2><p>惊恐发作像身体警报突然拉响：心跳变快、呼吸急、发麻或发晕都可能一起出现。感受很强，但仍要先排除身体原因。</p></section>',
      '<section class="info-section"><h2>为什么越来越怕</h2><p>身体反应是一层；“这些感觉是不是危险”的担心又加一层。越盯着它、越想立刻赶走它，恐惧可能被继续放大。</p></section>',
      '<section class="info-section"><h2>它会过去</h2><p>强烈感觉通常会自行缓下来，但每个人持续时间不同。不要拿十分钟当倒计时，也不必用时长证明自己做得好不好。</p></section>',
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
    else if (state.route === "calm") markup = renderCalmHome();
    else if (state.route === "learn") markup = renderLearn();
    else if (state.route === "learn-article") markup = renderLearnArticle();
    else if (state.route === "practice") markup = renderPractice();
    else if (state.route === "reflection") markup = renderReflection();
    else if (state.route === "checkin") markup = renderCheckin();
    else if (state.route === "orient") markup = renderOrient();
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

  function restartClassAnimation(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function touchBreathingCircle() {
    var circle = document.querySelector(".breathing-circle");
    var response = document.getElementById("breathing-response");
    if (!circle || !response) return;
    if (breathingTouchTimer) window.clearTimeout(breathingTouchTimer);
    restartClassAnimation(circle, "is-touched");
    response.textContent = "圆圈收到了。下次可以按住，再松开。";
    breathingTouchTimer = window.setTimeout(function () {
      if (state.route !== "breathe") return;
      circle.classList.remove("is-touched");
      response.textContent = state.need === "breath"
        ? "短短按住，再松开。让呼气自己慢下来。"
        : "按住时吸，松开时呼。按多久都可以。";
    }, 1600);
  }

  function beginBreathHold(control) {
    if (state.route !== "breathe" || !control) return;
    if (breathingTimer) window.clearTimeout(breathingTimer);
    suppressBreathingClick = true;
    activeBreathingControl = control;
    control.classList.remove("is-releasing");
    control.classList.add("is-held");
    var label = document.getElementById("breathing-label");
    var response = document.getElementById("breathing-response");
    if (label) label.textContent = "吸";
    if (response) {
      response.textContent = state.need === "breath"
        ? "只吸一点，不用把胸口装满。"
        : "圆圈正跟着你的手指长大。";
    }
  }

  function endBreathHold() {
    var control = activeBreathingControl;
    if (!control) return;
    activeBreathingControl = null;
    control.classList.remove("is-held");
    control.classList.add("is-releasing");
    var label = document.getElementById("breathing-label");
    var response = document.getElementById("breathing-response");
    if (label) label.textContent = "呼";
    if (response) response.textContent = "松开就好。不用把气呼尽。";
    breathingTimer = window.setTimeout(function () {
      if (state.route !== "breathe") return;
      control.classList.remove("is-releasing");
      if (label) label.textContent = "按住";
    }, 6000);
  }

  function groundingVisualClass(sense) {
    if (sense === "触碰") return "touch";
    if (sense === "听见") return "hear";
    if (sense === "闻到") return "smell";
    if (sense === "尝到") return "taste";
    return "see";
  }

  function groundingPoolForSense(sense) {
    if (sense === "触碰") return GROUNDING_POOLS.touch;
    if (sense === "听见") return GROUNDING_POOLS.hear;
    if (sense === "闻到") return GROUNDING_POOLS.smell;
    if (sense === "尝到") return GROUNDING_POOLS.taste;
    return GROUNDING_POOLS.see;
  }

  function groundingAnswerPlaceholder(sense) {
    if (sense === "触碰") return "例如：粗糙、微凉";
    if (sense === "听见") return "例如：空调声";
    if (sense === "闻到") return "例如：洗衣液，或没有";
    if (sense === "尝到") return "例如：淡淡的甜，或没有";
    return "例如：窗框";
  }

  function groundingAnswerEcho() {
    if (!state.groundAnswers.length) {
      return "找到后，写一个词。不方便输入，也可以直接继续。";
    }
    var latest = state.groundAnswers[state.groundAnswers.length - 1];
    var tails = {
      "看见": ["你真的把它从眼前找出来了。", "好，眼前这个东西被你看见了。"],
      "触碰": ["你的手替你回答了。", "好，你刚才真的碰到了它。"],
      "听见": ["你刚才真的停下来听了。", "好，你把这个声音找出来了。"],
      "闻到": ["有或没有都算，你已经留意过了。", "好，这就是你此刻闻到的。"],
      "尝到": ["有或没有都算，你已经留意过了。", "好，这就是你此刻尝到的。"],
    };
    var choices = tails[latest.sense] || ["好，这是你刚才真的找到的。"];
    var tail = choices[(state.groundAnswers.length - 1) % choices.length];
    return "「" + latest.answer + "」。" + tail;
  }

  function recordGroundingAnswer() {
    var field = document.getElementById("ground-answer");
    var step = state.groundSteps[state.groundIndex];
    if (!field || !step) return "";
    var answer = cleanText(field.value, 16);
    if (!answer) return "";
    state.groundAnswers.push({ sense: step.sense, answer: answer });
    return answer;
  }

  function updateGroundingAnswerInput(event) {
    if (!event.target || event.target.id !== "ground-answer") return;
    var button = app.querySelector('[data-action="ground-next"]');
    var step = state.groundSteps[state.groundIndex];
    if (!button || !step) return;
    button.textContent = cleanText(event.target.value, 16) ? "写好了，继续" : step.button;
  }

  function swapGroundingStep() {
    var current = state.groundSteps[state.groundIndex];
    if (!current) return;
    var pool = groundingPoolForSense(current.sense);
    var unavailable = {};
    state.groundSteps.forEach(function (step) {
      unavailable[step.prompt] = true;
    });
    state.groundUsedPrompts.forEach(function (prompt) {
      unavailable[prompt] = true;
    });
    var candidates = pool.filter(function (step) {
      return !unavailable[step.prompt];
    });

    if (!candidates.length) {
      var usedElsewhere = {};
      state.groundSteps.forEach(function (step, index) {
        if (index !== state.groundIndex) usedElsewhere[step.prompt] = true;
      });
      candidates = pool.filter(function (step) {
        return step.prompt !== current.prompt && !usedElsewhere[step.prompt];
      });
    }

    if (!candidates.length) return;
    var replacement = candidates[Math.floor(Math.random() * candidates.length)];
    state.groundSteps[state.groundIndex] = replacement;
    if (state.groundUsedPrompts.indexOf(replacement.prompt) === -1) {
      state.groundUsedPrompts.push(replacement.prompt);
    }
    updateGroundingStep();
  }

  function startBreathingGuide() {
    var label = document.getElementById("breathing-label");
    var circle = document.querySelector(".breathing-circle");
    if (!label) return;
    if (circle) {
      circle.classList.remove("is-held");
      circle.classList.remove("is-releasing");
    }
    label.textContent = "按住";
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
    startWaitActivity();
  }

  function startWaitActivity() {
    if (state.waitActivity === "fog") {
      initializeWaitFog();
      return;
    }
    if (state.waitWindowTarget < 0) state.waitWindowTarget = randomWaitWindowTarget(-1);
    updateWaitWindows();
  }

  function updateWaitWindows() {
    var buttons = document.querySelectorAll('[data-action="wait-window"]');
    Array.prototype.forEach.call(buttons, function (button) {
      var index = Number(button.getAttribute("data-window"));
      var isLit = index === state.waitWindowTarget;
      button.classList.toggle("is-lit", isLit);
      button.classList.remove("is-received");
      button.setAttribute("aria-label", WAIT_WINDOW_POSITIONS[index] + "方的窗" + (isLit ? "，现在亮着" : ""));
    });
  }

  function chooseWaitWindow(control) {
    if (state.route !== "wait" || state.waitActivity !== "windows" || state.waitWindowTarget < 0) return;
    var chosen = Number(control.getAttribute("data-window"));
    var status = document.getElementById("wait-activity-status");
    if (chosen !== state.waitWindowTarget) {
      if (status) status.textContent = "再看一眼。亮着的那扇还在等你。";
      return;
    }

    var previous = state.waitWindowTarget;
    var receivedMessages = [
      "接住了。下一扇会自己亮起来。",
      "看见了。再等一扇慢慢亮起来。",
      "就在这里。下一扇不着急。",
    ];
    state.waitWindowRound += 1;
    state.waitWindowTarget = -1;
    control.classList.remove("is-lit");
    control.classList.add("is-received");
    if (status) status.textContent = receivedMessages[(state.waitWindowRound - 1) % receivedMessages.length];
    if (waitActivityTimer) window.clearTimeout(waitActivityTimer);
    waitActivityTimer = window.setTimeout(function () {
      waitActivityTimer = null;
      if (state.route !== "wait" || state.waitActivity !== "windows") return;
      state.waitWindowTarget = randomWaitWindowTarget(previous);
      updateWaitWindows();
    }, 680);
  }

  function initializeWaitFog() {
    var canvas = document.getElementById("wait-fog-canvas");
    var board = document.getElementById("wait-fog-board");
    if (!canvas || !board) return;
    var width = Math.max(1, Math.round(board.clientWidth));
    var height = Math.max(1, Math.round(board.clientHeight));
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    var context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    var mist = context.createLinearGradient(0, 0, width, height);
    mist.addColorStop(0, "#303537");
    mist.addColorStop(0.52, "#252a2c");
    mist.addColorStop(1, "#343533");
    context.fillStyle = mist;
    context.fillRect(0, 0, width, height);
    for (var index = 0; index < 18; index += 1) {
      context.fillStyle = index % 2 === 0 ? "rgba(235,230,219,0.025)" : "rgba(130,154,145,0.025)";
      context.beginPath();
      context.arc((index * 53 + 19) % width, (index * 31 + 17) % height, 1 + index % 3, 0, Math.PI * 2);
      context.fill();
    }
    fogDrawing = false;
    fogLastPoint = null;
    fogDistance = 0;
  }

  function waitFogPoint(event, board) {
    var source = event.touches && event.touches[0] ? event.touches[0] : event;
    if (typeof source.clientX !== "number" || typeof source.clientY !== "number") return null;
    var bounds = board.getBoundingClientRect();
    return { x: source.clientX - bounds.left, y: source.clientY - bounds.top };
  }

  function clearWaitFog(point, previous) {
    var canvas = document.getElementById("wait-fog-canvas");
    if (!canvas || !point) return;
    var context = canvas.getContext("2d");
    if (!context) return;
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 96;
    context.beginPath();
    if (previous) context.moveTo(previous.x, previous.y);
    else context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.arc(point.x, point.y, 48, 0, Math.PI * 2);
    context.fill();
    context.restore();

    if (previous) {
      fogDistance += Math.sqrt(Math.pow(point.x - previous.x, 2) + Math.pow(point.y - previous.y, 2));
    } else {
      fogDistance += 48;
    }
    var status = document.getElementById("wait-activity-status");
    if (!status) return;
    if (fogDistance > 520) status.textContent = "已经擦开一片了。还想继续，就慢慢继续。";
    else if (fogDistance > 170) status.textContent = "下面的水纹露出来了。手指可以走得很慢。";
  }

  function beginWaitFog(event, board) {
    if (state.route !== "wait" || state.waitActivity !== "fog") return;
    if (event.cancelable) event.preventDefault();
    fogDrawing = true;
    fogLastPoint = null;
    if (window.PointerEvent && typeof board.setPointerCapture === "function" && typeof event.pointerId === "number") {
      try {
        board.setPointerCapture(event.pointerId);
      } catch (error) {
        fogDrawing = true;
      }
    }
    var point = waitFogPoint(event, board);
    clearWaitFog(point, null);
    fogLastPoint = point;
  }

  function continueWaitFog(event, board) {
    if (!fogDrawing || state.route !== "wait" || state.waitActivity !== "fog") return;
    if (event.cancelable) event.preventDefault();
    var point = waitFogPoint(event, board);
    if (!point) return;
    clearWaitFog(point, fogLastPoint);
    fogLastPoint = point;
  }

  function endWaitFog() {
    fogDrawing = false;
    fogLastPoint = null;
  }

  function revealFogForKeyboard() {
    var board = document.getElementById("wait-fog-board");
    if (!board) return;
    var center = { x: board.clientWidth / 2, y: board.clientHeight / 2 };
    clearWaitFog(center, { x: center.x - 70, y: center.y + 18 });
  }

  function updateGroundingStep() {
    var step = state.groundSteps[state.groundIndex];
    var object = document.getElementById("grounding-object");
    var sense = document.getElementById("grounding-sense");
    var prompt = document.getElementById("grounding-prompt");
    var button = app.querySelector('[data-action="ground-next"]');
    var answer = document.getElementById("ground-answer");
    var answerEcho = document.getElementById("ground-answer-echo");
    if (!step || !object || !sense || !prompt || !button) return;
    if (groundingAnimationTimer) window.clearTimeout(groundingAnimationTimer);
    object.className = "grounding-object grounding-object--" + groundingVisualClass(step.sense);
    restartClassAnimation(object, "is-settling");
    sense.textContent = step.sense;
    prompt.textContent = step.prompt;
    restartClassAnimation(prompt, "is-settling");
    button.textContent = step.button;
    if (answer) {
      answer.value = "";
      answer.setAttribute("placeholder", groundingAnswerPlaceholder(step.sense));
    }
    if (answerEcho) answerEcho.textContent = groundingAnswerEcho();
    groundingAnimationTimer = window.setTimeout(function () {
      object.classList.remove("is-settling");
      prompt.classList.remove("is-settling");
    }, 460);
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
    var anchor = draft.anchor || "还没写，也没关系";
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
    context.fillText("我记得它退下去以后，胸口会重新平静。", 94, footerTop + 102);
    context.fillText("那个镇定、有勇气的自己也是真的。", 94, footerTop + 157);
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

  function addTouchEcho(event) {
    var target = event.target && event.target.closest
      ? event.target.closest("button, a")
      : null;
    if (!target || target.disabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var point = event.touches && event.touches[0] ? event.touches[0] : event;
    if (typeof point.clientX !== "number" || typeof point.clientY !== "number") return;
    var shell = document.getElementById("app-shell");
    if (!shell) return;
    var bounds = shell.getBoundingClientRect();
    var echo = document.createElement("span");
    echo.className = "touch-echo";
    echo.style.left = String(point.clientX - bounds.left) + "px";
    echo.style.top = String(point.clientY - bounds.top) + "px";
    shell.appendChild(echo);
    window.setTimeout(function () {
      if (echo.parentNode) echo.parentNode.removeChild(echo);
    }, 1000);
  }

  function handleInteractionStart(event) {
    var breathControl = event.target && event.target.closest
      ? event.target.closest('[data-action="breath-touch"]')
      : null;
    if (breathControl) beginBreathHold(breathControl);
    var fogBoard = event.target && event.target.closest
      ? event.target.closest("#wait-fog-board")
      : null;
    if (fogBoard) beginWaitFog(event, fogBoard);
  }

  function handleInteractionMove(event) {
    var fogBoard = event.target && event.target.closest
      ? event.target.closest("#wait-fog-board")
      : null;
    if (fogBoard) continueWaitFog(event, fogBoard);
  }

  function resetPractice() {
    state.practiceStep = 0;
    state.practiceFocus = "";
    state.practiceQuality = "";
  }

  function emptyReflection() {
    return { fear: "", meaning: "", reality: "", next: "" };
  }

  function readReflectionFromForm() {
    function value(id, maxLength) {
      var field = document.getElementById(id);
      return cleanText(field ? field.value : "", maxLength);
    }
    return {
      fear: value("reflection-fear", 120),
      meaning: value("reflection-meaning", 120),
      reality: value("reflection-reality", 120),
      next: value("reflection-next", 80),
    };
  }

  function updateReflectionFromForm() {
    if (state.route !== "reflection" || state.reflectionDone) return;
    state.reflection = readReflectionFromForm();
    state.reflectionStatus = "";
  }

  function resetEmergencyRun() {
    state.need = "";
    state.orientStep = 0;
    state.position = "";
    state.groundIndex = 0;
    state.groundSteps = createGroundingRun();
    state.groundUsedPrompts = state.groundSteps.map(function (step) {
      return step.prompt;
    });
    state.groundAnswers = [];
    state.waitStartedAt = null;
    state.waitAcknowledged = false;
    state.waitSupportIndex = -1;
    state.supportWordIndex = 0;
    state.waitActivity = "windows";
    state.waitWindowTarget = randomWaitWindowTarget(-1);
    state.waitWindowRound = 0;
  }

  app.addEventListener("click", function (event) {
    var control = event.target.closest("[data-action]");
    if (!control) return;
    var action = control.getAttribute("data-action");
    var next = control.getAttribute("data-next");

    if (action === "start") {
      resetEmergencyRun();
      navigate("checkin");
    } else if (action === "calm") {
      navigate("calm");
    } else if (action === "open-learn") {
      navigate("learn");
    } else if (action === "open-learn-article") {
      state.learnLayer = "";
      navigate("learn-article");
    } else if (action === "learn-layer") {
      state.learnLayer = control.getAttribute("data-layer") || "";
      var layerButtons = app.querySelectorAll('[data-action="learn-layer"]');
      Array.prototype.forEach.call(layerButtons, function (button) {
        var selected = button.getAttribute("data-layer") === state.learnLayer;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      var layerCopy = document.getElementById("learn-layer-copy");
      if (layerCopy) layerCopy.textContent = learnLayerCopy();
    } else if (action === "open-practice") {
      resetPractice();
      navigate("practice");
    } else if (action === "practice-focus") {
      state.practiceFocus = control.getAttribute("data-focus") || "feet";
      state.practiceStep = 1;
      render();
    } else if (action === "practice-quality") {
      state.practiceQuality = control.getAttribute("data-quality") || "说不清";
      state.practiceStep = 2;
      render();
    } else if (action === "practice-restart") {
      resetPractice();
      render();
    } else if (action === "practice-emergency") {
      resetEmergencyRun();
      navigate("checkin");
    } else if (action === "open-reflection") {
      navigate("reflection");
    } else if (action === "reflection-reset") {
      state.reflection = emptyReflection();
      state.reflectionDone = false;
      state.reflectionStatus = "";
      render();
    } else if (action === "prepare") {
      state.prepareReturnRoute = state.route === "calm" ? "calm" : "home";
      navigate("prepare");
    } else if (action === "understand") {
      state.understandReturnRoute = state.route;
      navigate("understand");
    } else if (action === "open-understand") {
      state.understandReturnRoute = state.route;
      navigate("understand");
    } else if (action === "prepare-back") {
      navigate(state.prepareReturnRoute || "home");
    } else if (action === "understand-back") {
      navigate(state.understandReturnRoute || "home");
    } else if (action === "choose-need") {
      state.need = control.getAttribute("data-need") || "unclear";
      state.orientStep = 0;
      navigate("orient");
    } else if (action === "choose-position") {
      state.position = control.getAttribute("data-position") || "unclear";
      state.orientStep = 1;
      navigate("orient");
    } else if (action === "orient-ready") {
      navigate(routeForNeed());
    } else if (action === "support-swap") {
      var supportWords = supportWordsForCurrentRun();
      state.supportWordIndex = (state.supportWordIndex + 1) % supportWords.length;
      var supportWord = document.getElementById("lived-support-word");
      if (supportWord) supportWord.textContent = "“" + currentSupportWord() + "”";
    } else if (action === "use-anchor-example") {
      var anchorField = document.getElementById("anchor");
      if (anchorField) {
        anchorField.value = control.getAttribute("data-value") || "";
        updateDraftFromForm();
      }
    } else if (action === "use-scene-example") {
      var placeField = document.getElementById("scene-place");
      var temperatureField = document.getElementById("scene-temperature");
      var soundField = document.getElementById("scene-sound");
      if (placeField && temperatureField && soundField) {
        placeField.value = "雪天的公园湖边";
        temperatureField.value = "空气很冷，雪在落";
        soundField.value = "家人朋友在随便聊天";
        updateDraftFromForm();
      }
    } else if (action === "breath-touch") {
      if (suppressBreathingClick) suppressBreathingClick = false;
      else touchBreathingCircle();
    } else if (action === "next" || action === "skip") {
      if (action === "skip" && state.route === "ground") recordGroundingAnswer();
      if (next === "wait" && !state.waitStartedAt) state.waitStartedAt = Date.now();
      navigate(next);
    } else if (action === "words") {
      navigate("words");
    } else if (action === "ground-swap") {
      swapGroundingStep();
    } else if (action === "ground-next") {
      recordGroundingAnswer();
      if (state.groundIndex < state.groundSteps.length - 1) {
        state.groundIndex += 1;
        updateGroundingStep();
      } else {
        if (!state.waitStartedAt) state.waitStartedAt = Date.now();
        navigate("wait");
      }
    } else if (action === "wait-window") {
      chooseWaitWindow(control);
    } else if (action === "wait-switch") {
      state.waitActivity = state.waitActivity === "windows" ? "fog" : "windows";
      if (state.waitActivity === "windows") {
        state.waitWindowTarget = randomWaitWindowTarget(state.waitWindowTarget);
      }
      navigate("wait", true);
    } else if (action === "fog-reveal") {
      if (event.detail === 0) revealFogForKeyboard();
    } else if (action === "wait-more") {
      state.waitAcknowledged = true;
      state.waitSupportIndex += 1;
      var acknowledgement = document.getElementById("wait-acknowledgement");
      if (acknowledgement) acknowledgement.textContent = currentWaitSupportMessage();
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

  app.addEventListener("input", function (event) {
    updateDraftFromForm();
    updateReflectionFromForm();
    updateGroundingAnswerInput(event);
  });
  app.addEventListener("change", updateDraftFromForm);
  app.addEventListener("keydown", function (event) {
    if (!event.target || event.target.id !== "ground-answer" || event.key !== "Enter") return;
    event.preventDefault();
    var button = app.querySelector('[data-action="ground-next"]');
    if (button) button.click();
  });
  app.addEventListener("focusin", function (event) {
    if (event.target && event.target.id === "ground-answer") setAppHeight();
  });
  app.addEventListener("focusout", function (event) {
    if (!event.target || event.target.id !== "ground-answer") return;
    window.setTimeout(setAppHeight, 0);
  });
  app.addEventListener("submit", function (event) {
    if (event.target.id === "prepare-form") {
      event.preventDefault();
      state.draft = readDraftFromForm();
      persistDraftSoon();
      state.cardDataUrl = generateCardDataUrl(state.draft);
      state.cardSaved = false;
      if (state.cardDataUrl) navigate("card");
    } else if (event.target.id === "reflection-form") {
      event.preventDefault();
      state.reflection = readReflectionFromForm();
      var hasReflection = state.reflection.fear
        || state.reflection.meaning
        || state.reflection.reality
        || state.reflection.next;
      if (!hasReflection) {
        state.reflectionStatus = "随便写下一小句就可以。";
        var reflectionStatus = document.getElementById("reflection-status");
        if (reflectionStatus) reflectionStatus.textContent = state.reflectionStatus;
        return;
      }
      state.reflectionDone = true;
      state.reflectionStatus = "";
      render();
    }
  });

  document.addEventListener("click", function (event) {
    var control = event.target.closest("[data-global-action]");
    if (!control) return;
    if (control.getAttribute("data-global-action") === "help") {
      state.returnRoute = state.route;
      navigate("help");
    }
  });

  var interactionStartEvent = window.PointerEvent ? "pointerdown" : "touchstart";
  var interactionMoveEvent = window.PointerEvent ? "pointermove" : "touchmove";
  var interactionEndEvent = window.PointerEvent ? "pointerup" : "touchend";
  app.addEventListener(interactionStartEvent, handleInteractionStart);
  app.addEventListener(interactionMoveEvent, handleInteractionMove);
  document.addEventListener(interactionEndEvent, function () {
    endBreathHold();
    endWaitFog();
  });
  if (window.PointerEvent) document.addEventListener("pointercancel", function () {
    endBreathHold();
    endWaitFog();
  });
  document.addEventListener(interactionStartEvent, addTouchEcho);

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
    getNeed: function () { return state.need; },
    getGroundIndex: function () { return state.groundIndex; },
    getGroundCount: function () { return state.groundSteps.length; },
    getCardSize: function () { return { width: CARD_WIDTH, height: CARD_HEIGHT }; },
    getWaitMessage: waitMessageFor,
    generateCard: function () {
      state.cardDataUrl = generateCardDataUrl(state.draft);
      return state.cardDataUrl;
    },
  };
}());
