/*
 * Static-site adapter inspired by @zakisheriff/liquid-glass 0.1.3.
 * The filter formula is adapted from its MIT-licensed LiquidGlassFilter.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const reducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const selector = ".header-inner, .hero-copy, .publication-results, .experience-row, .background-grid > div, .contact-links";
  const cleanups = new Map();

  function addFilters() {
    if (document.getElementById("zaki-liquid-glass-filters")) return;
    const holder = document.createElement("div");
    holder.id = "zaki-liquid-glass-filters";
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    holder.innerHTML = `
      <svg width="0" height="0" focusable="false">
        <defs>
          <filter id="zaki-liquid-glass-refract-6" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.0148" numOctaves="3" seed="42" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>`;
    document.body.prepend(holder);
  }

  function addReflection(surface) {
    if (!finePointer.matches || reducedMotion.matches) return;
    let frame = 0;
    const move = event => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = surface.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
        const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
        surface.style.setProperty("--glass-x", `${(x * 100).toFixed(1)}%`);
        surface.style.setProperty("--glass-y", `${(y * 100).toFixed(1)}%`);
        surface.style.setProperty("--glass-angle", `${(135 + x * 90 + y * 25).toFixed(1)}deg`);
      });
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ["--glass-x", "--glass-y", "--glass-angle"].forEach(name => surface.style.removeProperty(name));
    };
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", clear);
    cleanups.set(surface, () => {
      clear();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", clear);
    });
  }

  function stop() {
    cleanups.forEach(cleanup => cleanup());
    cleanups.clear();
    document.querySelectorAll(".layered-surface").forEach(surface => surface.classList.remove("layered-surface"));
    root.classList.remove("layered-glass");
  }

  function start() {
    stop();
    if (reducedTransparency.matches) return;
    addFilters();
    root.classList.add("layered-glass");
    document.querySelectorAll(selector).forEach(surface => {
      surface.classList.add("layered-surface");
      addReflection(surface);
    });
  }

  [reducedTransparency, reducedMotion, finePointer].forEach(query => query.addEventListener("change", start));
  start();
})();
