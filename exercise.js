(() => {
  const STORAGE_KEY = "webar4d.exercise.v1";

  const htmlEl = document.getElementById("ex-html");
  const cssEl = document.getElementById("ex-css");
  const jsEl = document.getElementById("ex-js");
  const frameEl = document.getElementById("ex-frame");

  const runBtn = document.getElementById("ex-run");
  const resetBtn = document.getElementById("ex-reset");
  const openBtn = document.getElementById("ex-open");

  const templatesBarEl = document.getElementById("ex-templates");
  const descriptionEl = document.getElementById("ex-description");
  const templatesScriptEl = document.getElementById("webar-exercise-templates");

  if (!htmlEl || !cssEl || !jsEl || !frameEl) return;

  const setupMenuOverlay = () => {
    const menuBtn = document.getElementById("ex-menu-btn");
    const menu = document.getElementById("ex-menu");
    if (!menuBtn || !menu) return;

    const closeBtn = document.getElementById("ex-menu-close");
    const backdrop = menu.querySelector(".exercise-menu-backdrop");

    const openMenu = () => {
      menu.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      closeBtn?.focus();
    };

    const closeMenu = () => {
      menu.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus();
    };

    menuBtn.addEventListener("click", () => {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    backdrop?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        e.preventDefault();
        closeMenu();
      }
    });
  };

  const setupFileSwitching = () => {
    const fileButtons = Array.from(document.querySelectorAll("[data-ex-file]"));
    const editors = Array.from(document.querySelectorAll("[data-ex-editor]"));
    if (fileButtons.length === 0 || editors.length === 0) return;

    const setActive = (file) => {
      for (const btn of fileButtons) {
        btn.classList.toggle("is-active", btn.getAttribute("data-ex-file") === file);
      }
      for (const ed of editors) {
        ed.classList.toggle("is-active", ed.getAttribute("data-ex-editor") === file);
      }

      if (file === "html") htmlEl.focus();
      if (file === "css") cssEl.focus();
      if (file === "js") jsEl.focus();
    };

    for (const btn of fileButtons) {
      btn.addEventListener("click", () => {
        const file = btn.getAttribute("data-ex-file");
        if (!file) return;
        setActive(file);
      });
    }

    const anyActive = fileButtons.some((b) => b.classList.contains("is-active"));
    if (!anyActive) setActive("html");
  };

  const starter = {
    html: `<!-- Exercise 1: Make something spin. Then change its color. -->
<a-scene embedded>
  <a-box
    position="0 1.2 -3"
    rotation="0 45 0"
    color="#4CC3D9"
    animation="property: rotation; to: 0 405 0; loop: true; dur: 4000"
  ></a-box>

  <a-sky color="#ECECEC"></a-sky>
</a-scene>
`,
    css: `html, body { height: 100%; margin: 0; }
a-scene { width: 100%; height: 70vh; }
`,
    js: `// JS runs inside the preview iframe.
// Tip: try changing entity attributes with setAttribute.
// Example:
// document.querySelector('a-box')?.setAttribute('color', '#FF00AA');
`,
    libs: {
      aframe: true,
      modelViewer: true,
    },
  };

  const normalizeTemplate = (raw, index) => {
    const id = typeof raw?.id === "string" && raw.id.trim() ? raw.id.trim() : `template-${index + 1}`;
    const title = typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim() : id;
    const description = typeof raw?.description === "string" ? raw.description : "";
    const libs = {
      aframe: Boolean(raw?.libs?.aframe),
      modelViewer: Boolean(raw?.libs?.modelViewer),
    };

    return {
      id,
      title,
      description,
      html: typeof raw?.html === "string" ? raw.html : "",
      css: typeof raw?.css === "string" ? raw.css : "",
      js: typeof raw?.js === "string" ? raw.js : "",
      libs,
    };
  };

  const loadTemplates = () => {
    if (!templatesScriptEl?.textContent) return [];
    try {
      const parsed = JSON.parse(templatesScriptEl.textContent);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeTemplate).filter((t) => t.id);
    } catch {
      return [];
    }
  };

  const templates = loadTemplates();
  const hasTemplates = templates.length > 0;
  // v3 bump: invalidates old saved snippets that referenced removed CDN assets.
  const storageKey = hasTemplates ? `webar4d.exercise.v3:${location.pathname}` : STORAGE_KEY;

  let currentTemplateId = hasTemplates ? templates[0].id : null;
  const getTemplateById = (id) => templates.find((t) => t.id === id) || null;

  const loadState = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const migrateSavedTemplateHtml = (templateId, html) => {
    if (typeof html !== "string") return html;

    // One-off migration: A-Frame exercises now use the hosted gummy bear model.
    if (templateId === "aframe-1-spin") {
      const gummy =
        '<a-entity\n' +
        '    id="box"\n' +
        '    class="clickable"\n' +
        '    gltf-model="https://noir-nft.s3.ap-south-1.amazonaws.com/red_gummy_bear.glb"\n' +
        '    position="0 1.2 -3"\n' +
        '    rotation="0 180 0"\n' +
        '    scale="0.6 0.6 0.6"\n' +
        '    animation="property: rotation; to: 0 540 0; loop: true; dur: 4000"\n' +
        '  ></a-entity>';

      return html
        .replace(/<a-box[\s\S]*?id="box"[\s\S]*?<\/a-box>/, gummy)
        .replaceAll("<a-cursor></a-cursor>", '<a-cursor rayOrigin="mouse"></a-cursor>');
    }

    if (templateId === "aframe-2-click") {
      const sphere =
        '<a-sphere\n' +
        '    id="ball"\n' +
        '    class="clickable"\n' +
        '    position="0 1.2 -3"\n' +
        '    radius="0.5"\n' +
        '    color="#FFC65D"\n' +
        '  ></a-sphere>';

      return html
        .replace(/<a-box[\s\S]*?id="ball"[\s\S]*?<\/a-box>/, sphere)
        .replace(/<a-entity[\s\S]*?id="ball"[\s\S]*?<\/a-entity>/, sphere)
        .replaceAll('value="Click the box"', 'value="Click the sphere"')
        .replaceAll('value="Click the gummy"', 'value="Click the sphere"')
        .replaceAll("<a-cursor></a-cursor>", '<a-cursor rayOrigin="mouse"></a-cursor>');
    }

    if (templateId === "aframe-3-position") {
      const gummy =
        '<a-entity\n' +
        '    id="box"\n' +
        '    gltf-model="https://noir-nft.s3.ap-south-1.amazonaws.com/red_gummy_bear.glb"\n' +
        '    position="0 1.2 -3"\n' +
        '    rotation="0 180 0"\n' +
        '    scale="0.6 0.6 0.6"\n' +
        '  ></a-entity>';

      let next = html.replace(/<a-box[^>]*id="box"[^>]*><\/a-box>/, gummy);
      next = next.replaceAll("<a-cursor></a-cursor>", '<a-cursor rayOrigin="mouse"></a-cursor>');
      next = next.replace('value="Use \u2190 and \u2192"', 'value="Use arrow keys"');
      next = next.replace('value="Use ← and →"', 'value="Use arrow keys"');
      next = next.replace('value="Use and"', 'value="Use arrow keys"');
      return next;
    }

    // One-off migration: model-viewer exercises now use the hosted gummy bear model.
    if (
      templateId === "modelviewer-1-card" ||
      templateId === "modelviewer-2-lighting" ||
      templateId === "modelviewer-3-hotspots" ||
      // Back-compat: older id name
      templateId === "modelviewer-3-annotations"
    ) {
      const legacyModelUrl = "https://noir-nft.s3.ap-south-1.amazonaws.com/" + "medusa.glb";
      const hostedGummyUrl = "https://noir-nft.s3.ap-south-1.amazonaws.com/" + "red_gummy_bear.glb";

      return html
        .replaceAll(legacyModelUrl, hostedGummyUrl)
        .replaceAll("../../assets/red_gummy_bear.glb", hostedGummyUrl)
        .replaceAll("<h3>Medusa</h3>", "<h3>Gummy</h3>");
    }

    return html;
  };

  const saveState = () => {
    const current = {
      html: htmlEl.value,
      css: cssEl.value,
      js: jsEl.value,
    };

    const state = hasTemplates
      ? {
          version: 2,
          selectedTemplateId: currentTemplateId,
          byTemplate: {
            ...(loadState()?.byTemplate || {}),
            ...(currentTemplateId ? { [currentTemplateId]: current } : {}),
          },
        }
      : current;

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore quota / blocked storage.
    }
  };

  const buildDocument = ({ html, css, js, libs }) => {
    const scripts = [];

    if (libs?.aframe) {
      scripts.push(
        `<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>`,
        `<script src="https://unpkg.com/aframe-event-set-component@5.x.x/dist/aframe-event-set-component.min.js"></script>`
      );
    }

    if (libs?.modelViewer) {
      scripts.push(
        `<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>`
      );
    }

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="${document.baseURI}">
    <title>WebAR 4 Gummies • Exercise Preview</title>
    <style>
${css || ""}
    </style>
    ${scripts.join("\n    ")}
  </head>
  <body>
${html || ""}

    <script>
${js || ""}
    </script>

    <script>
(() => {
  const qrButtons = Array.from(document.querySelectorAll('[data-webar-qr]'));
  if (qrButtons.length === 0) return;

  const makeQrImageUrl = (text, size = 240) => {
    const data = encodeURIComponent(String(text));
    return (
      'https://api.qrserver.com/v1/create-qr-code/?size=' +
      size +
      'x' +
      size +
      '&data=' +
      data
    );
  };

  let cachedParentUrl = "";
  const requestParentUrl = () =>
    new Promise((resolve) => {
      if (cachedParentUrl) return resolve(cachedParentUrl);

      const token = Math.random().toString(36).slice(2);
      let done = false;

      const finish = (url) => {
        if (done) return;
        done = true;
        if (typeof url === 'string' && url) cachedParentUrl = url;
        resolve(cachedParentUrl || "");
      };

      const onMessage = (event) => {
        const data = event?.data;
        if (!data || typeof data !== 'object') return;
        if (data.type !== 'webar:url') return;
        if (data.token !== token) return;
        window.removeEventListener('message', onMessage);
        finish(data.url);
      };

      window.addEventListener('message', onMessage);

      try {
        window.parent?.postMessage({ type: 'webar:requestUrl', token }, '*');
      } catch {
        // Ignore.
      }

      setTimeout(() => {
        window.removeEventListener('message', onMessage);
        finish(cachedParentUrl);
      }, 600);
    });

  let modal;
  const ensureModal = () => {
    if (modal) return modal;

    modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'QR code');
    modal.style.cssText = [
      'position: fixed',
      'right: 12px',
      'bottom: 12px',
      'z-index: 9999',
      'width: min(320px, calc(100vw - 24px))',
      'background: #fff',
      'color: #000',
      'border: 3px solid #000',
      'border-radius: 12px',
      'box-shadow: 6px 6px 0 #000',
      'padding: 10px',
      'display: none',
    ].join(';');

    modal.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
        '<strong style="font-size:14px;">Open on phone</strong>' +
        '<button type="button" data-webar-qr-close style="border:2px solid #000;border-radius:10px;background:#fff;font-weight:800;width:34px;height:34px;box-shadow:3px 3px 0 #000;cursor:pointer;">×</button>' +
      '</div>' +
      '<div style="margin-top:10px;border:2px solid #000;border-radius:12px;padding:8px;display:grid;place-items:center;">' +
        '<img data-webar-qr-img alt="QR code" style="width:240px;height:240px;max-width:100%;border-radius:10px;" />' +
      '</div>' +
      '<div style="margin-top:10px;display:flex;gap:8px;">' +
        '<input data-webar-qr-url type="text" readonly style="flex:1;min-width:0;border:2px solid #000;border-radius:10px;padding:8px 10px;font-family:system-ui,sans-serif;" />' +
        '<button type="button" data-webar-qr-copy style="border:2px solid #000;border-radius:10px;background:#ffd300;font-weight:800;padding:8px 10px;box-shadow:3px 3px 0 #000;cursor:pointer;">Copy</button>' +
      '</div>';

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('[data-webar-qr-close]');
    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    const copyBtn = modal.querySelector('[data-webar-qr-copy]');
    const urlInput = modal.querySelector('[data-webar-qr-url]');
    copyBtn?.addEventListener('click', async () => {
      const url = urlInput?.value || '';
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copied';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 650);
      } catch {
        window.prompt('Copy this link:', url);
      }
    });

    urlInput?.addEventListener('click', () => {
      try { urlInput.select(); } catch { /* no-op */ }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') modal.style.display = 'none';
    });

    return modal;
  };

  const openQr = async () => {
    const url = (await requestParentUrl()) || '';
    const m = ensureModal();
    const img = m.querySelector('[data-webar-qr-img]');
    const input = m.querySelector('[data-webar-qr-url]');
    if (input) input.value = url;
    if (img) img.src = makeQrImageUrl(url || '');
    m.style.display = 'block';
  };

  qrButtons.forEach((btn) => {
    btn.addEventListener('click', openQr);
  });
})();
    </script>
  </body>
