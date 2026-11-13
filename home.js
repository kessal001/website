/* Homepage motion. Every effect is progressive: without JS or the CDN libraries the page is complete and static. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const reveal = () => root.classList.remove("js-anim");

  initField();
  initSpotlight();
  initProgressBar();

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (reduce || !gsap || !ScrollTrigger) {
    reveal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  initSmoothScroll();

  // Hide scroll-revealed blocks with GSAP first, then let CSS stop hiding them.
  gsap.set(".reveal", { autoAlpha: 0, y: 40 });
  gsap.set(".hx__line > span", { yPercent: 110 });
  gsap.set([".hx__kicker", ".hx__name", ".hx__copy > *", ".hx__portrait", ".hx__scroll"], { autoAlpha: 0, y: 24 });
  reveal();

  // Hero intro.
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(".hx__kicker", { autoAlpha: 1, y: 0, duration: 1 }, 0.1)
    .to(".hx__name", { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
    .to(".hx__line > span", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.25)
    .to([".hx__copy > *", ".hx__portrait"], { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.75)
    .to(".hx__scroll", { autoAlpha: 1, y: 0, duration: 1 }, 1.2);

  // Hero drifts up and fades as you leave it.
  gsap.to(".hx__inner", {
    yPercent: -14,
    opacity: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hx", start: "top top", end: "bottom top", scrub: true },
  });

  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }),
  });

  // Counters.
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const state = { v: 0 };
    el.textContent = "0";
    gsap.to(state, {
      v: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => { el.textContent = String(Math.round(state.v)); },
    });
  });

  // Stacking project cards: each card recedes as the next one slides over it.
  const mm = gsap.matchMedia();
  mm.add("(min-width: 821px)", () => {
    const items = gsap.utils.toArray(".stack__item");
    items.forEach((item, i) => {
      const next = items[i + 1];
      if (!next) return;
      gsap.to(item.querySelector(".pcard"), {
        scale: 0.93,
        filter: "brightness(0.55)",
        ease: "none",
        scrollTrigger: {
          trigger: next,
          start: "top bottom",
          end: () => `top ${parseFloat(getComputedStyle(next).top)}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });

  // Timeline line draws with scroll.
  gsap.fromTo(".timeline__fill", { scaleY: 0 }, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true },
  });

  // Approach text lights up word by word.
  const text = document.querySelector("[data-words]");
  if (text) {
    const words = window.SplitText ? new window.SplitText(text, { type: "words" }).words : splitWords(text);
    gsap.fromTo(words, { opacity: 0.15 }, {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: { trigger: text, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  gsap.from(".finale h2", {
    yPercent: 35,
    opacity: 0,
    duration: 1.3,
    ease: "expo.out",
    scrollTrigger: { trigger: ".finale", start: "top 75%" },
  });

  // Magnetic buttons.
  if (finePointer) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  function initSmoothScroll() {
    if (!window.Lenis) return;
    const lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -90 });
      });
    });
  }

  function splitWords(el) {
    const parts = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = parts.map((w) => `<span aria-hidden="true" style="display:inline-block">${w}</span>`).join(" ");
    return el.querySelectorAll("span");
  }

  function initProgressBar() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    const update = () => {
      const max = root.scrollHeight - root.clientHeight || 1;
      bar.style.transform = `scaleX(${Math.min(root.scrollTop / max, 1)})`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  function initSpotlight() {
    document.querySelectorAll(".fcard").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  // Hero flow field: particles follow a slowly shifting vector field and avoid the cursor.
  function initField() {
    const canvas = document.querySelector(".hx__field");
    const hero = document.querySelector(".hx");
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const colors = ["rgba(242,240,234,0.5)", "rgba(242,240,234,0.28)", "rgba(200,255,77,0.9)", "rgba(138,162,255,0.85)"];
    const mouse = { x: -1e4, y: -1e4 };
    let w = 0, h = 0, t = 0, parts = [], frame = 0, visible = true;

    const pick = () => {
      const r = Math.random();
      return colors[r < 0.1 ? 2 : r < 0.22 ? 3 : r < 0.6 ? 0 : 1];
    };
    const spawn = () => ({ x: Math.random() * w, y: Math.random() * h, life: 120 + Math.random() * 320, col: pick(), s: 0.5 + Math.random() * 0.9 });
    const angle = (x, y) => (Math.sin(x * 0.0021 + t * 0.00025) + Math.cos(y * 0.0026 - t * 0.0002) + Math.sin((x + y) * 0.0011)) * Math.PI * 0.75;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.min(Math.round((w * h) / 6500), 340) }, spawn);
    }

    function step() {
      t += 16;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 1.1;
      for (const p of parts) {
        const a = angle(p.x, p.y);
        let vx = Math.cos(a) * p.s * 1.3;
        let vy = Math.sin(a) * p.s * 1.3;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          const d = Math.sqrt(d2) || 1, f = (1 - d2 / 18000) * 3.2;
          vx += (dx / d) * f; vy += (dy / d) * f;
        }
        ctx.strokeStyle = p.col;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        p.x += vx; p.y += vy;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (--p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) Object.assign(p, spawn());
      }
    }

    function loop() {
      step();
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }
    const start = () => { if (!frame && !reduce) frame = requestAnimationFrame(loop); };

    resize();
    if (reduce) {
      for (let i = 0; i < 90; i++) step(); // one still frame of trails
      return;
    }
    start();

    let resizeTimer;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }).observe(hero);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  }
})();
