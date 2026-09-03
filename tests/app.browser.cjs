#!/usr/bin/env node

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtempSync } = require("node:fs");
const { rm } = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const requestedTarget = process.argv[2];
const url = requestedTarget
  ? (/^https?:\/\//.test(requestedTarget) ? requestedTarget : pathToFileURL(path.resolve(root, requestedTarget)).href)
  : pathToFileURL(path.join(root, "index.html")).href;
const expectsWebLayer = /\/site\/index\.html(?:[?#]|$)/.test(url) || /^https?:\/\//.test(url);
const profile = mkdtempSync("/tmp/anding-card-browser-");
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--no-first-run",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--disable-background-networking",
  "--no-proxy-server",
  `--user-data-dir=${profile}`,
  "--remote-debugging-pipe",
], { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });

let nextId = 0;
let buffer = "";
let stderr = "";
const pending = new Map();
const eventWaiters = [];

chrome.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
chrome.stdio[3].on("error", (error) => { stderr += `\nprotocol write pipe: ${error.stack || error.message}\n`; });
chrome.stdio[4].on("error", (error) => { stderr += `\nprotocol read pipe: ${error.stack || error.message}\n`; });
chrome.on("exit", (code, signal) => {
  const error = new Error(`Chrome exited early (code ${code}, signal ${signal})`);
  for (const waiter of pending.values()) waiter.reject(error);
  pending.clear();
  for (const waiter of eventWaiters.splice(0)) waiter.reject(error);
});

chrome.stdio[4].on("data", (chunk) => {
  buffer += chunk.toString();
  const messages = buffer.split("\0");
  buffer = messages.pop();
  for (const raw of messages) {
    if (!raw) continue;
    const message = JSON.parse(raw);
    if (message.id && pending.has(message.id)) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
      continue;
    }
    for (let index = eventWaiters.length - 1; index >= 0; index -= 1) {
      const waiter = eventWaiters[index];
      if (waiter.method === message.method && (!waiter.sessionId || waiter.sessionId === message.sessionId)) {
        eventWaiters.splice(index, 1);
        waiter.resolve(message.params);
      }
    }
  }
});

function send(method, params = {}, sessionId) {
  const id = ++nextId;
  const message = { id, method, params };
  if (sessionId) message.sessionId = sessionId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    chrome.stdio[3].write(`${JSON.stringify(message)}\0`);
  });
}

function waitForEvent(method, sessionId) {
  return new Promise((resolve, reject) => eventWaiters.push({ method, sessionId, resolve, reject }));
}

async function evaluate(sessionId, expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || "browser evaluation failed");
  }
  return response.result.value;
}

