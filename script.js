/*
This is your site JavaScript code - you can add interactivity and carry out processing
- Initially the JS writes a message to the console, and moves a button you can add from the README
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");

// Theme toggle (light/dark) with persistence.
(() => {
  const STORAGE_KEY = "webar-theme";
  const root = document.documentElement;

  const getPreferredTheme = () => {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  };

  const getTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : getPreferredTheme();
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  };

  const resolveFromScript = (pathFromRoot) => {
    try {
      const scriptEl = Array.from(document.scripts).find((s) =>
        typeof s.src === "string" && /(?:^|\/|\\)script\.js(?:$|\?|#)/.test(s.src)
      );
      const base = scriptEl?.src || new URL("script.js", document.baseURI).toString();
      return new URL(pathFromRoot, base).toString();
    } catch {
      return pathFromRoot;
    }
  };

  const ICON_LIGHT = resolveFromScript("assets/light-mode.png");
  const ICON_DARK = resolveFromScript("assets/night-mode.png");

  const makeQrImageUrl = (text, size = 240) => {
    // Lightweight + no dependencies: use a QR image endpoint.
    // This avoids bundling a QR library in a static site.
    const data = encodeURIComponent(String(text));
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
  };

  // Allow sandboxed preview iframes (exercise runner) to request the *parent page* URL
  // via postMessage, so they can render a QR code that points to the real page.
  window.addEventListener("message", (event) => {
    const data = event?.data;
    if (!data || typeof data !== "object") return;
    if (data.type !== "webar:requestUrl") return;
    try {
      event.source?.postMessage(
        {
          type: "webar:url",
          token: data.token,
          url: window.location.href,
        },
        "*"
      );
    } catch {
      // Ignore cross-origin/sandbox edge cases.
    }
  });

  const updateToggleUi = (btn, theme) => {
    // Accessible label indicates the *next* mode.
    const next = theme === "dark" ? "Light" : "Dark";
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    btn.setAttribute("aria-label", `Switch to ${next.toLowerCase()} theme`);

    const img = btn.querySelector(".theme-toggle__png");
    if (img) img.src = theme === "dark" ? ICON_DARK : ICON_LIGHT;
  };

  const triggerSpin = (btn) => {
    btn.classList.remove("theme-toggle--spin");
    // Force reflow so the animation reliably restarts.
    void btn.offsetWidth;
    btn.classList.add("theme-toggle--spin");
  };

  // Apply ASAP to reduce theme flash.
  setTheme(getTheme());

  document.addEventListener("DOMContentLoaded", () => {
    const sticky = document.querySelector(".sticky");
    if (!sticky) return;

    let btn = document.getElementById("theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "theme-toggle";
      btn.className = "theme-toggle theme-toggle--header";

      // Use the provided PNG icon.
      btn.innerHTML = `<img class="theme-toggle__png" src="${getTheme() === "dark" ? ICON_DARK : ICON_LIGHT}" alt="" loading="lazy" decoding="async" />`;

      updateToggleUi(btn, getTheme());

      btn.addEventListener("click", () => {
        const current = root.dataset.theme === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        setTheme(next);
        updateToggleUi(btn, next);

        triggerSpin(btn);
      });

      btn.addEventListener("animationend", (e) => {
        if (e.animationName === "themeToggleSpin") btn.classList.remove("theme-toggle--spin");
      });
    }

    // Put the button inline with the title (but NOT inside the <a> link).
    let bar = sticky.querySelector(".sticky-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "sticky-bar";

      const navList = sticky.querySelector("ul");
      const titleLink = sticky.querySelector("a");

      if (navList) {
        sticky.insertBefore(bar, navList);
      } else {
        sticky.insertBefore(bar, sticky.firstChild);
      }

      if (titleLink) bar.appendChild(titleLink);
    }

    // Right-side actions (QR + theme)
    let actions = bar.querySelector(".sticky-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "sticky-actions";
      bar.appendChild(actions);
    }

    const qrSlot = document.getElementById("qr-slot");
    const isQrDisabledPage = (() => {
      const p = location.pathname || "";
      // Never show the QR button on the landing page or the Playground list page.
      return p === "/" || /(?:^|\/|\\)(?:index|exercises)\.html$/i.test(p);
    })();

    // QR button + floating modal (if a slot exists, render there; otherwise use header actions)
    if (!isQrDisabledPage && !document.getElementById("qr-toggle")) {
    const qrBtn = document.createElement("button");
    qrBtn.type = "button";
    qrBtn.id = "qr-toggle";
    qrBtn.className = "qr-toggle";
    qrBtn.innerHTML = `<span class="qr-toggle__label">QR</span>`;
    qrBtn.setAttribute("aria-label", "Show QR code for this page");
    qrBtn.setAttribute("aria-haspopup", "dialog");
    qrBtn.setAttribute("aria-expanded", "false");

    const qrModal = document.createElement("div");
    qrModal.className = "qr-modal";
    qrModal.setAttribute("role", "dialog");
    qrModal.setAttribute("aria-label", "QR code");
    qrModal.setAttribute("aria-hidden", "true");

    qrModal.innerHTML = `
      <div class="qr-modal__top">
        <h3 class="qr-modal__title">Open on phone</h3>
        <button type="button" class="qr-modal__close" aria-label="Close QR">×</button>
      </div>
      <div class="qr-modal__qr">
        <img class="qr-modal__img" alt="QR code" loading="lazy" decoding="async" />
      </div>
      <p class="qr-modal__hint">Scan the QR, or copy the link:</p>
      <div class="qr-modal__actions">
        <input class="qr-modal__url" type="text" readonly aria-label="Page URL" />
        <button type="button" class="qr-modal__copy">Copy</button>
      </div>
    `;

    document.body.appendChild(qrModal);

    const qrImg = qrModal.querySelector(".qr-modal__img");
    const qrUrlInput = qrModal.querySelector(".qr-modal__url");
    const qrClose = qrModal.querySelector(".qr-modal__close");
    const qrCopy = qrModal.querySelector(".qr-modal__copy");

    let qrOpen = false;
    const setQrOpen = (open) => {
      qrOpen = open;
      qrBtn.setAttribute("aria-expanded", open ? "true" : "false");
      qrModal.setAttribute("aria-hidden", open ? "false" : "true");
      qrModal.classList.toggle("qr-modal--open", open);

      if (open) {
        const url = window.location.href;
        if (qrUrlInput) qrUrlInput.value = url;
        if (qrImg) qrImg.src = makeQrImageUrl(url, 240);
      }
    };

    const closeIfClickedOutside = (event) => {
      if (!qrOpen) return;
      const target = event.target;
      if (target instanceof Node) {
        if (qrModal.contains(target) || qrBtn.contains(target)) return;
      }
      setQrOpen(false);
    };

    const closeOnEscape = (event) => {
      if (!qrOpen) return;
      if (event.key === "Escape") setQrOpen(false);
    };

    qrBtn.addEventListener("click", () => setQrOpen(!qrOpen));
    qrClose?.addEventListener("click", () => setQrOpen(false));

    qrCopy?.addEventListener("click", async () => {
      const url = qrUrlInput?.value || window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        qrCopy.textContent = "Copied";
        setTimeout(() => {
          qrCopy.textContent = "Copy";
        }, 650);
      } catch {
        window.prompt("Copy this link:", url);
      }
    });

    qrUrlInput?.addEventListener("click", () => {
      try {
        qrUrlInput.select();
      } catch {
        // No-op
      }
    });

    document.addEventListener("pointerdown", closeIfClickedOutside);
    document.addEventListener("keydown", closeOnEscape);

    if (qrSlot) {
      qrSlot.appendChild(qrBtn);
    } else {
      actions.appendChild(qrBtn);
    }
    }
    actions.appendChild(btn);
  });
})();
/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the "Next steps" in the README
*/
const emoji = document.querySelector("#emoji");
if (emoji) {
  const getRandomEmoji = () => {
    const emojis = [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
    ];
    emoji.innerHTML = emojis[~~(Math.random() * emojis.length)];
  };
  setInterval(getRandomEmoji, 1000);
}
// This is a single line JS comment