</html>`;
  };

  const getCurrentLibs = () => {
    if (hasTemplates && currentTemplateId) {
      return getTemplateById(currentTemplateId)?.libs || { aframe: false, modelViewer: false };
    }
    return starter.libs;
  };

  const run = () => {
    const libs = getCurrentLibs();

    const doc = buildDocument({
      html: htmlEl.value,
      css: cssEl.value,
      js: jsEl.value,
      libs,
    });

    frameEl.srcdoc = doc;
    saveState();
  };

  const setDescription = (text) => {
    if (!descriptionEl) return;
    descriptionEl.textContent = text || "";
  };

  const renderTemplateButtons = () => {
    if (!templatesBarEl) return;
    templatesBarEl.innerHTML = "";

    templates.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "exercise-btn exercise-template-btn";
      btn.textContent = t.title;
      btn.dataset.exId = t.id;
      if (t.id === currentTemplateId) btn.classList.add("is-active");

      btn.addEventListener("click", () => {
        if (t.id === currentTemplateId) return;
        // Persist current edits before switching.
        saveState();
        loadTemplate(t.id);
      });

      templatesBarEl.appendChild(btn);
    });
  };

  const loadTemplate = (templateId) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    const saved = loadState();
    const savedForTemplate = saved?.byTemplate?.[template.id];

    currentTemplateId = template.id;

    const fromSavedHtml = typeof savedForTemplate?.html === "string" ? savedForTemplate.html : null;
    const fromTemplateHtml = template.html;
    const migratedSavedHtml = fromSavedHtml ? migrateSavedTemplateHtml(template.id, fromSavedHtml) : null;
    const htmlToUse = migratedSavedHtml ?? fromSavedHtml ?? fromTemplateHtml;

    htmlEl.value = htmlToUse;
    cssEl.value = typeof savedForTemplate?.css === "string" ? savedForTemplate.css : template.css;
    jsEl.value = typeof savedForTemplate?.js === "string" ? savedForTemplate.js : template.js;

    // Persist migrated HTML back so future loads are correct.
    if (migratedSavedHtml && migratedSavedHtml !== fromSavedHtml) {
      try {
        const nextState = {
          ...(saved || {}),
          byTemplate: {
            ...(saved?.byTemplate || {}),
            [template.id]: {
              ...(savedForTemplate || {}),
              html: migratedSavedHtml,
            },
          },
        };
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      } catch {
        // Ignore quota / blocked storage.
      }
    }

    setDescription(template.description);
    renderTemplateButtons();
    run();
  };

  const reset = () => {
    if (hasTemplates && currentTemplateId) {
      const template = getTemplateById(currentTemplateId);
      if (template) {
        htmlEl.value = template.html;
        cssEl.value = template.css;
        jsEl.value = template.js;
        setDescription(template.description);
        run();
        return;
      }
    }

    htmlEl.value = starter.html;
    cssEl.value = starter.css;
    jsEl.value = starter.js;
    setDescription("");
    run();
  };

  const openInNewTab = () => {
    const libs = getCurrentLibs();

    const doc = buildDocument({
      html: htmlEl.value,
      css: cssEl.value,
      js: jsEl.value,
      libs,
    });

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  // Load
  setupMenuOverlay();
  setupFileSwitching();

  const saved = loadState();
  if (hasTemplates) {
    const preferredId = typeof saved?.selectedTemplateId === "string" ? saved.selectedTemplateId : currentTemplateId;
    currentTemplateId = getTemplateById(preferredId)?.id || currentTemplateId;
    renderTemplateButtons();
    loadTemplate(currentTemplateId);
  } else if (saved?.html || saved?.css || saved?.js) {
    htmlEl.value = typeof saved.html === "string" ? saved.html : starter.html;
    cssEl.value = typeof saved.css === "string" ? saved.css : starter.css;
    jsEl.value = typeof saved.js === "string" ? saved.js : starter.js;

    run();
  } else {
    reset();
  }

  // Actions
  runBtn?.addEventListener("click", run);
  resetBtn?.addEventListener("click", reset);
  openBtn?.addEventListener("click", openInNewTab);

  // Auto-save (lightweight debounce)
  let saveTimer = null;
  const scheduleSave = () => {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveState, 400);
  };

  htmlEl.addEventListener("input", scheduleSave);
  cssEl.addEventListener("input", scheduleSave);
  jsEl.addEventListener("input", scheduleSave);
})();
