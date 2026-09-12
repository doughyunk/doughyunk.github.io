/* Pinned MIT renderers: liquidGL for navigation, SVG optics for static panels. */
(() => {
  "use strict";

  const root = document.documentElement;
  const transparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const selector = ".hero-copy, .portrait-lens, .publication-results, .experience-row, .background-grid > div, .contact-links";
  const header = document.querySelector(".header-inner");
  const headerStyle = header?.getAttribute("style");
  const instances = new Map();
  const reflections = new Map();
  let observer;
  let running = false;
  let lens;
  let failed = false;
  let renderFrame = 0;
  let readyTimer;
  let lastFrame = 0;

  function restoreHeader() {
    if (!header) return;
    if (headerStyle === null) header.removeAttribute("style");
    else header.setAttribute("style", headerStyle);
  }

  function render(time = 0) {
    renderFrame = 0;
    if (!running || !lens || document.hidden) return;
    if (!time || time - lastFrame >= 1000 / 30) {
      lens.renderer.render();
      lastFrame = time;
    }
    if (!reducedMotion.matches) renderFrame = requestAnimationFrame(render);
  }

  function requestRender() {
    if (!renderFrame && running && !document.hidden) renderFrame = requestAnimationFrame(render);
  }

  function reset() {
    cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    if (lens) lens.renderer.canvas.hidden = true;
    restoreHeader();
    observer?.disconnect();
    observer = undefined;
    instances.forEach(instance => instance.destroy());
    instances.clear();
    reflections.forEach(cleanup => cleanup());
    reflections.clear();
    document.querySelectorAll(".glass-optics").forEach(layer => layer.remove());
    document.querySelectorAll(".glass-surface").forEach(surface => surface.classList.remove("glass-surface"));
    root.classList.remove("clear-glass");
    running = false;
  }

  function addReflection(surface) {
    if (!finePointer.matches || reducedMotion.matches || surface.matches(".portrait-lens")) return;
    let frame = 0;
    let pointer;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ["--reflection-x", "--reflection-y", "--reflection-angle"].forEach(name => surface.style.removeProperty(name));
    };
    const move = event => {
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = surface.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const x = Math.min(1, Math.max(0, (pointer.x - box.left) / box.width));
        const y = Math.min(1, Math.max(0, (pointer.y - box.top) / box.height));
        surface.style.setProperty("--reflection-x", `${(x * 100).toFixed(1)}%`);
        surface.style.setProperty("--reflection-y", `${(y * 100).toFixed(1)}%`);
        surface.style.setProperty("--reflection-angle", `${(110 + x * 85 + y * 30).toFixed(1)}deg`);
      });
    };
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", clear);
    reflections.set(surface, () => {
      clear();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", clear);
    });
  }

  function mount(surface) {
    if (instances.has(surface)) return;
    if (typeof window.liquidGlass !== "function" || typeof ResizeObserver !== "function") return;
    if (!surface.offsetWidth || !surface.offsetHeight) return;
    const layer = document.createElement("span");
    layer.className = "glass-optics";
    layer.setAttribute("aria-hidden", "true");
    surface.prepend(layer);
    const portrait = surface.matches(".portrait-lens");
    const narrow = surface.matches(".header-inner");
    const radius = parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 28;
    const size = Math.min(surface.offsetWidth, surface.offsetHeight);
    const instance = window.liquidGlass(layer, {
      scale: portrait ? -48 : narrow ? -85 : -68,
      chroma: portrait ? 1.2 : 2.4,
      border: Math.min(.2, 18 / size),
      mapBlur: narrow ? 5 : 8,
      blur: 0,
      saturate: 1.05,
      radius,
      fallbackBlur: 28,
    });
    if (!instance.supported) {
      instance.destroy();
      layer.remove();
      return; // Clear CSS reflections remain on browsers without SVG backdrop filters.
    }
    instances.set(surface, instance);
    addReflection(surface);
  }

  function safelyMount(surface) {
    if (!running) return;
    try { mount(surface); }
    catch { surface.querySelector(".glass-optics")?.remove(); }
  }

  function start() {
    if (running || failed || transparency.matches || !header || typeof window.liquidGL !== "function") return;
    const surfaces = [...document.querySelectorAll(selector)];
    try {
      header.classList.add("glass-surface");
      surfaces.forEach(surface => surface.classList.add("glass-surface"));
      root.classList.add("clear-glass");
      running = true;
      if (!lens) {
        lens = window.liquidGL({
          target: ".header-inner",
          snapshot: "body",
          resolution: Math.min(1.25, Math.sqrt(6000000 / (document.body.scrollWidth * document.body.scrollHeight))),
          refraction: .008,
          aberration: .025,
          bevelDepth: .065,
          bevelWidth: .18,
          frost: 0,
          shadow: false,
          specular: !reducedMotion.matches,
          reveal: "none",
          tilt: false,
          magnify: 1,
          on: { init() { clearTimeout(readyTimer); requestRender(); } },
        });
        if (!lens?.renderer) {
          lens = undefined;
          failed = true;
          reset();
          return;
        }
        // Keep the shared canvas in the navigation's stacking context so it
        // refracts scrolling content without covering the selectable bio text.
        const renderer = lens.renderer;
        renderer.canvas.classList.add("navigation-optics");
        renderer.canvas.setAttribute("aria-hidden", "true");
        header.parentElement.prepend(renderer.canvas);
        renderer.canvas.style.zIndex = "0";
        // Own the frame scheduling: cap highlights at 30 fps, pause in hidden
        // tabs, and draw only on input when reduced motion is requested.
        renderer.useExternalTicker = true;
        cancelAnimationFrame(renderer._rafId);
        renderer._rafId = null;
        renderer.canvas.addEventListener("webglcontextlost", () => {
          failed = true;
          reset();
        });
        readyTimer = setTimeout(() => {
          if (!renderer.texture) { failed = true; reset(); }
        }, 10000);
      } else {
        lens.renderer.captureSnapshot();
      }
      lens.options.specular = !reducedMotion.matches;
      lens.renderer.canvas.hidden = false;
      // liquidGL defaults to disabling pointer events on the target. Links
      // stay interactive and visible during asynchronous snapshot creation.
      header.style.pointerEvents = "auto";
      header.style.opacity = "1";
      header.style.background = "transparent";
      header.style.backdropFilter = "none";
      header.style.webkitBackdropFilter = "none";
      addReflection(header);
      requestRender();
      if (typeof IntersectionObserver === "function") {
        observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (!running) break;
            if (entry.isIntersecting) {
              safelyMount(entry.target);
              observer?.unobserve(entry.target);
            }
          }
        }, { rootMargin: "180px 0px" });
        surfaces.forEach(surface => observer.observe(surface));
      } else {
        surfaces.forEach(safelyMount);
      }
    } catch { reset(); }
  }

  transparency.addEventListener("change", () => { reset(); start(); });
  reducedMotion.addEventListener("change", () => { reset(); start(); });
  finePointer.addEventListener("change", () => { reset(); start(); });
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(renderFrame); renderFrame = 0; }
    else requestRender();
  });
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