async function run() {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  }, sessionId);
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  }, sessionId);

  const loaded = waitForEvent("Page.loadEventFired", sessionId);
  await send("Page.navigate", { url }, sessionId);
  await loaded;
  await evaluate(sessionId, "document.fonts ? document.fonts.ready : Promise.resolve()");

  const initial = await evaluate(sessionId, `JSON.stringify({
    route: window.__ANDING_CARD__.getRoute(),
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    emergencyHeight: document.querySelector('[data-action=start]').getBoundingClientRect().height,
    footerVisible: document.querySelector('.boundary-footer').getBoundingClientRect().bottom <= innerHeight,
    webInstall: Boolean(document.querySelector('[data-web-action=install]')),
    brand: document.querySelector('.home-title').textContent,
    subtitle: document.querySelector('.home-subtitle').textContent,
    calmLabel: document.querySelector('[data-action=calm]').textContent,
    textActionBorder: getComputedStyle(document.querySelector('[data-action=understand]')).borderTopStyle,
    textActionHeight: document.querySelector('[data-action=understand]').getBoundingClientRect().height,
    plainTextBorder: getComputedStyle(document.querySelector('.home-note')).borderTopStyle
  })`);
  const initialState = JSON.parse(initial);
  assert.equal(initialState.route, "home");
  assert.equal(initialState.width, initialState.viewport);
  assert.ok(initialState.emergencyHeight >= 64);
  assert.equal(initialState.footerVisible, true);
  assert.equal(initialState.webInstall, expectsWebLayer);
  assert.equal(initialState.brand, "缓一缓");
  assert.equal(initialState.subtitle, "它会过去");
  assert.equal(initialState.calmLabel, "我现在还好");
  assert.equal(initialState.textActionBorder, "solid");
  assert.ok(initialState.textActionHeight >= 44);
  assert.equal(initialState.plainTextBorder, "none");

  const understandState = JSON.parse(await evaluate(sessionId, `(() => {
    document.querySelector('[data-action=understand]').click();
    const books = Array.from(document.querySelectorAll('.book-title'), (item) => item.textContent);
    return JSON.stringify({
      route: window.__ANDING_CARD__.getRoute(),
      title: document.querySelector('.page-title').textContent,
      lead: document.querySelector('.understand-lead').textContent,
      books,
      practiceLine: document.querySelector('.paper-tiger-line').textContent,
      notesAction: document.querySelector('[data-action=open-learn]').textContent
    });
  })()`));
  assert.equal(understandState.route, "understand");
  assert.match(understandState.title, /纸老虎/);
  assert.match(understandState.lead, /很难受/);
  assert.equal(understandState.books[0], "《焦虑症的自救》");
  assert.equal(understandState.books[1], "《焦虑症与恐惧症手册》");
  assert.match(understandState.practiceLine, /一次次发作/);
  assert.match(understandState.practiceLine, /经验就在这些时刻/);
  assert.match(understandState.notesAction, /已经写好的笔记/);
  await evaluate(sessionId, "document.querySelector('[data-action=understand-back]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "home");

  if (/^https?:\/\//.test(url)) {
    const pwaState = JSON.parse(await evaluate(sessionId, `(async () => {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('service worker timeout')), 5000))
      ]);
      return JSON.stringify({
        scope: registration.scope,
        manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href')
      });
    })()`));
    assert.equal(pwaState.scope, new URL("./", url).href);
    assert.equal(pwaState.manifest, "./manifest.webmanifest");
  }

  await evaluate(sessionId, "document.querySelector('[data-action=start]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "checkin");
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('[data-action=choose-need]').length"), 5);

  await evaluate(sessionId, "document.querySelector('[data-need=heart]').click()");
  await evaluate(sessionId, "document.querySelector('[data-position=sitting]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=orient-ready]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "accept");
  const livedVoice = JSON.parse(await evaluate(sessionId, `(() => {
    const before = document.querySelector('#lived-support-word').textContent;
    document.querySelector('[data-action=support-swap]').click();
    const after = document.querySelector('#lived-support-word').textContent;
    const voice = document.querySelector('.lived-voice').getBoundingClientRect();
    const action = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return JSON.stringify({ before, after, fits: voice.bottom < action.top });
  })()`));
  assert.match(livedVoice.before, /那又怎样/);
  assert.notEqual(livedVoice.after, livedVoice.before);
  assert.equal(livedVoice.fits, true);
  await evaluate(sessionId, "document.querySelector('[data-action=words]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=home]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=start]').click()");

  await evaluate(sessionId, "document.querySelector('[data-need=unreal]').click()");
  await evaluate(sessionId, "document.querySelector('[data-position=standing]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=orient-ready]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "ground");
  await evaluate(sessionId, "document.querySelector('[data-action=words]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=home]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=start]').click()");

  await evaluate(sessionId, "document.querySelector('[data-need=breath]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "orient");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getNeed()"), "breath");
  await evaluate(sessionId, "document.querySelector('[data-position=sitting]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "orient");
  await evaluate(sessionId, "document.querySelector('[data-action=orient-ready]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "breathe");
  assert.equal(await evaluate(sessionId, "document.querySelector('#breathing-label').textContent"), "按住");
  const heldBreath = JSON.parse(await evaluate(sessionId, `(() => {
    const circle = document.querySelector('[data-action=breath-touch]');
    circle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 195, clientY: 330 }));
    return JSON.stringify({ label: document.querySelector('#breathing-label').textContent, held: circle.classList.contains('is-held') });
  })()`));
  assert.deepEqual(heldBreath, { label: "吸", held: true });
  const releasedBreath = JSON.parse(await evaluate(sessionId, `(() => {
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
    const circle = document.querySelector('[data-action=breath-touch]');
    return JSON.stringify({ label: document.querySelector('#breathing-label').textContent, releasing: circle.classList.contains('is-releasing') });
  })()`));
  assert.deepEqual(releasedBreath, { label: "呼", releasing: true });
  await evaluate(sessionId, "document.querySelector('[data-action=next]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "ground");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getGroundCount()"), 15);
  assert.equal(await evaluate(sessionId, "document.querySelector('#grounding-object').classList.contains('grounding-object--see')"), true);
  assert.match(await evaluate(sessionId, "document.querySelector('#grounding-context').textContent"), /从手机上抬起来.*环顾四周.*所在的地方/);
  assert.equal(await evaluate(sessionId, "document.querySelector('[data-action=ground-next]').disabled"), true);
  const keyboardFit = JSON.parse(await evaluate(sessionId, `(() => {
    document.documentElement.classList.add('ground-keyboard-open');
    document.documentElement.style.setProperty('--app-height', '360px');
    const field = document.querySelector('#ground-answer').getBoundingClientRect();
    const button = document.querySelector('[data-action=ground-next]').getBoundingClientRect();
    const footer = document.querySelector('.boundary-footer').getBoundingClientRect();
    const secondaryDisplay = getComputedStyle(document.querySelector('.grounding-secondary')).display;
    const result = { fieldBottom: field.bottom, buttonTop: button.top, buttonBottom: button.bottom, footerTop: footer.top, secondaryDisplay };
    document.documentElement.classList.remove('ground-keyboard-open');
    document.documentElement.style.setProperty('--app-height', innerHeight + 'px');
    return JSON.stringify(result);
  })()`));
  assert.ok(keyboardFit.fieldBottom < keyboardFit.buttonTop);
  assert.ok(keyboardFit.buttonBottom < keyboardFit.footerTop);
  assert.equal(keyboardFit.secondaryDisplay, "none");
  const swappedGround = JSON.parse(await evaluate(sessionId, `(() => {
    const beforePrompt = document.querySelector('#grounding-prompt').textContent;
    const beforeSense = document.querySelector('#grounding-sense').textContent;
    const beforeIndex = window.__ANDING_CARD__.getGroundIndex();
    document.querySelector('[data-action=ground-swap]').click();
    return JSON.stringify({
      beforePrompt,
      afterPrompt: document.querySelector('#grounding-prompt').textContent,
      beforeSense,
      afterSense: document.querySelector('#grounding-sense').textContent,
      beforeIndex,
      afterIndex: window.__ANDING_CARD__.getGroundIndex()
    });
  })()`));
  assert.notEqual(swappedGround.afterPrompt, swappedGround.beforePrompt);
  assert.equal(swappedGround.afterSense, swappedGround.beforeSense);
  assert.equal(swappedGround.afterIndex, swappedGround.beforeIndex);
  const groundingActionsFit = JSON.parse(await evaluate(sessionId, `(() => {
    const swap = document.querySelector('[data-action=ground-swap]').getBoundingClientRect();
    const footer = document.querySelector('.boundary-footer').getBoundingClientRect();
    return JSON.stringify({ swapHeight: swap.height, swapBottom: swap.bottom, footerTop: footer.top });
  })()`));
  assert.ok(groundingActionsFit.swapHeight >= 44);
  assert.ok(groundingActionsFit.swapBottom < groundingActionsFit.footerTop);

  const emptyGround = JSON.parse(await evaluate(sessionId, `(() => {
    const field = document.querySelector('#ground-answer');
    const button = document.querySelector('[data-action=ground-next]');
    field.value = '   ';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    button.click();
    return JSON.stringify({ disabled: button.disabled, index: window.__ANDING_CARD__.getGroundIndex() });
  })()`));
  assert.equal(emptyGround.disabled, true);
  assert.equal(emptyGround.index, 0);

  const typedGround = JSON.parse(await evaluate(sessionId, `(() => {
    const field = document.querySelector('#ground-answer');
    field.value = '窗框';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    const button = document.querySelector('[data-action=ground-next]');
    const buttonLabel = button.textContent;
    const enabled = !button.disabled;
    button.click();
    return JSON.stringify({
      buttonLabel,
      enabled,
      index: window.__ANDING_CARD__.getGroundIndex(),
      cleared: document.querySelector('#ground-answer').value,
      echo: document.querySelector('#ground-answer-echo').textContent,
      nextDisabled: document.querySelector('[data-action=ground-next]').disabled
    });
  })()`));
  assert.equal(typedGround.buttonLabel, "写好了，继续");
  assert.equal(typedGround.enabled, true);
  assert.equal(typedGround.index, 1);
  assert.equal(typedGround.cleared, "");
  assert.match(typedGround.echo, /窗框/);
  assert.equal(typedGround.nextDisabled, true);

  for (let index = 0; index < 4; index += 1) {
    await evaluate(sessionId, `(() => {
      const field = document.querySelector('#ground-answer');
      field.value = '眼前的东西';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-action=ground-next]').click();
    })()`);
  }
  assert.equal(await evaluate(sessionId, "document.querySelector('#grounding-object').classList.contains('grounding-object--touch')"), true);
  for (let index = 5; index < 15; index += 1) {
    await evaluate(sessionId, `(() => {
      const field = document.querySelector('#ground-answer');
      field.value = '我找到了';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-action=ground-next]').click();
    })()`);
  }
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "wait");
  assert.match(await evaluate(sessionId, "document.querySelector('#wait-timer').textContent"), /^00:0[01]$/);
  assert.match(await evaluate(sessionId, "document.querySelector('.grounding-recall').textContent"), /我找到了/);
  await evaluate(sessionId, `new Promise((resolve, reject) => {
    const started = Date.now();
    function check() {
      if (window.__ANDING_CARD__.getWaitWindowPhase() === 'input') return resolve();
      if (Date.now() - started > 5000) return reject(new Error('window sequence did not finish playing'));
      setTimeout(check, 40);
    }
    check();
  })`);
  const windowState = JSON.parse(await evaluate(sessionId, `(() => {
    const windows = Array.from(document.querySelectorAll('[data-action=wait-window]'));
    const sequence = window.__ANDING_CARD__.getWaitSequence();
    const wrong = (sequence[0] + 1) % windows.length;
    windows[wrong].click();
    const patientCopy = document.querySelector('#wait-activity-status').textContent;
    document.querySelector('[data-action=wait-replay]').click();
    return JSON.stringify({
      count: windows.length,
      sequence,
      replayedSequence: window.__ANDING_CARD__.getWaitSequence(),
      lengthAfterReplay: window.__ANDING_CARD__.getWaitWindowLength(),
      patientCopy,
      phase: window.__ANDING_CARD__.getWaitWindowPhase(),
      replayLabel: document.querySelector('[data-action=wait-replay]').textContent,
      difficultyLabel: document.querySelector('[data-action=wait-difficulty]').textContent
    });
  })()`));
  assert.equal(windowState.count, 4);
  assert.equal(windowState.sequence.length, 3);
  assert.notEqual(windowState.sequence[0], windowState.sequence[1]);
  assert.notEqual(windowState.sequence[1], windowState.sequence[2]);
  assert.match(windowState.patientCopy, /忘了很正常/);
  assert.deepEqual(windowState.replayedSequence, windowState.sequence);
  assert.equal(windowState.lengthAfterReplay, 3);
  assert.equal(windowState.phase, "showing");
  assert.match(windowState.replayLabel, /再看一遍/);
  assert.match(windowState.difficultyLabel, /四扇/);
  await evaluate(sessionId, `new Promise((resolve, reject) => {
    const started = Date.now();
    function check() {
      if (window.__ANDING_CARD__.getWaitWindowPhase() === 'input') return resolve();
      if (Date.now() - started > 6000) return reject(new Error('window sequence did not replay'));
      setTimeout(check, 40);
    }
    check();
  })`);
  const difficultyState = JSON.parse(await evaluate(sessionId, `(() => {
    const before = window.__ANDING_CARD__.getWaitSequence();
    document.querySelector('[data-action=wait-difficulty]').click();
    return JSON.stringify({
      before,
      after: window.__ANDING_CARD__.getWaitSequence(),
      length: window.__ANDING_CARD__.getWaitWindowLength(),
      phase: window.__ANDING_CARD__.getWaitWindowPhase(),
      prompt: document.querySelector('#wait-window-prompt').textContent,
      nextLabel: document.querySelector('[data-action=wait-difficulty]').textContent
    });
  })()`));
  assert.equal(difficultyState.before.length, 3);
  assert.equal(difficultyState.after.length, 4);
  assert.equal(difficultyState.length, 4);
  assert.equal(difficultyState.phase, "showing");
  assert.match(difficultyState.prompt, /四扇/);
  assert.match(difficultyState.nextLabel, /五扇/);
  await evaluate(sessionId, `new Promise((resolve, reject) => {
    const started = Date.now();
    function check() {
      if (window.__ANDING_CARD__.getWaitWindowPhase() === 'input') return resolve();
      if (Date.now() - started > 7000) return reject(new Error('harder window sequence did not finish playing'));
      setTimeout(check, 40);
    }
    check();
  })`);
  const replayedWindow = JSON.parse(await evaluate(sessionId, `(() => {
    const sequence = window.__ANDING_CARD__.getWaitSequence();
    const buttons = Array.from(document.querySelectorAll('[data-action=wait-window]'));
    sequence.forEach((index) => buttons[index].click());
    const first = buttons[0].getBoundingClientRect();
    return JSON.stringify({
      sequence,
      status: document.querySelector('#wait-activity-status').textContent,
      phase: window.__ANDING_CARD__.getWaitWindowPhase(),
      minWidth: first.width,
      minHeight: first.height
    });
  })()`));
  assert.equal(replayedWindow.sequence.length, 4);
  assert.match(replayedWindow.status, /记住了/);
  assert.equal(replayedWindow.phase, "rest");
  assert.ok(replayedWindow.minWidth >= 100);
  assert.ok(replayedWindow.minHeight >= 56);

  await evaluate(sessionId, "document.querySelector('[data-action=wait-switch]').click()");
  const fogState = JSON.parse(await evaluate(sessionId, `(() => {
    const board = document.querySelector('#wait-fog-board');
    const cover = document.querySelector('#wait-fog-canvas');
    const scene = document.querySelector('#wait-fog-scene');
    const bounds = board.getBoundingClientRect();
    const colors = new Set();
    const sceneContext = scene.getContext('2d');
    for (let row = 1; row < 5; row += 1) {
      for (let column = 1; column < 7; column += 1) {
        const pixel = sceneContext.getImageData(
          Math.floor(scene.width * column / 7),
          Math.floor(scene.height * row / 5),
          1,
          1
        ).data;
        colors.add(Array.from(pixel).join(','));
      }
    }
    const rows = [0.08, 0.25, 0.42, 0.59, 0.76, 0.92];
    rows.forEach((portion, index) => {
      const fromX = bounds.left + (index % 2 ? bounds.width - 8 : 8);
      const toX = bounds.left + (index % 2 ? 8 : bounds.width - 8);
      const y = bounds.top + bounds.height * portion;
      board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 20 + index, clientX: fromX, clientY: y }));
      board.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', pointerId: 20 + index, clientX: toX, clientY: y }));
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 20 + index, clientX: toX, clientY: y }));
    });
    const alpha = cover.getContext('2d').getImageData(Math.floor(cover.width / 2), Math.floor(cover.height / 2), 1, 1).data[3];
    return JSON.stringify({
      alpha,
      display: getComputedStyle(cover).display,
      complete: cover.classList.contains('is-cleared'),
      revealRatio: window.__ANDING_CARD__.getFogRevealRatio(),
      sceneColors: colors.size,
      status: document.querySelector('#wait-activity-status').textContent,
      boardWidth: bounds.width,
      boardHeight: bounds.height
    });
  })()`));
  assert.equal(fogState.alpha, 0);
  assert.equal(fogState.display, "block");
  assert.equal(fogState.complete, true);
  assert.ok(fogState.revealRatio >= 0.78);
  assert.ok(fogState.sceneColors >= 6);
  assert.match(fogState.status, /整幅图景/);
  assert.ok(fogState.boardWidth >= 280);
  assert.ok(fogState.boardHeight >= 170);

  const newFog = JSON.parse(await evaluate(sessionId, `(() => {
    const before = document.querySelector('#wait-fog-canvas').getAttribute('data-seed');
    document.querySelector('[data-action=fog-new]').click();
    const canvas = document.querySelector('#wait-fog-canvas');
    const alpha = canvas.getContext('2d').getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data[3];
    return JSON.stringify({
      changed: before !== canvas.getAttribute('data-seed'),
      alpha,
      revealRatio: window.__ANDING_CARD__.getFogRevealRatio(),
      status: document.querySelector('#wait-activity-status').textContent
    });
  })()`));
  assert.equal(newFog.changed, true);
  assert.equal(newFog.alpha, 255);
  assert.equal(newFog.revealRatio, 0);
  assert.match(newFog.status, /新的一幅/);

  await evaluate(sessionId, "document.querySelector('[data-action=wait-switch]').click()");
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('[data-action=wait-window]').length"), 4);
  const waitFits = await evaluate(sessionId, `(() => {
    const copy = document.querySelector('#wait-copy').getBoundingClientRect();
    const button = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return copy.bottom < button.top;
  })()`);
  assert.equal(waitFits, true, "wait activity must not collide with the primary action");
  const waitSupport = JSON.parse(await evaluate(sessionId, `(() => {
    const control = document.querySelector('[data-action=wait-more]');
    control.click();
    const first = document.querySelector('#wait-acknowledgement').textContent;
    control.click();
    const second = document.querySelector('#wait-acknowledgement').textContent;
    const acknowledgement = document.querySelector('#wait-acknowledgement').getBoundingClientRect();
    const button = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return JSON.stringify({ first, second, fits: acknowledgement.bottom < button.top });
  })()`));
  assert.match(waitSupport.first, /那又怎样/);
  assert.notEqual(waitSupport.second, waitSupport.first);
  assert.equal(waitSupport.fits, true);

  await send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 360,
    screenHeight: 640,
  }, sessionId);
  await evaluate(sessionId, "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
  const compactWait = JSON.parse(await evaluate(sessionId, `(() => {
    const acknowledgement = document.querySelector('#wait-acknowledgement').getBoundingClientRect();
    const primary = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    const secondary = document.querySelector('.wait-action-row').getBoundingClientRect();
    const footer = document.querySelector('.boundary-footer').getBoundingClientRect();
    return JSON.stringify({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      contentGap: primary.top - acknowledgement.bottom,
      actionGap: footer.top - secondary.bottom
    });
  })()`));
  assert.equal(compactWait.width, compactWait.viewport);
  assert.ok(compactWait.contentGap >= 8, JSON.stringify(compactWait));
  assert.ok(compactWait.actionGap >= 8, JSON.stringify(compactWait));
  await evaluate(sessionId, "document.querySelector('[data-action=wait-switch]').click()");
  const compactFog = JSON.parse(await evaluate(sessionId, `(() => {
    const acknowledgement = document.querySelector('#wait-acknowledgement').getBoundingClientRect();
    const primary = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    const board = document.querySelector('#wait-fog-board').getBoundingClientRect();
    const secondary = document.querySelector('.wait-action-row').getBoundingClientRect();
    const footer = document.querySelector('.boundary-footer').getBoundingClientRect();
    return JSON.stringify({
      contentGap: primary.top - acknowledgement.bottom,
      actionGap: footer.top - secondary.bottom,
      boardHeight: board.height
    });
  })()`));
  assert.ok(compactFog.boardHeight >= 120, JSON.stringify(compactFog));
  assert.ok(compactFog.contentGap >= 8, JSON.stringify(compactFog));
  assert.ok(compactFog.actionGap >= 8, JSON.stringify(compactFog));
  await evaluate(sessionId, "document.querySelector('[data-action=wait-switch]').click()");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  }, sessionId);
  await evaluate(sessionId, "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))");

  await evaluate(sessionId, "document.querySelector('[data-action=wait-done]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "words");
  const wordsFit = await evaluate(sessionId, `(() => {
    const list = document.querySelector('.words-memory').getBoundingClientRect();
    const button = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return list.bottom < button.top;
  })()`);
  assert.equal(wordsFit, true, "default words must not collide with the primary action");

  await evaluate(sessionId, "document.querySelector('[data-action=home]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=calm]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "calm");
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('.calm-entry').length"), 4);
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('.calm-entry__arrow').length"), 4);
  assert.match(await evaluate(sessionId, "document.querySelector('.calm-entry__arrow').textContent"), /打开/);

  await evaluate(sessionId, "document.querySelector('[data-action=open-learn]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "learn");
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('.note-card').length"), 3);
  await evaluate(sessionId, "document.querySelector('[data-action=open-learn-article]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "learn-article");
  const layerLearning = JSON.parse(await evaluate(sessionId, `(() => {
    const second = document.querySelector('[data-layer=second]');
    second.click();
    return JSON.stringify({
      pressed: second.getAttribute('aria-pressed'),
      copy: document.querySelector('#learn-layer-copy').textContent
    });
  })()`));
  assert.equal(layerLearning.pressed, "true");
  assert.match(layerLearning.copy, /第二声/);

  await evaluate(sessionId, "document.querySelector('[data-action=open-learn]').click()");
  await evaluate(sessionId, "document.querySelector('[data-note=accept]').click()");
  assert.match(await evaluate(sessionId, "document.querySelector('.note-article__header h1').textContent"), /来吧，老朋友/);
  assert.match(await evaluate(sessionId, "document.querySelector('.personal-line').textContent"), /你可以在这里/);
  await evaluate(sessionId, "document.querySelector('[data-action=open-learn]').click()");
  await evaluate(sessionId, "document.querySelector('[data-note=setback]').click()");
  assert.match(await evaluate(sessionId, "document.querySelector('.note-article__header h1').textContent"), /路还在/);
  await evaluate(sessionId, "document.querySelector('[data-action=open-learn]').click()");
  await evaluate(sessionId, "document.querySelector('[data-note=workbook]').click()");
  assert.match(await evaluate(sessionId, "document.querySelector('.note-article__header h1').textContent"), /用得上的/);
  assert.equal(await evaluate(sessionId, "document.querySelectorAll('.note-route-list li').length"), 4);

  await evaluate(sessionId, "document.querySelector('[data-action=open-practice]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "practice");
  await evaluate(sessionId, "document.querySelector('[data-focus=feet]').click()");
  await evaluate(sessionId, "document.querySelector('[data-quality=\"有压力\"]').click()");
  assert.match(await evaluate(sessionId, "document.querySelector('.practice-result').textContent"), /有压力/);
  await evaluate(sessionId, "document.querySelector('[data-action=calm]').click()");

  await evaluate(sessionId, "document.querySelector('[data-action=open-reflection]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "reflection");
  const reflection = JSON.parse(await evaluate(sessionId, `(() => {
    const values = {
      'reflection-fear': '心跳漏了一下',
      'reflection-meaning': '我以为它会停',
      'reflection-reality': '后来它慢慢平静了',
      'reflection-next': '那又怎样？'
    };
    Object.keys(values).forEach((id) => {
      const field = document.querySelector('#' + id);
      field.value = values[id];
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.querySelector('#reflection-form button[type=submit]').click();
    return JSON.stringify({
      text: document.querySelector('.reflection-sheet').textContent,
      persistedKeys: Object.keys(localStorage).filter((key) => /reflection/i.test(key))
    });
  })()`));
  assert.match(reflection.text, /心跳漏了一下/);
  assert.match(reflection.text, /后来它慢慢平静了/);
  assert.deepEqual(reflection.persistedKeys, []);
  await evaluate(sessionId, "document.querySelector('[data-action=calm]').click()");

  await evaluate(sessionId, "document.querySelector('[data-action=prepare]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "prepare");
  assert.equal(await evaluate(sessionId, "document.querySelector('.page-back').textContent"), "回到平时");
  assert.equal(await evaluate(sessionId, "document.querySelector('#anchor').value"), "");
  const examples = JSON.parse(await evaluate(sessionId, `(() => {
    document.querySelector('[data-action=use-anchor-example]').click();
    const anchor = document.querySelector('#anchor').value;
    document.querySelector('[data-action=use-scene-example]').click();
    return JSON.stringify({
      anchor,
      place: document.querySelector('#scene-place').value,
      preview: document.querySelector('#scene-preview').textContent
    });
  })()`));
  assert.equal(examples.anchor, "雨天的假山");
  assert.equal(examples.place, "雪天的公园湖边");
  assert.match(examples.preview, /家人朋友在随便聊天/);
  const preview = await evaluate(sessionId, `(() => {
    const field = document.querySelector('#scene-place');
    field.value = '门边的旧木椅';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelector('#scene-preview').textContent;
  })()`);
  assert.match(preview, /门边的旧木椅/);

  await evaluate(sessionId, "document.querySelector('#prepare-form button[type=submit]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "card");
  const card = JSON.parse(await evaluate(sessionId, `JSON.stringify({
    width: document.querySelector('.card-preview').naturalWidth,
    height: document.querySelector('.card-preview').naturalHeight,
    prefix: document.querySelector('.card-preview').src.slice(0, 22)
  })`));
  assert.deepEqual(card, { width: 1080, height: 1920, prefix: "data:image/png;base64," });

  const saved = JSON.parse(await evaluate(sessionId, `(async () => {
    const calls = [];
    window.xhs = { miniTool: {
      writeTempFile: async ({ data }) => { calls.push(['write', data.slice(0, 22)]); return { filePath: '/tmp/card.png' }; },
      saveImageToPhotosAlbum: async ({ filePath }) => { calls.push(['save', filePath]); }
    }};
    document.querySelector('[data-action=save-card]').click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    return JSON.stringify({ calls, status: document.querySelector('#save-status').textContent });
  })()`));
  assert.deepEqual(saved.calls, [
    ["write", "data:image/png;base64,"],
    ["save", "/tmp/card.png"],
  ]);
  assert.equal(saved.status, "已保存到相册。");

  await evaluate(sessionId, "document.querySelector('[data-global-action=help]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "help");
  assert.equal(await evaluate(sessionId, "document.querySelector('.phone-link').getAttribute('href')"), "tel:12356");

  process.stdout.write("PASS: mobile emergency flow, card rendering, and album bridge\n");
}

run()
  .catch((error) => {
    process.stderr.write(`${error.stack}\n${stderr}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (chrome.exitCode === null) {
      chrome.kill("SIGTERM");
      await new Promise((resolve) => chrome.once("exit", resolve));
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {});
  });