function copyCode(button) {
 // const button = this;
  console.log(button.parentElement)
  const pre = button.parentElement.querySelector('pre');
  const copyText = button.parentElement.querySelector('#copy-text');
  let code = pre.querySelector("code");
  let text = code.innerText;
  navigator.clipboard.writeText(text).then(() => {
        // Alert the user that the action took place.
        // Nobody likes hidden stuff being done under the hood!
        copyText.innerHTML ="Copied"
         setTimeout(() => {
           copyText.innerHTML ="Copy"
         },500)
    });
}

function copyGist(button) {
 // const button = this;
  console.log(button.parentElement)
  const pre = button.parentElement.querySelector('#gistParent');
  const copyText = button.parentElement.querySelector('#copy-text');
  let code = pre.querySelector("code");
  let text = code.innerText;
  navigator.clipboard.writeText(text).then(() => {
        // Alert the user that the action took place.
        // Nobody likes hidden stuff being done under the hood!
        copyText.innerHTML ="Copied"
         setTimeout(() => {
           copyText.innerHTML ="Copy"
         },500)
    });
}



//Get the button
var mybutton = document.getElementById("hoverBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (!mybutton) return;
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    mybutton.classList.add("is-visible");
  } else {
    mybutton.classList.remove("is-visible");
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

/*
This is a comment that can span multiple lines 
- use comments to make your own notes!

    (function () {
        var script = document.createElement("script");
        script.onload = function () {
            var stats = new Stats();
            document.body.appendChild(stats.dom);
            requestAnimationFrame(function loop() {
                stats.update();
                requestAnimationFrame(loop);
            });
        };
        script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
        document.head.appendChild(script);
    })();*/
