/* Hero avatar: a self-portrait drawn with charts.
 * The SVG is complete and static on its own; this adds live data, eye tracking,
 * blinking, parallax and the "Refresh data" button. */
(() => {
  const fig = document.querySelector(".av");
  const svg = fig && fig.querySelector(".av__svg");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---- hair: bar chart ---- */
  const bars = Array.from(svg.querySelectorAll(".av__hair rect")).map((el, i) => {
    const y = Number(el.getAttribute("y"));
    const h = Number(el.getAttribute("height"));
    return { el, bottom: y + h, base: h, cur: h, target: h, phase: i * 0.55 };
  });
  const newHair = () => {
    // Keep the quiff silhouette, vary it like a fresh dataset.
    const tilt = rand(-0.25, 0.25);
    bars.forEach((b, i) => {
      const x = i / (bars.length - 1) - 0.5;
      b.target = b.base * rand(0.72, 1.22) * (1 + tilt * x * 2);
    });
  };

  /* ---- glasses: gauges ---- */
  const lenses = Array.from(svg.querySelectorAll(".av__lens")).map((g) => {
    const gauge = g.querySelector(".av__gauge");
    const pupil = g.querySelector(".av__pupil");
    const value = Number(g.dataset.gauge);
    return { gauge, pupil, cx: Number(pupil.getAttribute("cx")), cy: Number(pupil.getAttribute("cy")), cur: value, target: value };
  });
  const setGauge = (l) => l.gauge.setAttribute("stroke-dasharray", `${(l.cur * 100).toFixed(1)} 100`);
  lenses.forEach(setGauge);

  /* ---- smile: line chart ---- */
  const smile = svg.querySelector(".av__smile");
  const smileDots = Array.from(svg.querySelectorAll(".av__smile-pts circle"));
  const smilePts = smile.getAttribute("points").trim().split(/\s+/).map((p) => p.split(",").map(Number))
    .map(([x, y]) => ({ x, base: y, cur: y, target: y }));
  const drawSmile = () => {
    smile.setAttribute("points", smilePts.map((p) => `${p.x},${p.cur.toFixed(1)}`).join(" "));
    smileDots.forEach((d, i) => d.setAttribute("cy", smilePts[i].cur.toFixed(1)));
  };
  const newSmile = () => {
    const lift = rand(-3, 7); // always ends higher than it starts: the trend stays positive
    smilePts.forEach((p, i) => {
      const edge = i === smilePts.length - 1 ? -lift : 0;
      p.target = p.base + rand(-3.5, 3.5) + edge;
    });
  };

  /* ---- stubble: scatter plot ---- */
  const stubble = svg.querySelector(".av__stubble");
  const seedStubble = () => {
    stubble.textContent = "";
    for (let i = 0; i < 46; i++) {
      const a = rand(0.12, 0.88) * Math.PI;      // along the jaw, left to right
      const r = rand(0.72, 0.97);
      const x = 220 - Math.cos(a) * 70 * r;
      const y = 262 + Math.sin(a) * 70 * r;
      if (y < 284 || (Math.abs(x - 221) < 40 && y < 314)) continue; // keep the mouth clear
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("r", rand(1, 1.8).toFixed(2));
      stubble.appendChild(c);
    }
  };
  seedStubble();

  /* ---- refresh ---- */
  const button = fig.querySelector(".av__refresh");
  const refresh = () => {
    newHair();
    newSmile();
    lenses.forEach((l) => { l.target = rand(0.2, 0.95); });
    seedStubble();
    fig.classList.remove("is-refreshing");
    void fig.offsetWidth; // restart the CSS flash
    fig.classList.add("is-refreshing");
    if (reduce) settle();
  };
  const settle = () => {
    bars.forEach((b) => { b.cur = b.target; b.el.setAttribute("height", b.cur.toFixed(1)); b.el.setAttribute("y", (b.bottom - b.cur).toFixed(1)); });
    lenses.forEach((l) => { l.cur = l.target; setGauge(l); });
    smilePts.forEach((p) => { p.cur = p.target; });
    drawSmile();
  };
  if (button) button.addEventListener("click", refresh);
  svg.addEventListener("click", refresh);

  if (reduce) return;

  /* ---- pointer: eyes + parallax ---- */
  const layers = Array.from(svg.querySelectorAll("[data-depth]")).map((el) => ({ el, depth: Number(el.dataset.depth) }));
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const dy = (e.clientY - (r.top + r.height * 0.45)) / innerHeight;
    look.tx = Math.max(-1, Math.min(1, dx * 2.4));
    look.ty = Math.max(-1, Math.min(1, dy * 2.4));
  }, { passive: true });

  /* ---- blink ---- */
  let blinkUntil = 0;
  let nextBlink = performance.now() + rand(1800, 4200);

  /* ---- loop ---- */
  let visible = true;
  let frame = 0;
  const tick = (now) => {
    const t = now / 1000;
    // hair breathes like a live feed and eases toward its dataset
    bars.forEach((b) => {
      const live = b.target * (1 + 0.045 * Math.sin(t * 1.7 + b.phase) + 0.025 * Math.sin(t * 3.1 + b.phase * 2.3));
      b.cur = lerp(b.cur, live, 0.12);
      b.el.setAttribute("height", b.cur.toFixed(1));
      b.el.setAttribute("y", (b.bottom - b.cur).toFixed(1));
    });
    lenses.forEach((l, i) => {
      l.cur = lerp(l.cur, l.target + 0.03 * Math.sin(t * 0.9 + i * 2), 0.06);
      setGauge(l);
    });
    smilePts.forEach((p) => { p.cur = lerp(p.cur, p.target, 0.1); });
    drawSmile();

    look.x = lerp(look.x, look.tx, 0.09);
    look.y = lerp(look.y, look.ty, 0.09);
    if (now > nextBlink) { blinkUntil = now + 130; nextBlink = now + rand(2200, 5600); }
    const blink = now < blinkUntil ? 0.12 : 1;
    lenses.forEach((l) => {
      const px = l.cx + look.x * 8.5;
      const py = l.cy + look.y * 7;
      l.pupil.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(1 ${blink}) translate(${-l.cx} ${-l.cy})`);
    });
    layers.forEach(({ el, depth }) => {
      const tilt = el.classList.contains("av__head") || el.classList.contains("av__hair") ? ` rotate(${(look.x * 2.2).toFixed(2)} 220 340)` : "";
      el.setAttribute("transform", `translate(${(look.x * 7 * depth).toFixed(2)} ${(look.y * 5 * depth).toFixed(2)})${tilt}`);
    });

    frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  };
  const start = () => { if (!frame) frame = requestAnimationFrame(tick); };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }).observe(svg);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible) start(); });
  start();
})();
