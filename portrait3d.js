/* 3D particle portrait for the homepage hero.
 * Plain WebGL, no dependencies. Points come from assets/images/portrait-points.bin
 * (int16 xyz block followed by uint8 rgb block). Without WebGL the photo stays. */
(() => {
  const figure = document.querySelector(".hx__model");
  const canvas = figure && figure.querySelector("canvas");
  if (!canvas) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 820px)").matches;
  const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false, alpha: true });
  if (!gl) return;

  const VERT = `
    attribute vec3 aPos;
    attribute vec3 aCol;
    attribute vec3 aStart;
    attribute float aRnd;
    uniform float uTime, uAssemble, uScatter, uSize, uAspect, uMouseOn;
    uniform vec2 uRot, uMouse;
    uniform vec3 uAccent;
    varying vec3 vCol;
    varying float vAlpha;

    mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
    mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

    void main() {
      float t = clamp(uAssemble * 1.7 - aRnd * 0.7, 0.0, 1.0);
      t = t * t * (3.0 - 2.0 * t);
      vec3 p = mix(aStart, aPos, t);
      p += 0.007 * vec3(sin(uTime * 1.3 + aRnd * 40.0), cos(uTime * 1.1 + aRnd * 31.0), sin(uTime * 0.9 + aRnd * 23.0));
      vec3 dir = normalize(aPos + vec3(0.0, 0.0, 0.35));
      p += uScatter * (dir * 1.6 + vec3(0.0, 0.9, 0.4)) * (0.35 + aRnd);
      p = rotY(uRot.y) * rotX(uRot.x) * p;

      float zc = 3.4 - p.z;
      vec2 proj = p.xy * (3.0 / zc) * 1.15 + vec2(0.0, -0.04);
      proj *= vec2(min(1.0, 1.0 / uAspect), min(1.0, uAspect));

      vec2 d = proj - uMouse;
      float m = uMouseOn * smoothstep(0.2, 0.0, length(d));
      proj += normalize(d + 1e-4) * m * 0.075;

      gl_Position = vec4(proj, 0.0, 1.0);
      gl_PointSize = uSize * (0.75 + aRnd * 0.5) * (3.4 / zc) * (1.0 + m * 0.6);
      vCol = mix(uAccent, aCol * 0.9, t);
      float base = smoothstep(-1.0, -0.62, aPos.y);
      vAlpha = (0.25 + 0.75 * t) * (1.0 - uScatter * 0.85) * mix(1.0, base, t);
    }`;

  const FRAG = `
    precision mediump float;
    varying vec3 vCol;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(vCol, vAlpha * smoothstep(0.5, 0.32, d));
    }`;

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  try {
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn("portrait3d disabled:", err);
    return;
  }
  gl.useProgram(prog);

  const U = {};
  ["uTime", "uAssemble", "uScatter", "uSize", "uAspect", "uMouseOn", "uRot", "uMouse", "uAccent"].forEach((n) => {
    U[n] = gl.getUniformLocation(prog, n);
  });

  const attr = (name, data, size) => {
    const loc = gl.getAttribLocation(prog, name);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };

  const accent = () => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().replace("#", "");
    const v = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255 || 0);
  };

  let count = 0;
  let w = 0, h = 0, dpr = 1;
  const state = { assemble: reduce ? 1 : 0, scatter: 0, rx: 0, ry: 0, trx: 0, try: 0, mx: 0, my: 0, mouseOn: 0, mouseTarget: 0 };
  let started = 0, frame = 0, visible = true;

  fetch(figure.dataset.points)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then((buf) => {
      const total = buf.byteLength / 9;
      count = small ? Math.min(total, 9000) : total;
      const pos16 = new Int16Array(buf, 0, total * 3);
      const col8 = new Uint8Array(buf, total * 6, total * 3);
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const start = new Float32Array(count * 3);
      const rnd = new Float32Array(count);
      const k = 1.25 / 32767;
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < 3; j++) {
          pos[i * 3 + j] = pos16[i * 3 + j] * k;
          col[i * 3 + j] = col8[i * 3 + j] / 255;
        }
        // Start scattered on a wide, flat swirl to the left, as if arriving from the hero field.
        const a = Math.random() * Math.PI * 2;
        const r = 1.6 + Math.random() * 2.2;
        start[i * 3] = Math.cos(a) * r - 1.2;
        start[i * 3 + 1] = Math.sin(a) * r * 0.6;
        start[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        rnd[i] = Math.random();
      }
      attr("aPos", pos, 3);
      attr("aCol", col, 3);
      attr("aStart", start, 3);
      attr("aRnd", rnd, 1);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform3fv(U.uAccent, accent());

      figure.classList.add("is-3d"); // show the canvas before measuring it
      resize();
      if ("ResizeObserver" in window) new ResizeObserver(() => resize()).observe(canvas);
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Three-dimensional particle portrait of Luca Pedersoli");

      if (reduce) { draw(0); return; }
      bindInteraction();
      started = performance.now();
      frame = requestAnimationFrame(loop);
    })
    .catch((err) => console.warn("portrait3d: points not loaded", err));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width * dpr));
    h = Math.max(1, Math.round(r.height * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    const base = Math.min(r.width, r.height);
    gl.uniform1f(U.uSize, Math.max(2.2, base / 140) * dpr);
    gl.uniform1f(U.uAspect, w / h);
    if (reduce && count) draw(0);
  }

  function draw(time) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAssemble, state.assemble);
    gl.uniform1f(U.uScatter, state.scatter);
    gl.uniform1f(U.uMouseOn, state.mouseOn);
    gl.uniform2f(U.uRot, state.rx, state.ry);
    gl.uniform2f(U.uMouse, state.mx, state.my);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  function loop(now) {
    const t = (now - started) / 1000;
    state.assemble = Math.min(1, t / 2.6);
    const sway = Math.sin(t * 0.45) * 0.16;
    state.ry += (state.try + sway - state.ry) * 0.06;
    state.rx += (state.trx + Math.sin(t * 0.33) * 0.04 - state.rx) * 0.06;
    state.mouseOn += (state.mouseTarget - state.mouseOn) * 0.08;
    // Disperse once the portrait's centre rises above the top quarter of the viewport.
    const r = canvas.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (innerHeight * 0.25 - (r.top + r.height / 2)) / (r.height * 0.8)));
    state.scatter = s * s;
    draw(t);
    frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
  }

  function bindInteraction() {
    addEventListener("pointermove", (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      state.try = nx * 0.5;
      state.trx = ny * 0.22;
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      state.mouseTarget = inside ? 1 : 0;
      state.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      state.my = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { state.mouseTarget = 0; state.try = 0; state.trx = 0; });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(loop);
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && visible && !frame) frame = requestAnimationFrame(loop);
    });
  }

  let timer;
  addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(resize, 120); });
})();
