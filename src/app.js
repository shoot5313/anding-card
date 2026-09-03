(function () {
  "use strict";

  var app = document.getElementById("app");
  var STORAGE_KEY = "anding-card-draft-v1";
  var TRIVIA_STORAGE_KEY = "anding-card-trivia-seen-v1";
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
  var fogVisited = {};
  var fogComplete = false;
  var fogKeyboardStep = 0;
  var cacheTimer = null;
  var navigating = false;

  var LEGACY_DEFAULT_WORD_SETS = [
    [
      "怕也没关系，不用把它赶走。",
      "这些感觉很难受，但感觉不是命令。",
      "先把这一分钟交给时间；下一分钟来了，再过下一分钟。",
    ],
    [
      "那又怎样？",
      "我以前都挺过去了，这次也会的。",
      "我能处理。按照自己的步调，一次一小步。",
    ],
  ];

  var DEFAULT_WORDS = [
    "怕可以在这里，我也可以在这里。",
    "我以前都挺过去了，这次也会的。",
    "我能处理。按照自己的步调，一次一小步。",
  ];

  var LIVED_EXTRA_WORDS = [
    "哦，是你。来吧，老朋友，坐一会儿。",
    "惊恐想夺取我全部注意力，我偏要留一点给眼前。",
    "感觉很强，结论可以晚一点。",
    "它催它的，我照自己的步调走。",
    "老朋友，你先坐着。我把这一分钟过完。",
    "怕着也能往前走，这就是我正在练的功夫。",
    "今天少检查一次，这回就练到了一步。",
    "今天少逃一步，这一步会留在脚下。",
    "这一阵会变化，我留在这里亲眼看看。",
    "每走过一回，我手里就多一份经验。",
    "来都来了，让我看看你还有什么花样。",
    "惊恐可以待着，我继续做眼前这一件事。",
    "这一分钟先过完。下一分钟来了，再接着走。",
    "哪怕只松开一点点，也值得我鼓励自己。",
    "来吧，惊恐。你就这点本事吗？",
    "那又怎样？我听见了，先让它坐会儿。",
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
      { sense: "看见", prompt: "环顾四周，找一样有直边的东西。它是什么？", button: "找到了" },
      { sense: "看见", prompt: "环顾四周，找一样圆的，或带弧线的东西。它是什么？", button: "找到了" },
      { sense: "看见", prompt: "环顾四周，找一个上面有字的地方。最短的词是什么？", button: "找到了" },
      { sense: "看见", prompt: "环顾四周，找两样颜色不同的东西。是哪两种颜色？", button: "找到了" },
      { sense: "看见", prompt: "看看四周，先看最远的一样，再看最近的一样。写下其中一个。", button: "都找到了" },
      { sense: "看见", prompt: "环顾四周，找一个影子、亮点或反光。它落在哪里？", button: "找到了" },
      { sense: "看见", prompt: "环顾四周，找一样比手掌小的东西。它是什么？", button: "找到了" },
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
    { at: 0, text: "先待在这里。我陪你等这阵感觉慢慢变化。" },
    { at: 60, text: "一分钟过去了。你还在。" },
    { at: 120, text: "强烈的感觉通常会爬到一个高处，再慢慢往下走。你可能还在上坡，也可能已经越过最高处。" },
    { at: 180, text: "它可以继续待一会儿。先别追着每一个感觉跑。" },
    { at: 300, text: "五分钟过去了。时间一直在往前。" },
    { at: 480, text: "八分钟了。这条路没有标准速度，数字先放在一边。" },
    { at: 600, text: "十分钟。感觉还强也好，已经松一点也好，此刻是什么样就是什么样。" },
    { at: 900, text: "十五分钟。等你自己觉得可以了，再按“它退了”。" },
  ];

  var WAIT_WINDOW_POSITIONS = ["左上", "右上", "左下", "右下"];
  var WAIT_WINDOW_MIN_LENGTH = 3;
  var WAIT_WINDOW_MAX_LENGTH = 6;
  var WAIT_WINDOW_COUNT_WORDS = { 3: "三", 4: "四", 5: "五", 6: "六" };
  var FOG_BRUSH_RADIUS = 30;
  var FOG_GRID_COLUMNS = 18;
  var FOG_GRID_ROWS = 10;
  var TRIVIA_QUESTIONS = Array.isArray(window.ANDING_TRIVIA) ? window.ANDING_TRIVIA : [];
  var TRIVIA_CATEGORIES = [
    { id: "nature", label: "自然", count: 34 },
    { id: "animal", label: "动物", count: 33 },
    { id: "art", label: "文化艺术", count: 33 },
  ];

  function randomWaitWindowTarget(exclude) {
    var choices = [0, 1, 2, 3].filter(function (index) {
      return index !== exclude;
    });
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function createWaitWindowSequence(length) {
    var sequence = [];
    var previous = -1;
    var count = Math.max(WAIT_WINDOW_MIN_LENGTH, Math.min(WAIT_WINDOW_MAX_LENGTH, length || WAIT_WINDOW_MIN_LENGTH));
    while (sequence.length < count) {
      var next = randomWaitWindowTarget(previous);
      sequence.push(next);
      previous = next;
    }
    return sequence;
  }

  function randomFogSeed() {
    return Math.floor(Math.random() * 2147483000) + 1;
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
    waitWindowLength: WAIT_WINDOW_MIN_LENGTH,
    waitWindowSequence: createWaitWindowSequence(WAIT_WINDOW_MIN_LENGTH),
    waitWindowInput: [],
    waitWindowPhase: "showing",
    waitWindowShowIndex: -1,
    waitWindowRound: 0,
    waitFogSeed: randomFogSeed(),
    gamesReturnRoute: "checkin",
    triviaSeenIds: loadTriviaSeenIds(),
    triviaRecentIds: [],
    triviaCategory: "nature",
    triviaQuestionId: "",
    triviaSelectedIndex: -1,
    triviaOrigin: "random",
    learnNote: "second-fear",
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
    for (var index = 0; index < LEGACY_DEFAULT_WORD_SETS.length; index += 1) {
      if (sameWords(draft.words, LEGACY_DEFAULT_WORD_SETS[index])) {
        draft.words = DEFAULT_WORDS.slice();
        break;
      }
    }
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

  function triviaQuestionById(id) {
    for (var index = 0; index < TRIVIA_QUESTIONS.length; index += 1) {
      if (TRIVIA_QUESTIONS[index].id === id) return TRIVIA_QUESTIONS[index];
    }
    return null;
  }

  function loadTriviaSeenIds() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(TRIVIA_STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      var found = {};
      return saved.filter(function (id) {
        if (typeof id !== "string" || found[id] || !triviaQuestionById(id)) return false;
        found[id] = true;
        return true;
      });
    } catch (error) {
      return [];
    }
  }

  function persistTriviaSeenIds() {
    try {
      window.localStorage.setItem(TRIVIA_STORAGE_KEY, JSON.stringify(state.triviaSeenIds));
    } catch (error) {
      return;
    }
  }

  function hasSeenTrivia(id) {
    return state.triviaSeenIds.indexOf(id) >= 0;
  }

  function triviaQuestionsForCategory(category) {
    return TRIVIA_QUESTIONS.filter(function (question) {
      return !category || question.category === category;
    });
  }

  function rememberRecentTrivia(id) {
    state.triviaRecentIds = state.triviaRecentIds.filter(function (recentId) {
      return recentId !== id;
    });
    state.triviaRecentIds.push(id);
    if (state.triviaRecentIds.length > 10) state.triviaRecentIds.shift();
  }

  function openTriviaQuestion(question, origin) {
    if (!question) return;
    state.triviaQuestionId = question.id;
    state.triviaSelectedIndex = -1;
    state.triviaOrigin = origin || "random";
    state.triviaCategory = question.category;
    rememberRecentTrivia(question.id);
    navigate("trivia-question");
  }

  function openRandomTrivia(category) {
    var questions = triviaQuestionsForCategory(category || "");
    var unseen = questions.filter(function (question) {
      return !hasSeenTrivia(question.id);
    });
    var candidates = unseen;
    if (!candidates.length) {
      candidates = questions.filter(function (question) {
        return state.triviaRecentIds.indexOf(question.id) < 0;
      });
    }
    if (!candidates.length) candidates = questions;
    if (!candidates.length) return;
    var question = candidates[Math.floor(Math.random() * candidates.length)];
    openTriviaQuestion(question, category ? "drawer" : "random");
  }

  function revealTriviaAnswer(index) {
    var question = triviaQuestionById(state.triviaQuestionId);
    if (!question || state.triviaSelectedIndex >= 0 || index < 0 || index > 2) return;
    state.triviaSelectedIndex = index;
    if (!hasSeenTrivia(question.id)) {
      state.triviaSeenIds.push(question.id);
      persistTriviaSeenIds();
    }
    render();
    window.requestAnimationFrame(function () {
      var note = document.getElementById("trivia-answer-note");
      if (note) note.focus();
    });
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

  function calmScreen(label, body, primaryLabel, primaryAction, nextRoute, secondary, showDirectWords, primaryDisabled) {
    var next = nextRoute ? ' data-next="' + escapeHtml(nextRoute) + '"' : "";
    var disabled = primaryDisabled ? ' disabled aria-disabled="true"' : "";
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
      disabled,
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
      '<p class="home-note">现在只按一下。接下来的事，我们一件一件来。</p>',
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
      '<h1>现在还好。<br>时间是你的。</h1>',
      '<p>今天想看一页就看一页，也可以留一句话给下一次。从哪里开始都行。</p>',
      "</header>",
      '<div class="calm-ledger" aria-label="平时可以做的事">',
      '<button class="calm-entry" type="button" data-action="open-learn">',
      '<span class="calm-entry__mark">理解</span>',
      '<span class="calm-entry__text"><strong>看懂它</strong><small>先看它怎样夺取全部注意力</small></span>',
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
      '<p class="calm-hub__leave">今天看一页也够。觉得够了，随时离开。</p>',
      "</section>",
    ].join("");
  }

  function renderLearn() {
    return [
      '<section class="screen screen-scroll learning-index">',
      innerPageNav("calm", "回到平时", "看懂它"),
      '<header class="learning-index__intro">',
      '<h1>先弄懂一个<br>真正卡住你的地方。</h1>',
      '<p>每篇只谈一个问题。挑一篇，读到想停的地方就停。</p>',
      "</header>",
      '<div class="learning-notes-heading"><span class="eyebrow">可以慢慢读的笔记</span><span>选一篇就好</span></div>',
      '<button class="featured-note" type="button" data-action="open-learn-article" data-note="second-fear">',
      '<span class="featured-note__meta">《焦虑症的自救》 · 第二层恐惧</span>',
      '<strong>“那又怎样？”<br>把选择拿回来</strong>',
      '<span>身体刚起了一阵反应，脑子里的第二声警报为什么会跟上来？</span>',
      '<i aria-hidden="true">读这一篇 →</i>',
      "</button>",
      '<div class="note-shelf">',
      '<button class="note-card" type="button" data-action="open-learn-article" data-note="accept">',
      '<span><small>《焦虑症的自救》 · 接受</small><strong>来吧，老朋友</strong><i>惊恐推门进来时，先给它一把椅子。</i></span><b aria-hidden="true">读&nbsp;→</b>',
      "</button>",
      '<button class="note-card" type="button" data-action="open-learn-article" data-note="setback">',
      '<span><small>《焦虑症的自救》 · 阻碍</small><strong>又来了，路还在</strong><i>旧症状回来，走过的路仍在脚下。</i></span><b aria-hidden="true">读&nbsp;→</b>',
      "</button>",
      '<button class="note-card" type="button" data-action="open-learn-article" data-note="workbook">',
      '<span><small>《焦虑症与恐惧症手册》 · 阅读导览</small><strong>先翻到用得上的那一页</strong><i>把厚手册当成工具箱，卡在哪里就翻到哪里。</i></span><b aria-hidden="true">读&nbsp;→</b>',
      "</button>",
      "</div>",
      '<button class="brief-link" type="button" data-action="open-understand">',
      '<span><strong>第一次来，先看这张短说明</strong><small>难受是真的，纸老虎也真的会吓人</small></span>',
      '<span aria-hidden="true">→</span>',
      "</button>",
      '<section class="quiet-bookshelf">',
      '<span class="eyebrow">这些书会成为线索</span>',
      '<p>《焦虑症的自救》 · 《焦虑症与恐惧症手册》 · 《直视骄阳》 · 《心湖上的倒影》 · 《世界上最快乐的人》 · 《庄子》</p>',
      '<small>这些书给了我一些线索。管用的留下；过时、绝对或让人羞耻的说法，就放下。</small>',
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
    if (state.learnNote === "accept") return renderAcceptanceNote();
    if (state.learnNote === "setback") return renderSetbackNote();
    if (state.learnNote === "workbook") return renderWorkbookGuide();
    return renderSecondFearNote();
  }

  function renderSecondFearNote() {
    return [
      '<section class="screen screen-scroll note-article">',
      innerPageNav("open-learn", "回到看懂它", "个人阅读笔记"),
      '<article>',
      '<header class="note-article__header">',
      '<span>第二层恐惧</span>',
      '<h1>“那又怎样？”<br>把选择拿回来</h1>',
      '<p>惊恐一来，总想夺取你全部注意力。心跳、发麻、眩晕一起涌上来，脑子还要追着问：是不是要出事？怎么还没停？</p>',
      "</header>",
      '<section class="note-section">',
      '<h2>两声警报</h2>',
      '<p>克莱尔·威克斯给了我一个很有用的分法。第一声来自身体和情绪。第二声来自我对这些感觉的恐惧：盯着它们，催它们消失，把每一次波动都解释成危险。</p>',
      '<div class="fear-layer-demo">',
      '<button class="', state.learnLayer === "first" ? "is-selected" : "", '" type="button" data-action="learn-layer" data-layer="first" aria-pressed="', state.learnLayer === "first" ? "true" : "false", '"><span>第一声</span><strong>心跳突然变快</strong></button>',
      '<button class="', state.learnLayer === "second" ? "is-selected" : "", '" type="button" data-action="learn-layer" data-layer="second" aria-pressed="', state.learnLayer === "second" ? "true" : "false", '"><span>第二声</span><strong>它是不是要出事？</strong></button>',
      '<p id="learn-layer-copy" aria-live="polite">', escapeHtml(learnLayerCopy()), "</p>",
      "</div>",
      '<p>这解释了惊恐怎样一步步占满注意力。身体正在经历一阵反应，我又被“害怕这阵反应”裹住了。第一声需要时间，第二声却可以少添一把火。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>四个字，留出一点空隙</h2>',
      '<p>“那又怎样”是在回答第二声警报。它又把最坏的结果喊了一遍。我听见了，然后回它一句：哦，知道了。先坐会儿。</p>',
      '<blockquote class="personal-line">怕可以在这里，<br>我也可以在这里。</blockquote>',
      '<p>这四个字赶不走惊恐。它们给我留下一点空隙，让我缓一缓，再决定要不要检查、要不要逃。选择就从这点空隙里回来。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>信心要练出来</h2>',
      '<p>每次发作都能成为一回练习。书能给地图，路还是要自己走。惊恐又来夺取全部注意力时，我可以像认出老朋友那样认出它：哦，是你。来吧，坐一会儿。</p>',
      '<p>然后少检查一次，少逃一步，亲眼看着这阵感觉怎样变化。这样的经验很宝贵。一次只攒下一点也没关系，积得久了，它就是硬东西。惊恐再来时，我手里有自己走过的路。</p>',
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

  function renderSimpleNote(meta, title, intro, body, source) {
    return [
      '<section class="screen screen-scroll note-article">',
      innerPageNav("open-learn", "回到看懂它", "阅读笔记"),
      '<article>',
      '<header class="note-article__header">',
      '<span>', escapeHtml(meta), "</span>",
      '<h1>', title, "</h1>",
      '<p>', escapeHtml(intro), "</p>",
      "</header>",
      body,
      '<aside class="note-boundary">第一次出现的症状，或与以往明显不同的症状，仍然应该交给医生判断。练习中明显不适，也可以随时停下。</aside>',
      '<footer class="note-source">', escapeHtml(source), "</footer>",
      "</article>",
      '<div class="article-actions">',
      '<button class="primary-button" type="button" data-action="open-practice">平时练一小步</button>',
      '<button class="secondary-button" type="button" data-action="open-learn">回到全部笔记</button>',
      "</div>",
      "</section>",
    ].join("");
  }

  function renderAcceptanceNote() {
    var body = [
      '<section class="note-section">',
      '<h2>先给它一把椅子</h2>',
      '<p>欢迎惊恐，听起来有点反常。其实这件事很朴素。熟悉的心跳、发麻和眩晕来了，就让它们暂时待着。我省下检查、抵抗和催促的力气。</p>',
      '<p>它像一位一进门就想夺走全部注意力、总爱报假警的老朋友。心跳、呼吸和最坏的念头会一下子挤到眼前。可我认识它，也见过它离开。给它一把椅子，我继续过眼前这一分钟。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>手里的枪可以放下了</h2>',
      '<p>威克斯写过一个反常识的比喻：面对猛虎，先丢下手里的枪。瞄准、戒备、等它扑来，会耗掉人全部的力气。手松开以后，才有余地看清眼前到底发生了什么。</p>',
      '<blockquote class="personal-line">来吧，惊恐。<br>你可以在这里，我也在这里。</blockquote>',
      '<p>我仍然会怕。欢迎它，只表示我愿意和它同处一会儿，让身体走完自己的过程。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>下一次，只练一点</h2>',
      '<p>发现自己又在催“怎么还没好”，先停一下。环境安全时，可以少检查一次，也可以少逃一步。手边还有一件小事，就照原来的速度做几秒。选一样就够。</p>',
      '<p>有时“接受”也会变成新的催促：“我都欢迎你了，怎么还不走？”这句话来了，也给它一把椅子。我们慢慢练。</p>',
      "</section>",
    ].join("");
    return renderSimpleNote(
      "《焦虑症的自救》 · 接受",
      "来吧，老朋友",
      "惊恐冲上来时，我总想把它推出门。越推，身体绷得越紧。后来我开始先认出它：哦，又是你。",
      body,
      "阅读线索：克莱尔·威克斯《焦虑症的自救》中关于接受与飘然的章节。本文是个人阅读笔记与经验整理，不替代诊断和治疗。"
    );
  }

  function renderSetbackNote() {
    var body = [
      '<section class="note-section">',
      '<h2>身体会记得旧路</h2>',
      '<p>神经系统敏感了一段时间后，疲劳、压力或一次突然的身体感觉，都可能把旧症状重新叫回来。它很像旧伤在阴雨天发酸。因为熟悉，反而格外容易把人吓住。</p>',
      '<p>随后冒出来的判断更麻烦：“又来了，我肯定全回去了。”一句话，就把今天的一阵波动写成了未来全部的失败。这个结论来得太快。</p>',
      "</section>",
      '<section class="note-section">',
      '<h2>走过的路还在脚下</h2>',
      '<p>你认出过惊恐，陪它待过，也亲眼见过它变化。这些经验都还在。现在很难受，过去练出的东西也依然在。</p>',
      '<blockquote class="personal-line">我以前都挺过去了，<br>这次也会的。</blockquote>',
      '<p>这句话抓住的是一个已经发生过的事实：那些当时看起来撑不过去的时刻，后来都成了过去。今天也会给你留下一份新的经验。</p>',
      "</section>",
      '<section class="note-section note-questions">',
      '<h2>阻碍来时，只看今天</h2>',
      '<ol>',
      '<li>今天是不是比平时更累、更忙，或受了刺激？</li>',
      '<li>这是熟悉的一阵感觉，还是与以往明显不同？</li>',
      '<li>除了害怕“又回去了”，眼前真正发生了什么？</li>',
      "</ol>",
      '<p>恢复没有百分比可打。今天只是今天。先让这一阵过去，再把生活接回来。路一直在。</p>',
      "</section>",
    ].join("");
    return renderSimpleNote(
      "《焦虑症的自救》 · 阻碍",
      "又来了，<br>路还在",
      "旧症状一回来，脑子很容易抢先宣布：完了，以前的努力全白费了。先别急着信。今天这一阵，抹不掉已经走过的路。",
      body,
      "阅读线索：克莱尔·威克斯《焦虑症的自救》中关于神经敏化、阻碍与重新找回信心的章节。本文是个人阅读笔记与经验整理，不替代诊断和治疗。"
    );
  }

  function renderWorkbookGuide() {
    var body = [
      '<section class="note-section">',
      '<h2>先找最卡住你的那一环</h2>',
      '<p>这本书从身体、想法、行为、人际和日常生活几个方向拆解焦虑。内容很具体，也确实很多。一次只处理眼前最卡的一环，读起来会轻松得多。</p>',
      '<p>先问自己：眼下最困扰我的是身体感觉、灾难化想法，还是因为害怕而躲着某个地方？选中一环，今天就有了入口。</p>',
      "</section>",
      '<section class="note-section note-route-list">',
      '<h2>和惊恐最贴近的几章</h2>',
      '<ul>',
      '<li><strong>身体感觉把我吓住</strong><span>先看第 6 章“应对惊恐发作”。</span></li>',
      '<li><strong>我开始躲地方、躲活动</strong><span>再看第 7 章“直面恐惧”。暴露练习要循序渐进，拿不准时和专业人员一起做。</span></li>',
      '<li><strong>脑子总在预演最坏结果</strong><span>翻到第 8、9 章，看自我对话与错误信念。</span></li>',
      '<li><strong>症状回来，我就觉得全完了</strong><span>第 20 章谈预防复发，也适合状态平稳时读。</span></li>',
      "</ul>",
      "</section>",
      '<section class="note-section">',
      '<h2>两本书放在一起</h2>',
      '<p>《焦虑症的自救》先帮人站稳，记住面对、接受、飘然和等待。《焦虑症与恐惧症手册》把工具摊开，惊恐、暴露、自我对话、信念和复发预防都有对应的章节。</p>',
      '<p>前一本给方向，后一本给工具。先拿走眼下用得上的部分，已经够了。</p>',
      '<blockquote class="personal-line">今天先拿走一页。<br>余下的，以后再说。</blockquote>',
      "</section>",
    ].join("");
    return renderSimpleNote(
      "《焦虑症与恐惧症手册》 · 阅读导览",
      "先翻到用得上的<br>那一页",
      "它很厚。状态不好时，光看目录就像多了一摞作业。可以把它当成工具箱：今天卡在哪里，就先翻到哪里。",
      body,
      "阅读线索：艾德蒙·伯恩《焦虑症与恐惧症手册》（原书第 7 版）的公开目录。这篇是阅读导览，只说明怎样使用这本手册，不代替完整阅读或专业治疗。"
    );
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
        '<h1>先看见它。<br>让处理慢一步。</h1>',
        '<p>选一样此刻很轻、很普通的感觉。只看看它是什么样，随时可以停。</p>',
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
        '<p>你刚才让这个感觉保持原样，多看了它一会儿。这一小步练的是：感觉出现了，处理它的动作可以慢一点。</p>',
        '<blockquote>那又怎样？<br>它先待着，我继续。</blockquote>',
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
        '<p>当时的担心占满了注意力；后来实际发生的事，也值得留下来。</p>',
        "</header>",
        '<div class="reflection-sheet">',
        reflectionItem("当时最吓我的", state.reflection.fear),
        reflectionItem("我以为会发生", state.reflection.meaning),
        reflectionItem("后来实际发生", state.reflection.reality),
        reflectionItem("我想留给下次", state.reflection.next),
        "</div>",
        '<p class="reflection-privacy">这里不打分，也不记录次数和时长。</p>',
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
      '<h1>把刚才发生的事<br>放在一起看。</h1>',
      '<p>写一两句就够。内容只留在这次打开里，离开后就散了。</p>',
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
      flowNav("先看最抢注意力的一个", true),
      '<div class="screen-calm__body">',
      '<h1 class="choice-title">现在最抢注意力的是哪一种？</h1>',
      '<p class="support-copy">名字可以很粗略。哪个最抢注意力，就先告诉我哪个。</p>',
      '<div class="choice-grid">',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="heart"><span>心跳很快</span><small>注意力全在心跳上</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="breath"><span>呼吸很乱</span><small>总觉得吸不够</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="unreal"><span>周围不真实</span><small>像隔着一层</small></button>',
      '<button class="choice-button" type="button" data-action="choose-need" data-need="control"><span>怕会失控</span><small>怕自己撑不住</small></button>',
      "</div>",
      '<div class="choice-shortcuts">',
      '<button class="choice-shortcut choice-shortcut--game" type="button" data-action="start-game"><strong>直接玩小游戏</strong><small>亮窗记忆 / 擦开图景 / 冷知识问答</small></button>',
      '<button class="choice-shortcut" type="button" data-action="choose-need" data-need="unclear"><strong>说不清</strong><small>直接陪我</small></button>',
      "</div>",
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
        '<p class="support-copy">保持现在的姿势，先告诉我就好。</p>',
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
      '<p class="support-copy">找到一个接触点就够了。</p>',
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
    var title = "熟悉的感觉又来了。";
    var copy = "认出它：哦，是你。来吧，老朋友。你可以待着，我也慢慢过这一分钟。";
    if (state.need === "heart") {
      title = "注意力全被心跳抓住了。结论先放一放。";
      copy = "让心脏自己跳一会儿。每一下都去检查会很累，先把注意力留给眼前。";
    } else if (state.need === "control") {
      title = "“会失控”是一个很吓人的念头。";
      copy = "先叫它一声“念头”。它想抓走全部注意力，身体仍然可以找到一个接触点。";
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
      '<span class="lived-voice__label">这时候，可以这样对自己说</span>',
      '<p class="lived-voice__word" id="lived-support-word">“',
      escapeHtml(currentSupportWord()),
      '”</p>',
      '<button class="lived-voice__swap" type="button" data-action="support-swap">换一句&nbsp;↻</button>',
      "</aside>",
    ].join("");
  }

  function renderBreathe() {
    var title = state.need === "breath"
      ? "这一口，小一点就好。"
      : "圆圈跟着你的手。";
    var response = state.need === "breath"
      ? "轻轻按住，吸一小口；松开，让呼气慢慢回来。"
      : "按住时吸，松开时呼。你的手来定节奏。";
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
    var context = groundingContext(step.sense);
    var body = [
      '<div class="grounding-object grounding-object--',
      groundingVisualClass(step.sense),
      '" id="grounding-object" aria-hidden="true"><span class="grounding-object__shape"></span></div>',
      '<span class="grounding-sense" id="grounding-sense">',
      escapeHtml(step.sense),
      "</span>",
      '<p class="grounding-context" id="grounding-context"',
      context ? "" : " hidden",
      ">",
      escapeHtml(context),
      "</p>",
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
      '<button class="quiet-link" type="button" data-action="start-game">直接玩小游戏&nbsp;→</button>',
      "</div>",
    ].join("");
    return calmScreen("落地", body, step.button, "ground-next", "", secondary, true, true)
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
        ? "又有五分钟过去了。先陪眼前这一阵。"
        : "感觉可能一阵一阵。我们只过眼前这一阵。";
    }
    return message;
  }

  function formatElapsed(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainder = seconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
  }

  function waitWindowCountWord(count) {
    return WAIT_WINDOW_COUNT_WORDS[count] || String(count);
  }

  function waitWindowDifficultyLabel() {
    if (state.waitWindowLength >= WAIT_WINDOW_MAX_LENGTH) return "回到三扇 ↺";
    return "难一点 · " + waitWindowCountWord(state.waitWindowLength + 1) + "扇";
  }

  function renderWaitWindows() {
    var windows = WAIT_WINDOW_POSITIONS.map(function (position, index) {
      return [
        '<button class="wait-window" type="button" data-action="wait-window" data-window="',
        String(index),
        '" disabled aria-label="',
        escapeHtml(position + "方的窗"),
        '">',
        '<span class="wait-window__pane" aria-hidden="true"><span></span></span>',
        "</button>",
      ].join("");
    }).join("");
    return [
      '<div class="wait-activity wait-windows" id="wait-activity">',
      '<p class="wait-activity__prompt" id="wait-window-prompt">先记住',
      waitWindowCountWord(state.waitWindowLength),
      '扇窗亮起的顺序，再照着点。</p>',
      '<div class="wait-window-grid" id="wait-window-grid">', windows, "</div>",
      '<div class="wait-activity__footer">',
      '<p class="wait-activity__status" id="wait-activity-status" aria-live="polite">先看，一扇一扇来。</p>',
      '<div class="wait-memory-controls">',
      '<button class="quiet-link wait-replay" type="button" data-action="wait-replay" disabled>再看一遍&nbsp;↻</button>',
      '<button class="quiet-link wait-difficulty" type="button" data-action="wait-difficulty" disabled>',
      waitWindowDifficultyLabel(),
      "</button>",
      "</div>",
      "</div>",
      "</div>",
    ].join("");
  }

  function renderWaitFog() {
    return [
      '<div class="wait-activity wait-fog" id="wait-activity">',
      '<p class="wait-activity__prompt">慢慢移动手指，把雾后的整幅图景擦出来。</p>',
      '<button class="fog-board" id="wait-fog-board" type="button" data-action="fog-reveal" aria-describedby="wait-activity-status" aria-label="擦开雾气。按住并移动手指探索整幅图景，或用空格分段擦开">',
      '<canvas id="wait-fog-scene" aria-hidden="true"></canvas>',
      '<canvas id="wait-fog-canvas" aria-hidden="true"></canvas>',
      "</button>",
      '<div class="wait-activity__footer">',
      '<p class="wait-activity__status" id="wait-activity-status" aria-live="polite">从哪里开始都可以。下面藏着不止一种花纹。</p>',
      '<button class="quiet-link fog-new" type="button" data-action="fog-new">换一幅&nbsp;↻</button>',
      "</div>",
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
      .replace("screen screen-calm", "screen screen-calm screen-wait screen-wait--" + state.waitActivity);
  }

  function triviaCategoryMeta(category) {
    for (var index = 0; index < TRIVIA_CATEGORIES.length; index += 1) {
      if (TRIVIA_CATEGORIES[index].id === category) return TRIVIA_CATEGORIES[index];
    }
    return TRIVIA_CATEGORIES[0];
  }

  function renderGames() {
    return [
      '<section class="screen screen-scroll game-room">',
      innerPageNav("games-back", "回到刚才", "小游戏"),
      '<header class="game-room__intro">',
      '<span class="game-room__kicker">让注意力换个座位</span>',
      '<h1>想让哪一小块<br>先忙起来？</h1>',
      '<p>不用赢，也不用玩完。挑一件眼前的小事就好。</p>',
      "</header>",
      '<div class="game-shelf" aria-label="选择小游戏">',
      '<button class="game-entry game-entry--trivia" type="button" data-action="play-trivia">',
      '<span class="game-entry__number">100 个小抽屉</span>',
      '<span class="game-entry__copy"><strong>冷知识问答</strong><small>自然、动物和文化艺术，随手猜一题</small></span>',
      '<span class="game-entry__arrow" aria-hidden="true">抽一张&nbsp;→</span>',
      "</button>",
      '<button class="game-entry" type="button" data-action="play-windows">',
      '<span class="game-entry__number">眼睛忙一点</span>',
      '<span class="game-entry__copy"><strong>亮窗记忆</strong><small>看几扇窗亮起，再照着点回来</small></span>',
      '<span class="game-entry__arrow" aria-hidden="true">开始&nbsp;→</span>',
      "</button>",
      '<button class="game-entry" type="button" data-action="play-fog">',
      '<span class="game-entry__number">手指忙一点</span>',
      '<span class="game-entry__copy"><strong>擦开图景</strong><small>慢慢擦掉雾，看看下面藏了什么</small></span>',
      '<span class="game-entry__arrow" aria-hidden="true">开始&nbsp;→</span>',
      "</button>",
      "</div>",
      '<p class="game-room__note">三个都不会计时、计分或留下输赢。</p>',
      "</section>",
    ].join("");
  }

  function renderTriviaHome() {
    return [
      '<section class="screen screen-scroll trivia-page trivia-home">',
      innerPageNav("games", "换个玩法", "冷知识问答"),
      '<header class="trivia-home__intro">',
      '<span class="trivia-home__kicker">让好奇心忙一会儿</span>',
      '<h1>从小抽屉里，<br>拿一件没什么急用的事。</h1>',
      '<p>每题三个选项。随便猜，点下去就能看到答案和来龙去脉。</p>',
      "</header>",
      '<div class="trivia-cabinet-preview" aria-hidden="true">',
      '<span>自然</span><span>动物</span><span>文化艺术</span>',
      '<i></i><i></i><i></i><i></i><i></i>',
      "</div>",
      '<div class="trivia-home__actions">',
      '<button class="primary-button trivia-random" type="button" data-action="trivia-random">随手抽一题</button>',
      '<button class="secondary-button" type="button" data-action="trivia-drawers">自己挑一个</button>',
      "</div>",
      '<p class="trivia-home__note">随机抽题会先避开你已经看过答案的那些。</p>',
      "</section>",
    ].join("");
  }

  function renderTriviaDrawers() {
    var meta = triviaCategoryMeta(state.triviaCategory);
    var tabs = TRIVIA_CATEGORIES.map(function (category) {
      var selected = category.id === meta.id;
      return [
        '<button class="trivia-category', selected ? " is-selected" : "", '" type="button" data-action="trivia-category" data-category="',
        escapeHtml(category.id), '" aria-pressed="', selected ? "true" : "false", '">',
        '<strong>', escapeHtml(category.label), "</strong><small>", String(category.count), " 格</small></button>",
      ].join("");
    }).join("");
    var drawers = triviaQuestionsForCategory(meta.id).map(function (question) {
      var seen = hasSeenTrivia(question.id);
      var label = meta.label + "第 " + String(question.number) + " 题" + (seen ? "，已看过" : "，还没看过");
      return [
        '<button class="trivia-drawer', seen ? " is-seen" : "", '" type="button" data-action="trivia-pick" data-question-id="',
        escapeHtml(question.id), '" aria-label="', escapeHtml(label), '">',
        '<span class="trivia-drawer__paper" aria-hidden="true"></span>',
        '<span class="trivia-drawer__number">', String(question.number).padStart(2, "0"), "</span>",
        seen ? '<span class="visually-hidden">已看过</span>' : "",
        "</button>",
      ].join("");
    }).join("");
    return [
      '<section class="screen screen-scroll trivia-page trivia-drawers">',
      innerPageNav("trivia-home", "回到问答", "自己挑一个"),
      '<header class="trivia-drawers__intro">',
      '<h1>今天拉开哪一格？</h1>',
      '<p>露出蓝纸条的，是你已经看过答案的题。想重看也可以照常打开。</p>',
      "</header>",
      '<div class="trivia-categories" aria-label="题目分类">', tabs, "</div>",
      '<div class="trivia-cabinet-heading"><strong>', escapeHtml(meta.label), "</strong><span>轻轻挑一格</span></div>",
      '<div class="trivia-cabinet" aria-label="', escapeHtml(meta.label), '题柜">', drawers, "</div>",
      "</section>",
    ].join("");
  }

  function renderTriviaQuestion() {
    var question = triviaQuestionById(state.triviaQuestionId);
    if (!question) return renderTriviaHome();
    var meta = triviaCategoryMeta(question.category);
    var revealed = state.triviaSelectedIndex >= 0;
    var backAction = state.triviaOrigin === "drawer" ? "trivia-drawers" : "trivia-home";
    var backLabel = state.triviaOrigin === "drawer" ? "回到题柜" : "回到问答";
    var options = question.choices.map(function (choice, index) {
      var isAnswer = revealed && index === question.answerIndex;
      var isPicked = revealed && index === state.triviaSelectedIndex;
      var classes = "trivia-option" + (isAnswer ? " is-answer" : "") + (isPicked ? " is-picked" : "");
      var letter = String.fromCharCode(65 + index);
      var ariaLabel = letter + "，" + choice + (isAnswer ? "，答案" : "") + (isPicked ? "，已选择" : "");
      return [
        '<button class="', classes, '" type="button" data-action="trivia-answer" data-answer-index="', String(index), '"',
        revealed ? ' disabled aria-disabled="true"' : "",
        ' aria-label="', escapeHtml(ariaLabel), '">',
        '<span class="trivia-option__letter" aria-hidden="true">', letter, "</span>",
        '<span class="trivia-option__copy">', escapeHtml(choice), "</span>",
        isAnswer ? '<small class="trivia-option__mark">答案</small>' : "",
        "</button>",
      ].join("");
    }).join("");
    var answer = revealed ? [
      '<aside class="trivia-answer-note" id="trivia-answer-note" tabindex="-1" aria-live="polite">',
      '<span class="trivia-answer-note__tab" aria-hidden="true"></span>',
      '<small>抽屉里的纸条</small>',
      '<h2>答案是「', escapeHtml(question.answer), '」。</h2>',
      '<p>', escapeHtml(question.explanation), "</p>",
      '<span class="trivia-answer-note__source">资料来源：', escapeHtml(question.sourceLabel), "</span>",
      "</aside>",
      '<div class="trivia-question__actions">',
      '<button class="primary-button" type="button" data-action="trivia-next">再来一题</button>',
      '<div><button class="quiet-link" type="button" data-action="trivia-drawers">去题柜挑</button>',
      '<button class="quiet-link" type="button" data-action="games">换个玩法</button></div>',
      "</div>",
    ].join("") : '<p class="trivia-question__permission">随便猜。这里没有分数，也不记对错。</p>';
    return [
      '<section class="screen screen-scroll trivia-page trivia-question">',
      innerPageNav(backAction, backLabel, meta.label + " · " + String(question.number).padStart(2, "0")),
      '<header class="trivia-question__header">',
      '<span class="trivia-question__title">', escapeHtml(question.title), "</span>",
      '<h1>', escapeHtml(question.prompt), "</h1>",
      "</header>",
      '<div class="trivia-options" aria-label="选择一个答案">', options, "</div>",
      answer,
      "</section>",
    ].join("");
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
        ? "这些话留给最难熬的这一阵。挑一句现在愿意相信的，让它陪你一会儿。"
        : "状态好时的你，把这些话留给了现在。如果做过卡片，也可以去相册找它。",
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
      '<p class="page-lead">写给那个时候的自己。想不到时，可以先借我的记忆找找感觉，再换成你的。</p>',
      '<form class="prepare-form" id="prepare-form">',
      '<section class="form-section">',
      '<div class="form-section__heading"><h2>一个锚点</h2><span class="field-label">一眼能认出来</span></div>',
      '<p class="form-section__hint">一个词、一个物件、一个画面。</p>',
      '<label class="field-label" for="anchor">我的锚点</label>',
      '<input class="text-field" id="anchor" name="anchor" maxlength="16" value="', escapeHtml(draft.anchor), '" placeholder="例如：雨天的假山">',
      '<div class="example-block">',
      '<span class="example-block__label">先借我的记忆找找感觉</span>',
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
      '<span class="example-block__label">我记得这样一幕</span>',
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
      '<h1 class="page-title">惊恐总会想办法<br>夺取你全部注意力。<br>可它是纸老虎。</h1>',
      '<p class="page-lead understand-lead">纸老虎也能把人吓得发抖。心跳、窒息感、眩晕，还有“要出事了”的念头，全都很难受。你正在承受一阵很强的身体反应。矫情、意志薄弱，和这件事毫无关系。</p>',
      '<section class="info-section"><h2>难受是真的，危险未必是真的</h2><p>惊恐一来，身体的警报会把注意力抓住。如果这些反应已经就医排查过，你也熟悉它们，那么感觉很强烈，和眼前真的有危险是两回事。它的第一招，就是把你的目光牢牢按在心跳、呼吸和最坏的念头上。</p></section>',
      '<section class="info-section"><h2>它靠注意力长大</h2><p>身体先起一阵反应，脑子立刻追问：“是不是要出事？”接着反复检查、赶紧逃开、催它马上停。这些动作又在告诉身体：警报是对的，危险很近。第二层恐惧就这样把第一层反应越抬越高。你只是被这个循环卷进去了。</p></section>',
      '<section class="info-section"><h2>老朋友又来了</h2><p>下一次惊恐露面，可以先认出它：“哦，是你。来吧，老朋友。你坐一会儿，我也留在这里。”欢迎它，能省下赶它出门的力气。</p><p>每次发作都给你一回练习机会。书能给方向，路还得亲自走。惊恐冲上来时，少检查一次，少逃一步，亲眼看着感觉怎样变化。要对付的是那道“它一来我就必须逃”的命令。</p><blockquote class="paper-tiger-line">克服惊恐，要把道理带进一次次发作里。<br>经验就在这些时刻慢慢攒起来。</blockquote></section>',
      '<section class="info-section"><h2>把经验带走</h2><p>一次练习未必马上让感觉变轻。强烈感觉通常会缓下来，每个人走完这一阵的时间各不相同。这一回没有时间要求，照自己的步调来。今天能少跟着警报跑一步，哪怕只进步一点，也值得好好鼓励自己。</p></section>',
      '<section class="info-section">',
      '<h2>可以慢慢读的书</h2>',
      '<ul class="book-list">',
      '<li><span class="book-title">《焦虑症的自救》</span><span class="book-copy">把“害怕这些感觉”这一层讲清楚，也给出面对、接受、飘然和等待这条路。</span></li>',
      '<li><span class="book-title">《焦虑症与恐惧症手册》</span><span class="book-copy">更像一本工具箱。惊恐、暴露、自我对话和错误信念，可以按眼下最困扰你的部分去读、去练。</span></li>',
      '<li><span class="book-title">《直视骄阳》</span><span class="book-copy">当“会不会死”藏在恐慌后面，它帮你把这层怕放到桌面上看。</span></li>',
      '<li><span class="book-title">《心湖上的倒影》</span><span class="book-copy">练习看见当下发生的念头，让评判和逃跑的冲动慢一点。</span></li>',
      '<li><span class="book-title">《世界上最快乐的人》</span><span class="book-copy">从觉察出发，理解身体感受和观察它的那个自己可以同时存在。</span></li>',
      '<li><span class="book-title">《庄子》</span><span class="book-copy">变化本来就会来去，手可以慢慢松开一点。</span></li>',
      "</ul>",
      '<button class="brief-link book-notes-link" type="button" data-action="open-learn"><span><strong>去读已经写好的笔记</strong><small>接受、阻碍，以及手册的阅读导览</small></span><span aria-hidden="true">→</span></button>',
      "</section>",
      '<section class="info-section"><div class="medical-note"><strong>先把该排除的排除掉</strong><p>如果这是第一次出现，或伴随和以往不同的症状，请及时就医排除身体原因。去确认清楚，也是在照顾自己。</p></div></section>',
      '<section class="info-section"><p>这里提供自助放松。诊断与治疗请交给医生和心理咨询师。发作频繁或已经影响生活时，专业帮助会更合适。</p></section>',
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
    else if (state.route === "games") markup = renderGames();
    else if (state.route === "trivia-home") markup = renderTriviaHome();
    else if (state.route === "trivia-drawers") markup = renderTriviaDrawers();
    else if (state.route === "trivia-question") markup = renderTriviaQuestion();
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
        ? "轻轻按住，吸一小口；松开，让呼气慢慢回来。"
        : "按住时吸，松开时呼。你的手来定节奏。";
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
        ? "只吸一点，给胸口留些余地。"
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
    if (response) response.textContent = "松开，让呼气自己走完。";
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

  function groundingContext(sense) {
    if (sense === "看见") return "";
    if (sense === "听见") return "先不用看手机，听听四周，在你所在的地方找。";
    if (sense === "触碰") return "把手伸向身边，在你所在的地方找。";
    if (sense === "闻到") return "留意你所在的地方和手边的东西。";
    return "把注意力放到嘴里此刻真实的感觉上。";
  }

  function groundingAnswerEcho() {
    if (!state.groundAnswers.length) {
      return "找到后写一个词。“找到了”会在写完后亮起来。";
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
    var hasAnswer = Boolean(cleanText(event.target.value, 16));
    button.textContent = hasAnswer ? "写好了，继续" : step.button;
    button.disabled = !hasAnswer;
    button.setAttribute("aria-disabled", String(!hasAnswer));
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
    startWaitWindowPlayback(true);
  }

  function setWaitActivityStatus(message) {
    var status = document.getElementById("wait-activity-status");
    if (status) status.textContent = message;
  }

  function updateWaitWindows(receivedIndex) {
    var buttons = document.querySelectorAll('[data-action="wait-window"]');
    Array.prototype.forEach.call(buttons, function (button) {
      var index = Number(button.getAttribute("data-window"));
      var isLit = state.waitWindowPhase === "showing" && index === state.waitWindowShowIndex;
      button.classList.toggle("is-lit", isLit);
      button.classList.remove("is-received");
      if (index === receivedIndex) restartClassAnimation(button, "is-received");
      button.disabled = state.waitWindowPhase !== "input";
      button.setAttribute("aria-label", WAIT_WINDOW_POSITIONS[index] + "方的窗" + (isLit ? "，正在亮" : ""));
    });
    var replay = document.querySelector('[data-action="wait-replay"]');
    if (replay) replay.disabled = state.waitWindowPhase === "showing";
    var difficulty = document.querySelector('[data-action="wait-difficulty"]');
    if (difficulty) {
      difficulty.disabled = state.waitWindowPhase === "showing";
      difficulty.textContent = waitWindowDifficultyLabel();
      difficulty.setAttribute("aria-label", state.waitWindowLength >= WAIT_WINDOW_MAX_LENGTH
        ? "把亮窗顺序恢复为三扇"
        : "把亮窗顺序增加到" + waitWindowCountWord(state.waitWindowLength + 1) + "扇");
    }
    var prompt = document.getElementById("wait-window-prompt");
    if (prompt) prompt.textContent = "先记住" + waitWindowCountWord(state.waitWindowLength) + "扇窗亮起的顺序，再照着点。";
  }

  function startWaitWindowPlayback(keepSequence) {
    if (waitActivityTimer) window.clearTimeout(waitActivityTimer);
    if (!keepSequence || !state.waitWindowSequence.length) {
      state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
    }
    state.waitWindowInput = [];
    state.waitWindowPhase = "showing";
    state.waitWindowShowIndex = -1;
    updateWaitWindows();
    setWaitActivityStatus("先看，一扇一扇来。");

    var cursor = 0;
    function showNextWindow() {
      if (state.route !== "wait" || state.waitActivity !== "windows") return;
      if (cursor >= state.waitWindowSequence.length) {
        state.waitWindowPhase = "input";
        state.waitWindowShowIndex = -1;
        updateWaitWindows();
        setWaitActivityStatus("轮到你了。");
        waitActivityTimer = null;
        return;
      }
      state.waitWindowShowIndex = state.waitWindowSequence[cursor];
      updateWaitWindows();
      waitActivityTimer = window.setTimeout(function () {
        state.waitWindowShowIndex = -1;
        updateWaitWindows();
        cursor += 1;
        waitActivityTimer = window.setTimeout(showNextWindow, 280);
      }, 680);
    }

    waitActivityTimer = window.setTimeout(showNextWindow, 380);
  }

  function chooseWaitWindow(control) {
    if (state.route !== "wait" || state.waitActivity !== "windows" || state.waitWindowPhase !== "input") return;
    var chosen = Number(control.getAttribute("data-window"));
    var expected = state.waitWindowSequence[state.waitWindowInput.length];

    if (chosen !== expected) {
      state.waitWindowPhase = "rest";
      updateWaitWindows(chosen);
      setWaitActivityStatus("没关系，忘了很正常。再看一遍。");
      if (waitActivityTimer) window.clearTimeout(waitActivityTimer);
      waitActivityTimer = window.setTimeout(function () {
        startWaitWindowPlayback(true);
      }, 760);
      return;
    }

    state.waitWindowInput.push(chosen);
    updateWaitWindows(chosen);
    if (state.waitWindowInput.length < state.waitWindowSequence.length) {
      setWaitActivityStatus("接住了，继续。");
      return;
    }

    state.waitWindowRound += 1;
    state.waitWindowPhase = "rest";
    updateWaitWindows(chosen);
    setWaitActivityStatus("记住了。下一组仍是" + waitWindowCountWord(state.waitWindowLength) + "扇。");
    if (waitActivityTimer) window.clearTimeout(waitActivityTimer);
    waitActivityTimer = window.setTimeout(function () {
      state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
      startWaitWindowPlayback(true);
    }, 900);
  }

  function changeWaitWindowDifficulty() {
    if (state.route !== "wait" || state.waitActivity !== "windows" || state.waitWindowPhase === "showing") return;
    state.waitWindowLength = state.waitWindowLength >= WAIT_WINDOW_MAX_LENGTH
      ? WAIT_WINDOW_MIN_LENGTH
      : state.waitWindowLength + 1;
    state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
    startWaitWindowPlayback(true);
  }

  function seededFogRandom(seed) {
    var value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return function () {
      value = value * 48271 % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function sizeFogCanvas(canvas, width, height, scale) {
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function drawFogScene(canvas, width, height, scale, seed) {
    var context = canvas.getContext("2d");
    if (!context) return;
    var random = seededFogRandom(seed);
    var palettes = [
      { top: "#385260", bottom: "#416d5c", hill: "#5f8b70", line: "rgba(229,239,232,0.48)", soft: "rgba(190,202,231,0.42)" },
      { top: "#49435e", bottom: "#436657", hill: "#658f75", line: "rgba(226,238,230,0.46)", soft: "rgba(185,198,229,0.4)" },
      { top: "#344f59", bottom: "#424f6a", hill: "#56846b", line: "rgba(229,239,232,0.46)", soft: "rgba(172,194,224,0.4)" },
    ];
    var palette = palettes[seed % palettes.length];
    context.setTransform(scale, 0, 0, scale, 0, 0);

    var background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette.top);
    background.addColorStop(1, palette.bottom);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    var glowX = width * (0.18 + random() * 0.64);
    var glowY = height * (0.1 + random() * 0.22);
    var glow = context.createRadialGradient(glowX, glowY, 2, glowX, glowY, width * 0.34);
    glow.addColorStop(0, "rgba(255,248,229,0.36)");
    glow.addColorStop(1, "rgba(255,248,229,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.fillStyle = palette.hill;
    context.beginPath();
    context.moveTo(0, height * 0.7);
    context.bezierCurveTo(width * 0.18, height * (0.47 + random() * 0.1), width * 0.32, height * 0.78, width * 0.52, height * 0.61);
    context.bezierCurveTo(width * 0.7, height * (0.45 + random() * 0.1), width * 0.82, height * 0.72, width, height * 0.5);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();

    context.strokeStyle = palette.line;
    context.lineWidth = 1;
    for (var contour = 0; contour < 7; contour += 1) {
      var contourY = height * (0.42 + contour * 0.075);
      context.beginPath();
      context.moveTo(-20, contourY + random() * 8);
      context.bezierCurveTo(width * 0.22, contourY - 18 + random() * 18, width * 0.42, contourY + 20 - random() * 12, width * 0.62, contourY - 4);
      context.bezierCurveTo(width * 0.78, contourY - 15 + random() * 18, width * 0.9, contourY + 10, width + 20, contourY - 6 + random() * 12);
      context.stroke();
    }

    context.strokeStyle = palette.soft;
    context.lineWidth = 1.2;
    for (var rain = 0; rain < 24; rain += 1) {
      var rainX = width * (0.03 + random() * 0.46);
      var rainY = height * (0.05 + random() * 0.34);
      var rainLength = 5 + random() * 12;
      context.beginPath();
      context.moveTo(rainX, rainY);
      context.lineTo(rainX - 2.5, rainY + rainLength);
      context.stroke();
    }

    var stemX = width * (0.72 + random() * 0.15);
    context.strokeStyle = palette.line;
    context.beginPath();
    context.moveTo(stemX, height * 0.9);
    context.quadraticCurveTo(stemX - width * 0.04, height * 0.53, stemX + width * 0.02, height * 0.18);
    context.stroke();
    for (var leaf = 0; leaf < 7; leaf += 1) {
      var leafY = height * (0.76 - leaf * 0.075);
      var side = leaf % 2 === 0 ? -1 : 1;
      var leafX = stemX + side * width * (0.018 + random() * 0.018);
      var leafWidth = width * (0.045 + random() * 0.025);
      var leafHeight = height * (0.028 + random() * 0.025);
      context.fillStyle = palette.soft;
      context.beginPath();
      context.moveTo(leafX, leafY);
      context.quadraticCurveTo(leafX + side * leafWidth * 0.62, leafY - leafHeight, leafX + side * leafWidth, leafY - leafHeight * 0.08);
      context.quadraticCurveTo(leafX + side * leafWidth * 0.48, leafY + leafHeight * 0.55, leafX, leafY);
      context.fill();
    }

    context.strokeStyle = palette.line;
    for (var ripple = 0; ripple < 5; ripple += 1) {
      context.beginPath();
      context.ellipse(width * (0.17 + random() * 0.18), height * (0.76 + random() * 0.14), width * (0.06 + ripple * 0.025), height * (0.015 + ripple * 0.006), -0.08, 0, Math.PI * 2);
      context.stroke();
    }

    for (var pebble = 0; pebble < 20; pebble += 1) {
      var pebbleX = width * (0.4 + random() * 0.56);
      var pebbleY = height * (0.72 + random() * 0.23);
      var pebbleRadius = 1.2 + random() * 3.2;
      context.fillStyle = pebble % 3 === 0 ? palette.line : palette.soft;
      context.beginPath();
      context.arc(pebbleX, pebbleY, pebbleRadius, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = "rgba(255,248,229,0.46)";
    for (var arc = 0; arc < 4; arc += 1) {
      context.beginPath();
      context.arc(width * (0.58 + random() * 0.18), height * (0.19 + random() * 0.2), 8 + arc * 7, Math.PI * (0.15 + random() * 0.25), Math.PI * (1.1 + random() * 0.35));
      context.stroke();
    }
  }

  function drawFogCover(canvas, width, height, scale, seed) {
    var context = canvas.getContext("2d");
    if (!context) return;
    var random = seededFogRandom(seed + 937);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    var mist = context.createLinearGradient(0, 0, width, height);
    mist.addColorStop(0, "#294139");
    mist.addColorStop(0.5, "#243b35");
    mist.addColorStop(1, "#2c3548");
    context.fillStyle = mist;
    context.fillRect(0, 0, width, height);
    for (var index = 0; index < 38; index += 1) {
      context.fillStyle = index % 2 === 0 ? "rgba(229,239,232,0.12)" : "rgba(119,171,144,0.1)";
      context.beginPath();
      context.arc(random() * width, random() * height, 1 + random() * 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  function initializeWaitFog(force) {
    var canvas = document.getElementById("wait-fog-canvas");
    var scene = document.getElementById("wait-fog-scene");
    var board = document.getElementById("wait-fog-board");
    if (!canvas || !scene || !board) return;
    if (!force && canvas.getAttribute("data-seed") === String(state.waitFogSeed) && canvas.width > 0) return;
    var width = Math.max(1, Math.round(board.clientWidth));
    var height = Math.max(1, Math.round(board.clientHeight));
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    sizeFogCanvas(scene, width, height, scale);
    sizeFogCanvas(canvas, width, height, scale);
    drawFogScene(scene, width, height, scale, state.waitFogSeed);
    drawFogCover(canvas, width, height, scale, state.waitFogSeed);
    canvas.setAttribute("data-seed", String(state.waitFogSeed));
    canvas.classList.remove("is-cleared");
    board.classList.remove("is-complete");
    board.setAttribute("aria-label", "擦开雾气。按住并移动手指探索整幅图景，或用空格分段擦开");
    fogDrawing = false;
    fogLastPoint = null;
    fogVisited = {};
    fogComplete = false;
    fogKeyboardStep = 0;
  }

  function waitFogPoint(event, board) {
    var source = event.touches && event.touches[0] ? event.touches[0] : event;
    if (typeof source.clientX !== "number" || typeof source.clientY !== "number") return null;
    var bounds = board.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(bounds.width, source.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, source.clientY - bounds.top)),
    };
  }

  function markFogVisited(point, previous, width, height) {
    var start = previous || point;
    var deltaX = point.x - start.x;
    var deltaY = point.y - start.y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var steps = Math.max(1, Math.ceil(distance / (FOG_BRUSH_RADIUS * 0.4)));
    var cellWidth = width / FOG_GRID_COLUMNS;
    var cellHeight = height / FOG_GRID_ROWS;
    for (var step = 0; step <= steps; step += 1) {
      var progress = step / steps;
      var sampleX = start.x + deltaX * progress;
      var sampleY = start.y + deltaY * progress;
      for (var row = 0; row < FOG_GRID_ROWS; row += 1) {
        for (var column = 0; column < FOG_GRID_COLUMNS; column += 1) {
          var centerX = (column + 0.5) * cellWidth;
          var centerY = (row + 0.5) * cellHeight;
          var xDistance = centerX - sampleX;
          var yDistance = centerY - sampleY;
          if (xDistance * xDistance + yDistance * yDistance <= FOG_BRUSH_RADIUS * FOG_BRUSH_RADIUS) {
            fogVisited[row + ":" + column] = true;
          }
        }
      }
    }
    return Object.keys(fogVisited).length / (FOG_GRID_COLUMNS * FOG_GRID_ROWS);
  }

  function completeWaitFog() {
    if (fogComplete) return;
    fogComplete = true;
    fogDrawing = false;
    fogLastPoint = null;
    var canvas = document.getElementById("wait-fog-canvas");
    var board = document.getElementById("wait-fog-board");
    if (canvas) canvas.classList.add("is-cleared");
    if (board) {
      board.classList.add("is-complete");
      board.setAttribute("aria-label", "整幅图景已经露出来了。可以选择换一幅");
    }
    setWaitActivityStatus("整幅图景露出来了。想再探索，可以换一幅。");
    if (waitActivityTimer) window.clearTimeout(waitActivityTimer);
    waitActivityTimer = window.setTimeout(function () {
      waitActivityTimer = null;
      if (!canvas || !fogComplete) return;
      var context = canvas.getContext("2d");
      if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    }, 650);
  }

  function clearWaitFog(point, previous) {
    var canvas = document.getElementById("wait-fog-canvas");
    var board = document.getElementById("wait-fog-board");
    if (!canvas || !board || !point || fogComplete) return;
    var context = canvas.getContext("2d");
    if (!context) return;
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = FOG_BRUSH_RADIUS * 2;
    context.beginPath();
    if (previous) context.moveTo(previous.x, previous.y);
    else context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.arc(point.x, point.y, FOG_BRUSH_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.restore();

    var revealed = markFogVisited(point, previous, board.clientWidth, board.clientHeight);
    if (revealed >= 0.78) completeWaitFog();
    else if (revealed >= 0.48) setWaitActivityStatus("已经露出很大一片了。可以去找还蒙着的地方。");
    else if (revealed >= 0.18) setWaitActivityStatus("下面不只有一种花纹。换个方向看看。");
  }

  function beginWaitFog(event, board) {
    if (state.route !== "wait" || state.waitActivity !== "fog" || fogComplete) return;
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
    if (!board || fogComplete) return;
    var rows = [0.16, 0.38, 0.62, 0.84];
    var row = fogKeyboardStep % rows.length;
    var reverse = Math.floor(fogKeyboardStep / rows.length) % 2 === 1;
    var start = { x: board.clientWidth * (reverse ? 0.88 : 0.12), y: board.clientHeight * rows[row] };
    var end = { x: board.clientWidth * (reverse ? 0.12 : 0.88), y: board.clientHeight * rows[row] };
    fogKeyboardStep += 1;
    clearWaitFog(end, start);
  }

  function showNewFogScene() {
    if (waitActivityTimer) {
      window.clearTimeout(waitActivityTimer);
      waitActivityTimer = null;
    }
    var previous = state.waitFogSeed;
    state.waitFogSeed = randomFogSeed();
    if (state.waitFogSeed === previous) state.waitFogSeed += 1;
    initializeWaitFog(true);
    setWaitActivityStatus("新的一幅藏好了。从哪里开始都可以。");
  }

  function updateGroundingStep() {
    var step = state.groundSteps[state.groundIndex];
    var object = document.getElementById("grounding-object");
    var sense = document.getElementById("grounding-sense");
    var context = document.getElementById("grounding-context");
    var prompt = document.getElementById("grounding-prompt");
    var button = app.querySelector('[data-action="ground-next"]');
    var answer = document.getElementById("ground-answer");
    var answerEcho = document.getElementById("ground-answer-echo");
    if (!step || !object || !sense || !context || !prompt || !button) return;
    if (groundingAnimationTimer) window.clearTimeout(groundingAnimationTimer);
    object.className = "grounding-object grounding-object--" + groundingVisualClass(step.sense);
    restartClassAnimation(object, "is-settling");
    sense.textContent = step.sense;
    var contextCopy = groundingContext(step.sense);
    context.textContent = contextCopy;
    context.hidden = !contextCopy;
    prompt.textContent = step.prompt;
    restartClassAnimation(prompt, "is-settling");
    button.textContent = step.button;
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
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

    setText(canvasFont(titleSize, serif, 500), "#f2ebdd");
    if (shouldDraw) context.fillText("给发作时的我", x, y);
    y += 92 * scale;

    setText(canvasFont(29 * scale, sans, 600), "#a7cbb8");
    if (shouldDraw) context.fillText("面对 · 接受 · 飘然 · 等它过去", x, y);
    y += 66 * scale;

    if (shouldDraw) {
      context.fillStyle = "rgba(190,211,200,0.24)";
      context.fillRect(x, y, maxWidth, Math.max(1, 2 * scale));
    }
    y += 42 * scale;

    function sectionLabel(label) {
      setText(canvasFont(labelSize, sans, 600), "#a7cbb8");
      if (shouldDraw) context.fillText(label, x, y);
      y += labelLine;
    }

    sectionLabel("我的锚点");
    setText(canvasFont(58 * scale, serif, 500), "#f2ebdd");
    if (shouldDraw) y = drawWrappedText(context, anchor, x, y, maxWidth, 76 * scale);
    else y += measureLines(anchor, maxWidth) * 76 * scale;
    y += sectionGap;

    sectionLabel("我熟悉的地方");
    setText(canvasFont(bodySize, serif, 400), "#c2d0c6");
    if (shouldDraw) y = drawWrappedText(context, scene, x, y, maxWidth, bodyLine);
    else y += measureLines(scene, maxWidth) * bodyLine;
    y += sectionGap;

    sectionLabel("我想对自己说");
    setText(canvasFont(bodySize, serif, 400), "#f2ebdd");
    words.forEach(function (word) {
      if (shouldDraw) {
        context.fillStyle = "#77ab90";
        context.beginPath();
        context.arc(x + 8 * scale, y + 27 * scale, 5 * scale, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#f2ebdd";
        y = drawWrappedText(context, word, x + 30 * scale, y, maxWidth - 30 * scale, bodyLine);
      } else {
        y += measureLines(word, maxWidth - 30 * scale) * bodyLine;
      }
      y += 12 * scale;
    });
    y += 12 * scale;

    sectionLabel("到时可以做");
    setText(canvasFont(actionSize, sans, 500), "#c2d0c6");
    var rowHeight = 60 * scale;
    actions.forEach(function (action, index) {
      var column = index % 2;
      var row = Math.floor(index / 2);
      var actionX = x + column * 455;
      var actionY = y + row * rowHeight;
      if (shouldDraw) {
        context.fillStyle = "#77ab90";
        context.fillText("·", actionX, actionY);
        context.fillStyle = "#c2d0c6";
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
    background.addColorStop(0, "#19332c");
    background.addColorStop(0.55, "#132823");
    background.addColorStop(1, "#202a3b");
    context.fillStyle = background;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    var halo = context.createRadialGradient(880, 190, 0, 880, 190, 360);
    halo.addColorStop(0, "rgba(174,191,217,0.2)");
    halo.addColorStop(1, "rgba(174,191,217,0)");
    context.fillStyle = halo;
    context.fillRect(500, 0, 580, 600);

    context.strokeStyle = "rgba(190,211,200,0.2)";
    context.lineWidth = 2;
    roundedRect(context, 58, 58, 964, 1804, 52);
    context.stroke();

    context.font = canvasFont(51, '"Songti SC", "STSong", serif', 400);
    var measuredBottom = drawCardContent(context, draft, 1, false);
    var footerTop = 1660;
    var available = footerTop - 102;
    var scale = measuredBottom > available ? Math.max(0.84, available / measuredBottom) : 1;
    drawCardContent(context, draft, scale, true);

    context.fillStyle = "rgba(190,211,200,0.24)";
    context.fillRect(94, footerTop, 892, 2);
    context.textBaseline = "top";
    context.font = canvasFont(39, '"PingFang SC", "Microsoft YaHei", sans-serif', 500);
    context.fillStyle = "#a7cbb8";
    context.fillText("写于 " + localDateString() + "，那天我状态很好", 94, footerTop + 38);
    context.font = canvasFont(44, '"Songti SC", "STSong", serif', 400);
    context.fillStyle = "#c2d0c6";
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
    state.waitWindowLength = WAIT_WINDOW_MIN_LENGTH;
    state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
    state.waitWindowInput = [];
    state.waitWindowPhase = "showing";
    state.waitWindowShowIndex = -1;
    state.waitWindowRound = 0;
    state.waitFogSeed = randomFogSeed();
  }

  app.addEventListener("click", function (event) {
    var control = event.target.closest("[data-action]");
    if (!control) return;
    var action = control.getAttribute("data-action");
    var next = control.getAttribute("data-next");

    if (action === "start") {
      resetEmergencyRun();
      navigate("checkin");
    } else if (action === "start-game") {
      state.gamesReturnRoute = state.route;
      navigate("games");
    } else if (action === "games-back") {
      navigate(state.gamesReturnRoute || "checkin");
    } else if (action === "games") {
      navigate("games");
    } else if (action === "play-windows" || action === "play-fog") {
      state.waitActivity = action === "play-fog" ? "fog" : "windows";
      if (state.waitActivity === "windows") {
        state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
        state.waitWindowInput = [];
        state.waitWindowPhase = "showing";
        state.waitWindowShowIndex = -1;
      }
      if (!state.waitStartedAt) state.waitStartedAt = Date.now();
      navigate("wait");
    } else if (action === "play-trivia" || action === "trivia-home") {
      navigate("trivia-home");
    } else if (action === "trivia-drawers") {
      navigate("trivia-drawers");
    } else if (action === "trivia-category") {
      state.triviaCategory = control.getAttribute("data-category") || "nature";
      render();
    } else if (action === "trivia-pick") {
      openTriviaQuestion(triviaQuestionById(control.getAttribute("data-question-id") || ""), "drawer");
    } else if (action === "trivia-random") {
      openRandomTrivia("");
    } else if (action === "trivia-answer") {
      revealTriviaAnswer(Number(control.getAttribute("data-answer-index")));
    } else if (action === "trivia-next") {
      openRandomTrivia(state.triviaOrigin === "drawer" ? state.triviaCategory : "");
    } else if (action === "calm") {
      navigate("calm");
    } else if (action === "open-learn") {
      navigate("learn");
    } else if (action === "open-learn-article") {
      state.learnNote = control.getAttribute("data-note") || "second-fear";
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
      var groundAnswer = recordGroundingAnswer();
      if (!groundAnswer) {
        var groundField = document.getElementById("ground-answer");
        if (groundField) groundField.focus();
        return;
      }
      if (state.groundIndex < state.groundSteps.length - 1) {
        state.groundIndex += 1;
        updateGroundingStep();
      } else {
        if (!state.waitStartedAt) state.waitStartedAt = Date.now();
        navigate("wait");
      }
    } else if (action === "wait-window") {
      chooseWaitWindow(control);
    } else if (action === "wait-replay") {
      startWaitWindowPlayback(true);
    } else if (action === "wait-difficulty") {
      changeWaitWindowDifficulty();
    } else if (action === "wait-switch") {
      state.waitActivity = state.waitActivity === "windows" ? "fog" : "windows";
      if (state.waitActivity === "windows") {
        state.waitWindowSequence = createWaitWindowSequence(state.waitWindowLength);
        state.waitWindowInput = [];
        state.waitWindowPhase = "showing";
        state.waitWindowShowIndex = -1;
      }
      navigate("wait", true);
    } else if (action === "fog-reveal") {
      if (event.detail === 0) revealFogForKeyboard();
    } else if (action === "fog-new") {
      showNewFogScene();
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
    getWaitSequence: function () { return state.waitWindowSequence.slice(); },
    getWaitWindowLength: function () { return state.waitWindowLength; },
    getWaitWindowPhase: function () { return state.waitWindowPhase; },
    getFogRevealRatio: function () { return Object.keys(fogVisited).length / (FOG_GRID_COLUMNS * FOG_GRID_ROWS); },
    getTriviaCount: function () { return TRIVIA_QUESTIONS.length; },
    getTriviaSeenIds: function () { return state.triviaSeenIds.slice(); },
    getTriviaQuestion: function () {
      var question = triviaQuestionById(state.triviaQuestionId);
      if (!question) return null;
      return { id: question.id, category: question.category, answerIndex: question.answerIndex, answer: question.answer };
    },
    getCardSize: function () { return { width: CARD_WIDTH, height: CARD_HEIGHT }; },
    getWaitMessage: waitMessageFor,
    generateCard: function () {
      state.cardDataUrl = generateCardDataUrl(state.draft);
      return state.cardDataUrl;
    },
  };
}());
