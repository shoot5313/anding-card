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
    subtitle: document.querySelector('.home-subtitle').textContent
  })`);
  const initialState = JSON.parse(initial);
  assert.equal(initialState.route, "home");
  assert.equal(initialState.width, initialState.viewport);
  assert.ok(initialState.emergencyHeight >= 64);
  assert.equal(initialState.footerVisible, true);
  assert.equal(initialState.webInstall, expectsWebLayer);
  assert.equal(initialState.brand, "缓一缓");
  assert.equal(initialState.subtitle, "它会过去");

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

  for (let index = 0; index < 5; index += 1) {
    await evaluate(sessionId, "document.querySelector('[data-action=ground-next]').click()");
  }
  assert.equal(await evaluate(sessionId, "document.querySelector('#grounding-object').classList.contains('grounding-object--touch')"), true);
  for (let index = 5; index < 15; index += 1) {
    await evaluate(sessionId, "document.querySelector('[data-action=ground-next]').click()");
  }
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "wait");
  assert.match(await evaluate(sessionId, "document.querySelector('#wait-timer').textContent"), /^00:0[01]$/);
  const traceState = JSON.parse(await evaluate(sessionId, `(() => {
    const svg = document.querySelector('.wait-trace');
    const lead = document.querySelector('#wait-trace-lead');
    const point = svg.createSVGPoint();
    point.x = Number(lead.getAttribute('cx'));
    point.y = Number(lead.getAttribute('cy'));
    const screenPoint = point.matrixTransform(svg.getScreenCTM());
    const board = document.querySelector('#wait-trace-board');
    board.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', clientX: screenPoint.x, clientY: screenPoint.y }));
    return JSON.stringify({
      finger: document.querySelector('#wait-trace-finger').classList.contains('is-visible'),
      following: board.classList.contains('is-following'),
      copy: document.querySelector('#wait-trace-copy').textContent
    });
  })()`));
  assert.equal(traceState.finger, true);
  assert.equal(traceState.following, true);
  assert.match(traceState.copy, /就这样/);
  const waitFits = await evaluate(sessionId, `(() => {
    const copy = document.querySelector('#wait-copy').getBoundingClientRect();
    const button = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return copy.bottom < button.top;
  })()`);
  assert.equal(waitFits, true, "wait activity must not collide with the primary action");
  await evaluate(sessionId, "document.querySelector('[data-action=wait-done]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "words");
  const wordsFit = await evaluate(sessionId, `(() => {
    const list = document.querySelector('.words-list').getBoundingClientRect();
    const button = document.querySelector('.calm-actions .primary-button').getBoundingClientRect();
    return list.bottom < button.top;
  })()`);
  assert.equal(wordsFit, true, "default words must not collide with the primary action");

  await evaluate(sessionId, "document.querySelector('[data-action=home]').click()");
  await evaluate(sessionId, "document.querySelector('[data-action=prepare]').click()");
  assert.equal(await evaluate(sessionId, "window.__ANDING_CARD__.getRoute()"), "prepare");
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
