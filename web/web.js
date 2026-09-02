(function () {
  "use strict";

  var deferredInstallPrompt = null;
  var app = document.getElementById("app");

  function isStandalone() {
    var displayMode = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    return Boolean(displayMode || window.navigator.standalone);
  }

  function installStatus(message) {
    var status = document.querySelector(".web-install-note");
    if (status) status.textContent = message;
  }

  function ensureInstallControl() {
    var actions = document.querySelector(".home__secondary");
    if (!actions || actions.querySelector("[data-web-action=install]") || isStandalone()) return;

    var button = document.createElement("button");
    button.className = "text-button web-install-button";
    button.type = "button";
    button.setAttribute("data-web-action", "install");
    button.textContent = "放到手机桌面";

    var note = document.createElement("p");
    note.className = "web-install-note";
    note.setAttribute("aria-live", "polite");

    actions.appendChild(button);
    actions.appendChild(note);
  }

  async function requestInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      var choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installStatus(choice && choice.outcome === "accepted" ? "正在放到桌面。" : "以后也可以从浏览器菜单添加。");
      return;
    }
    installStatus("打开浏览器菜单，选择“添加到主屏幕”即可。");
  }

  function startFromShortcut() {
    var query = new URLSearchParams(window.location.search);
    if (query.get("start") !== "1") return;
    var start = document.querySelector("[data-action=start]");
    if (start) start.click();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    ensureInstallControl();
  });

  window.addEventListener("appinstalled", function () {
    deferredInstallPrompt = null;
    installStatus("已经放到手机桌面。");
  });

  document.addEventListener("click", function (event) {
    var control = event.target.closest("[data-web-action=install]");
    if (control) requestInstall();
  });

  if (app && window.MutationObserver) {
    new MutationObserver(ensureInstallControl).observe(app, { childList: true, subtree: true });
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {
        return;
      });
    });
  }

  ensureInstallControl();
  window.setTimeout(startFromShortcut, 0);
}());
