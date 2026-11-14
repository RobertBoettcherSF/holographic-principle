import {VERSION, loadAda} from "./ada.js?v=1";
import {t, fill, formatNumber, translatePage, wireLanguages} from "./i18n.js?v=1";
import {play, bindSoundButton} from "./sounds.js?v=1";
import {startSession} from "./session.js?v=1";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = {
  mode: 0, mass: 0, radiusM: 0, bits: 0,
  ball: 4,
  view: [0, 0], bulk: [0.45, 0.2],
  angles: [0.4, 2.4],
  erased: Array(20).fill(0),
  pattern: 0,
  active: "skin",
  C: null
};
let ada = null;
let lastInputSound = 0;
const session = startSession({
  version: VERSION,
  details: () => ({page: "tour", card: state.active, parameters: snapshot(), reduced})
});

function snapshot() {
  return {
    mode: state.mode, massKg: state.mass, radiusM: state.radiusM, bits: state.bits,
    ballRadius: state.ball, view: state.view, bulk: state.bulk, angles: state.angles,
    erased: state.erased.slice(), pattern: state.pattern
  };
}

function playInput() {
  const now = performance.now();
  if (now - lastInputSound > 80) { play("input"); lastInputSound = now; }
}

function num(n) { return formatNumber(n); }
function metres(m) {
  const a = Math.abs(m);
  if (a >= 1000) return num(m / 1000) + " " + t("km");
  if (a > 0 && a < 0.1) return num(m * 1000) + " " + t("mm");
  return num(m) + " " + t("m");
}
function area(m2) {
  const a = Math.abs(m2);
  if (a >= 1e6) return num(m2 / 1e6) + " " + t("km2");
  if (a >= 1) return num(m2) + " " + t("m2");
  if (a >= 1e-4) return num(m2 * 1e4) + " cm²";
  return num(m2 * 1e6) + " mm²";
}
function sunsText(kg) {
  const s = kg / state.C.sun;
  if (!Number.isFinite(s)) return "";
  if (Math.abs(s - 1) < 1e-8) return "1";
  if (Math.abs(s) >= 1e-3 && Math.abs(s) < 1e6) return String(Math.round(s * 1e6) / 1e6);
  return s.toExponential(4);
}
function massPhrase(kg) {
  const {sun, earth} = state.C;
  if (Math.abs(kg - earth) / earth < 1e-4) return t("oneEarth");
  if (Math.abs(kg / sun - 1) < 1e-4) return t("oneSun");
  const suns = kg / sun;
  if (suns >= 0.01) return num(suns) + " " + t("suns");
  return num(kg / earth) + " " + t("earths");
}

const ERR = {
  1: ["errMissing", "errMissingHelp"],
  2: ["errPositive", "errPositiveHelp"],
  3: ["errRange", "errRangeHelp"],
  4: ["errWhole", "errWholeHelp"],
  5: ["errClose", "errCloseHelp"]
};

function showError(panel, code) {
  const [title, help] = ERR[code] || ERR[1];
  panel.classList.add("invalid");
  panel.querySelector(".answer").textContent = t(title);
  const extra = panel.querySelector(".working");
  if (extra) extra.textContent = t(help);
}

function fit(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {ctx, w, h};
}
function localPos(canvas, ev) {
  const r = canvas.getBoundingClientRect();
  return [ev.clientX - r.left, ev.clientY - r.top];
}
function diskMap(w, h) {
  const R = Math.min(w, h) * 0.44;
  const cx = w / 2, cy = h / 2;
  return {
    R, cx, cy,
    to(x, y) { return [cx + x * R, cy - y * R]; },
    from(px, py) { return [(px - cx) / R, -(py - cy) / R]; }
  };
}

function field(labelKey, control) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  span.dataset.i18n = labelKey;
  span.textContent = t(labelKey);
  label.append(span, control);
  return label;
}

function button(key, fn) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "reset";
  b.dataset.i18n = key;
  b.textContent = t(key);
  b.addEventListener("click", () => { play("click"); fn(); });
  return b;
}

const cards = {};

function shell(id, key) {
  const art = document.createElement("article");
  art.className = "tour-card";
  art.id = "card-" + id;
  art.innerHTML = `<div class="tag" data-i18n="cards.${key}.tag"></div><h2 data-i18n="cards.${key}.title"></h2><p class="sentence" data-i18n="cards.${key}.sentence"></p>`;
  const canvas = document.createElement("canvas");
  canvas.className = "stage";
  canvas.tabIndex = 0;
  const hint = document.createElement("p");
  hint.className = "hint";
  const controls = document.createElement("div");
  controls.className = "controls";
  const result = document.createElement("div");
  result.className = "result";
  result.setAttribute("role", "status");
  result.innerHTML = `<div class="label"></div><div class="answer"></div><div class="stats"></div><div class="working"></div><p class="compare"></p>`;
  const insight = document.createElement("p");
  insight.className = "insight";
  const maths = document.createElement("details");
  maths.className = "maths";
  maths.innerHTML = `<summary data-i18n="showMaths"></summary><div class="equation"></div><p class="working fold"></p><p class="constants"></p><p class="insight note"></p>`;
  maths.addEventListener("toggle", () => play("click"));
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "reset";
  reset.dataset.i18n = "reset";
  art.append(canvas, hint, controls, result, insight, maths, reset);
  art.addEventListener("pointerdown", () => { state.active = id; });
  document.getElementById("cards").append(art);
  return {art, canvas, hint, controls, result, insight, maths, reset};
}

function readOut() {
  const o = ada.outputs();
  return Array.from(o);
}

function refreshSkin() {
  const ui = cards.skin;
  const inp = ada.inputs();
  inp[0] = state.mode;
  inp[1] = state.mode === 1 ? state.radiusM : state.mode === 2 ? state.bits : state.mass;
  ada.compute(1);
  const o = readOut();
  const panel = ui.result;
  panel.querySelector(".label").textContent = t("liveResult");
  const stats = panel.querySelector(".stats");
  const compare = panel.querySelector(".compare");
  compare.textContent = fill(t("cards.skin.compare"), {
    sun: metres(o[11]), sk: num(o[13]), earth: metres(o[16])
  });
  if (o[0] !== 1) {
    stats.innerHTML = "";
    showError(panel, o[1]);
    ui.insight.textContent = "";
    return;
  }
  panel.classList.remove("invalid");
  panel.querySelector(".answer").textContent = massPhrase(o[2]);
  panel.querySelector(".working").textContent = "";
  stats.innerHTML = [
    [metres(o[3]), "rₛ"],
    [area(o[4]), "A"],
    [num(o[5]), "S / k_B"],
    [num(o[6]) + " " + t("bits"), "bits"]
  ].map(([v, k]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
  ui.insight.textContent = t("cards.skin.insight");
  drawSkin(o);
  ui.maths.querySelector(".fold").textContent =
    `rₛ = 2GM/c² = ${metres(o[3])} · A = 4π rₛ² = ${area(o[4])} · S/k_B = ${num(o[5])} · bits = ${num(o[6])}`;
  const C = state.C;
  ui.maths.querySelector(".constants").textContent =
    `${t("constants")}: G = ${num(C.G)} m³ kg⁻¹ s⁻² · c = ${num(C.c)} m/s · k_B = ${num(C.kB)} J/K · ℓ_P = ${num(C.lp)} m · h = ${num(C.h)} J s`;
  state.mass = o[2];
  state.radiusM = o[3];
  state.bits = o[6];
}

function drawSkin(o) {
  const {ctx, w, h} = fit(cards.skin.canvas);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const rs = o && o[0] === 1 ? o[3] : 2953;
  const bits = o && o[0] === 1 ? o[6] : 1e77;
  const norm = (Math.log10(Math.max(rs, 1e-8)) + 3) / 13;
  const R = Math.min(w, h) * (0.16 + 0.26 * Math.min(1, Math.max(0.05, norm)));
  const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.9);
  glow.addColorStop(0, "#02060a");
  glow.addColorStop(0.5, "#02060a");
  glow.addColorStop(0.72, "#14384c");
  glow.addColorStop(1, "rgba(7,16,24,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.9, 0, Math.PI * 2);
  ctx.fill();
  const n = Math.max(10, Math.min(42, Math.round(Math.log10(Math.max(bits, 10)) * 3)));
  for (let i = 0; i < n; i++) {
    const ang = i * 2.399963 + 0.4;
    const rad = R * (1.02 + 0.04 * Math.sin(i * 1.7));
    ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(i * 2.3));
    ctx.fillStyle = "#e5ff70";
    ctx.fillRect(cx + rad * Math.cos(ang) - 1.7, cy - rad * Math.sin(ang) - 1.7, 3.4, 3.4);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#e5ff70";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#02060a";
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall() {
  const {ctx, w, h} = fit(cards.area.canvas);
  const gi = ada.geomI();
  const R = gi[0], side = gi[1];
  if (!R) return;
  const cell = Math.min(w, h) * 0.86 / side;
  const ox = w / 2, oy = h / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#85ceff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ox, oy, (R + 0.5) * cell, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = -R; i <= R; i++) {
    for (let j = -R; j <= R; j++) {
      const v = gi[2 + (i + R) * side + (j + R)];
      if (!v) continue;
      ctx.fillStyle = v === 2 ? "#e5ff70" : "#1d4e68";
      const x = ox + (i - 0.5) * cell;
      const y = oy - (j + 0.5) * cell;
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  }
}

function refreshBall() {
  const ui = cards.area;
  ada.inputs()[0] = state.ball;
  ada.compute(2);
  const o = readOut();
  const panel = ui.result;
  panel.querySelector(".label").textContent = t("liveResult");
  if (o[0] !== 1) {
    panel.querySelector(".stats").innerHTML = "";
    showError(panel, o[1]);
    ui.insight.textContent = "";
    return;
  }
  panel.classList.remove("invalid");
  panel.querySelector(".answer").textContent = "";
  panel.querySelector(".working").textContent = "";
  panel.querySelector(".stats").innerHTML = [
    [num(o[2]) + " " + t("cubes"), "V"],
    [num(o[3]) + " " + t("stickers"), "A"],
    ["×" + num(o[6] / o[2]), "2r cubes"],
    ["×" + num(o[7] / o[3]), "2r stickers"]
  ].map(([v, k]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
  ui.insight.textContent = fill(t("cards.area.insight"), {
    c: num(o[2]), c2: num(o[6]), cg: num(o[6] / o[2]),
    s: num(o[3]), s2: num(o[7]), sg: num(o[7] / o[3])
  });
  ui.maths.querySelector(".fold").textContent = fill(t("cards.area.smooth"), {
    r: num(state.ball), v: num(o[10]), a: num(o[11])
  }) + `  r(A) = ${num(o[12])} · r(V) = ${num(o[13])}`;
  drawBall();
}

function polyline(ctx, map, geom, offset, count, move) {
  for (let i = 0; i < count; i++) {
    const [x, y] = map.to(geom[offset + i * 2], geom[offset + i * 2 + 1]);
    if (i === 0 && move) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
}

function drawDisk() {
  const {ctx, w, h} = fit(cards.sheet.canvas);
  const map = diskMap(w, h);
  const geom = ada.geom();
  const gi = ada.geomI();
  const o = ada.outputs();
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#293c4d";
  ctx.lineWidth = 1;
  const tiles = gi[0], samples = gi[2];
  let cursor = 0;
  const perEdge = samples * 2;
  for (let t = 0; t < tiles; t++) {
    ctx.beginPath();
    for (let e = 0; e < 7; e++) {
      polyline(ctx, map, geom, cursor, samples, e === 0);
      cursor += perEdge;
    }
    ctx.closePath();
    ctx.stroke();
  }
  const arcAt = gi[4], arcN = gi[5];
  const theta = o[7], phi = o[8];
  ctx.fillStyle = "rgba(229,255,112,0.16)";
  ctx.beginPath();
  if (arcN > 1) polyline(ctx, map, geom, arcAt, arcN, true);
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const a = (theta + phi) - (2 * phi) * i / steps;
    const [x, y] = map.to(Math.cos(a) * 0.985, Math.sin(a) * 0.985);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e5ff70";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (arcN > 1) polyline(ctx, map, geom, arcAt, arcN, true);
  ctx.stroke();
  ctx.strokeStyle = "#85ceff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (theta - phi) + (2 * phi) * i / steps;
    const [x, y] = map.to(Math.cos(a), Math.sin(a));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(map.cx, map.cy, map.R, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#40576c";
  ctx.stroke();
  const [bx, by] = map.to(o[4], o[5]);
  ctx.fillStyle = "#e5ff70";
  ctx.beginPath();
  ctx.arc(bx, by, 7, 0, Math.PI * 2);
  ctx.fill();
}

function refreshDisk() {
  const ui = cards.sheet;
  const inp = ada.inputs();
  inp[0] = state.view[0]; inp[1] = state.view[1];
  inp[2] = state.bulk[0]; inp[3] = state.bulk[1];
  ada.compute(3);
  const o = readOut();
  state.view = [o[2], o[3]];
  state.bulk = [o[4], o[5]];
  const panel = ui.result;
  panel.classList.remove("invalid");
  panel.querySelector(".label").textContent = t("liveResult");
  panel.querySelector(".answer").textContent = "";
  panel.querySelector(".working").textContent = "";
  const deg = o[8] * 180 / Math.PI;
  panel.querySelector(".stats").innerHTML =
    `<div><span>ρ</span><b>${num(o[6])}</b></div><div><span>φ</span><b>${num(deg)}°</b></div>`;
  ui.insight.textContent = fill(t("cards.sheet.insight"), {rho: num(o[6]), deg: num(deg)});
  ui.maths.querySelector(".note").textContent = t("cards.sheet.note");
  drawDisk();
}

function drawPath() {
  const {ctx, w, h} = fit(cards.path.canvas);
  const map = diskMap(w, h);
  const geom = ada.geom();
  const n = ada.geomI()[0];
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.arc(map.cx, map.cy, map.R, 0, Math.PI * 2);
  ctx.strokeStyle = "#40576c";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const [a, b] = state.angles;
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const start = d >= 0 ? a : b;
  const span = Math.abs(d);
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const ang = start + span * i / 32;
    const [x, y] = map.to(Math.cos(ang), Math.sin(ang));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#85ceff";
  ctx.lineWidth = 4;
  ctx.stroke();
  if (n > 1) {
    ctx.beginPath();
    polyline(ctx, map, geom, 0, n, true);
    ctx.strokeStyle = "#e5ff70";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  for (const ang of state.angles) {
    const [x, y] = map.to(Math.cos(ang), Math.sin(ang));
    ctx.fillStyle = "#e5ff70";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function refreshPath() {
  const ui = cards.path;
  const inp = ada.inputs();
  inp[0] = state.angles[0];
  inp[1] = state.angles[1];
  ada.compute(4);
  const o = readOut();
  const panel = ui.result;
  panel.querySelector(".label").textContent = t("liveResult");
  if (o[0] !== 1) {
    panel.querySelector(".stats").innerHTML = "";
    showError(panel, o[1]);
    ui.insight.textContent = "";
    drawPath();
    return;
  }
  panel.classList.remove("invalid");
  panel.querySelector(".answer").textContent = "";
  panel.querySelector(".working").textContent = "";
  panel.querySelector(".stats").innerHTML = [
    [num(o[5]), "Length / ℓ"],
    [num(o[3]), "L"],
    [num(o[6]), "S = Length/(4G)"],
    [num(o[7]), "S = (c/3) ln(L/ε)"]
  ].map(([v, k]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
  ui.insight.textContent = fill(t("cards.path.insight"), {add: num(o[12]), double: num(o[11])});
  ui.maths.querySelector(".fold").textContent = t("cards.path.check");
  ui.maths.querySelector(".constants").textContent = fill(t("cards.path.cutoff"), {eps: num(o[4])});
  drawPath();
}

function drawHappy() {
  const {ctx, w, h} = fit(cards.secret.canvas);
  const map = diskMap(w, h);
  const geom = ada.geom();
  const gi = ada.geomI();
  ctx.clearRect(0, 0, w, h);
  const tiles = gi[0], samples = gi[4];
  let cursor = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#85ceff";
  for (let t = 0; t < tiles; t++) {
    ctx.beginPath();
    for (let e = 0; e < 5; e++) {
      polyline(ctx, map, geom, cursor, samples, e === 0);
      cursor += samples * 2;
    }
    ctx.closePath();
    ctx.stroke();
  }
  const boundary = gi[1];
  const dotAt = gi[6];
  for (let b = 0; b < boundary; b++) {
    const [x, y] = map.to(geom[dotAt + b * 2], geom[dotAt + b * 2 + 1]);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    if (gi[20 + b]) {
      ctx.strokeStyle = "#ff9f95";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#85ceff";
      ctx.fill();
    }
  }
  const bulkAt = gi[7];
  for (let t = 0; t < tiles; t++) {
    const [x, y] = map.to(geom[bulkAt + t * 2], geom[bulkAt + t * 2 + 1]);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = gi[100 + t] ? "#e5ff70" : "#ff9f95";
    ctx.fill();
  }
}

function refreshHappy() {
  const ui = cards.secret;
  const inp = ada.inputs();
  if (state.pattern !== null) {
    inp[0] = 1;
    inp[1] = state.pattern;
  } else {
    let mask = 0;
    for (let i = 0; i < 20; i++) if (state.erased[i]) mask |= 1 << i;
    inp[0] = 0;
    inp[1] = mask;
  }
  ada.compute(5);
  const o = readOut();
  const gi = ada.geomI();
  const n = gi[1];
  for (let i = 0; i < n; i++) state.erased[i] = gi[20 + i];
  state.pattern = null;
  const panel = ui.result;
  panel.classList.remove("invalid");
  panel.querySelector(".label").textContent = t("liveResult");
  const readable = o[4], total = o[2];
  panel.querySelector(".answer").textContent = `${num(readable)} / ${num(total)} ${t("readable")}`;
  panel.querySelector(".working").textContent = readable === total ? t("allReadable") : readable === 0 ? t("noneReadable") : t("someReadable");
  panel.querySelector(".stats").innerHTML = "";
  ui.insight.textContent = t("cards.secret.insight");
  ui.maths.querySelector(".note").textContent = t("cards.secret.rule");
  drawHappy();
}

function refreshAll() {
  refreshSkin();
  refreshBall();
  refreshDisk();
  refreshPath();
  refreshHappy();
}

function drag(canvas, start) {
  canvas.addEventListener("pointerdown", ev => {
    state.active = canvas.closest("article").id.replace("card-", "");
    const pos = localPos(canvas, ev);
    const dragState = start(pos, ev);
    if (!dragState) return;
    canvas.setPointerCapture(ev.pointerId);
    const move = ev2 => dragState.move(localPos(canvas, ev2));
    const up = () => {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      play("result");
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    playInput();
  });
}

function build() {
  const skin = shell("skin", "skin");
  cards.skin = skin;
  skin.canvas.style.cursor = "default";
  const mode = document.createElement("select");
  [["0", "modeMass"], ["1", "modeRadius"], ["2", "modeBits"]].forEach(([v, key]) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.dataset.i18n = key;
    mode.append(opt);
  });
  const slider = document.createElement("input");
  slider.type = "range"; slider.min = "0"; slider.max = "1000";
  const mass = document.createElement("input");
  mass.type = "number"; mass.step = "any";
  const radius = document.createElement("input");
  radius.type = "number"; radius.step = "any"; radius.min = "0";
  const bits = document.createElement("input");
  bits.type = "number"; bits.step = "any"; bits.min = "0";
  const massLabel = field("massInSuns", mass);
  const radiusLabel = field("radiusKm", radius);
  const bitsLabel = field("bitCount", bits);
  const sliderLabel = field("howHeavy", slider);
  skin.controls.append(field("known", mode), sliderLabel, massLabel, radiusLabel, bitsLabel);
  const presets = document.createElement("div");
  presets.className = "presets";
  presets.append(
    button("earth", () => { state.mode = 0; state.mass = state.C.earth; syncSkinFields(); refreshSkin(); play("result"); }),
    button("sun", () => { state.mode = 0; state.mass = state.C.sun; syncSkinFields(); refreshSkin(); play("result"); }),
    button("millionSuns", () => { state.mode = 0; state.mass = state.C.sun * 1e6; syncSkinFields(); refreshSkin(); play("result"); })
  );
  skin.controls.append(presets);
  function massFromSlider(v) {
    const min = Math.log10(state.C.earth), max = Math.log10(state.C.sun * 1e9);
    return 10 ** (min + (max - min) * v / 1000);
  }
  function sliderFromMass(kg) {
    const min = Math.log10(state.C.earth), max = Math.log10(state.C.sun * 1e9);
    return String(Math.round((Math.log10(kg) - min) / (max - min) * 1000));
  }
  function syncSkinFields() {
    mode.value = String(state.mode);
    sliderLabel.hidden = state.mode !== 0;
    massLabel.hidden = state.mode !== 0;
    radiusLabel.hidden = state.mode !== 1;
    bitsLabel.hidden = state.mode !== 2;
    if (state.mode === 0) {
      slider.value = sliderFromMass(state.mass);
      mass.value = sunsText(state.mass);
    } else if (state.mode === 1) {
      radius.value = String(state.radiusM / 1000);
    } else {
      bits.value = String(state.bits);
    }
  }
  mode.addEventListener("change", () => {
    state.mode = Number(mode.value);
    syncSkinFields();
    play("click");
    refreshSkin();
  });
  slider.addEventListener("input", () => {
    state.mode = 0;
    state.mass = massFromSlider(Number(slider.value));
    mass.value = sunsText(state.mass);
    playInput();
    refreshSkin();
  });
  slider.addEventListener("change", () => play("result"));
  mass.addEventListener("input", () => {
    state.mode = 0;
    state.mass = mass.value.trim() === "" ? NaN : Number(mass.value) * state.C.sun;
    playInput();
    refreshSkin();
  });
  radius.addEventListener("input", () => {
    state.mode = 1;
    state.radiusM = radius.value.trim() === "" ? NaN : Number(radius.value) * 1000;
    playInput();
    refreshSkin();
  });
  bits.addEventListener("input", () => {
    state.mode = 2;
    state.bits = bits.value.trim() === "" ? NaN : Number(bits.value);
    playInput();
    refreshSkin();
  });
  for (const el of [mass, radius, bits]) el.addEventListener("change", () => play("result"));
  skin.reset.onclick = () => {
    play("reset");
    state.mode = 0;
    state.mass = state.C.sun;
    syncSkinFields();
    refreshSkin();
  };
  skin.sync = syncSkinFields;
  skin.canvas.setAttribute("aria-label", t("cards.skin.title"));
  skin.maths.querySelector(".equation").textContent = "rₛ = 2GM / c²\nA = 4π rₛ²\nS = k_B A / (4 ℓ_P²)\nbits = S / (k_B ln 2)";

  const area = shell("area", "area");
  cards.area = area;
  area.hint.dataset.i18n = "cards.area.slice";
  const ball = document.createElement("input");
  ball.type = "range"; ball.min = "1"; ball.max = "12"; ball.step = "1";
  const ballN = document.createElement("input");
  ballN.type = "number"; ballN.min = "1"; ballN.max = "12"; ballN.step = "1";
  area.controls.append(field("ballSize", ball), field("ballRadius", ballN));
  area.maths.querySelector(".equation").textContent = "V = (4/3) π r³\nA = 4 π r²";
  function syncBall() { ball.value = String(state.ball); ballN.value = String(state.ball); }
  ball.addEventListener("input", () => { state.ball = Number(ball.value); ballN.value = ball.value; playInput(); refreshBall(); });
  ball.addEventListener("change", () => play("result"));
  ballN.addEventListener("input", () => {
    state.ball = ballN.value.trim() === "" ? NaN : Number(ballN.value);
    playInput();
    refreshBall();
  });
  ballN.addEventListener("change", () => play("result"));
  area.reset.onclick = () => { play("reset"); state.ball = 4; syncBall(); refreshBall(); };
  area.sync = syncBall;

  const sheet = shell("sheet", "sheet");
  cards.sheet = sheet;
  sheet.hint.dataset.i18n = "panHint";
  sheet.maths.querySelector(".equation").textContent = "φ = arccos( 2ρ / (1 + ρ²) )";
  sheet.reset.onclick = () => { play("reset"); state.view = [0, 0]; state.bulk = [0.45, 0.2]; refreshDisk(); };
  drag(sheet.canvas, pos => {
    refreshDisk();
    const {w, h} = {w: sheet.canvas.getBoundingClientRect().width, h: sheet.canvas.getBoundingClientRect().height};
    const map = diskMap(w, h);
    const [bx, by] = map.to(state.bulk[0], state.bulk[1]);
    const near = Math.hypot(pos[0] - bx, pos[1] - by) < 18;
    let last = pos;
    return {move(p) {
      if (near) {
        const [x, y] = map.from(p[0], p[1]);
        state.bulk = [x, y];
      } else {
        state.view[0] -= (p[0] - last[0]) / map.R;
        state.view[1] += (p[1] - last[1]) / map.R;
        last = p;
      }
      playInput();
      refreshDisk();
    }};
  });

  const path = shell("path", "path");
  cards.path = path;
  path.hint.dataset.i18n = "pathHint";
  path.maths.querySelector(".equation").textContent = "S = Length / (4G)\nS = (c / 3) ln(L / ε)";
  path.reset.onclick = () => { play("reset"); state.angles = [0.4, 2.4]; refreshPath(); };
  drag(path.canvas, pos => {
    const rect = path.canvas.getBoundingClientRect();
    const map = diskMap(rect.width, rect.height);
    const handles = state.angles.map(ang => map.to(Math.cos(ang), Math.sin(ang)));
    let which = -1, best = 36;
    handles.forEach(([x, y], i) => {
      const d = Math.hypot(pos[0] - x, pos[1] - y);
      if (d < best) { best = d; which = i; }
    });
    if (which < 0) return null;
    return {move(p) {
      const [x, y] = map.from(p[0], p[1]);
      state.angles[which] = Math.atan2(y, x);
      playInput();
      refreshPath();
    }};
  });

  const secret = shell("secret", "secret");
  cards.secret = secret;
  secret.hint.dataset.i18n = "secretHint";
  secret.maths.querySelector(".equation").textContent = "any 3 of 6 legs  →  the other 3";
  secret.controls.append(
    button("restore", () => { state.pattern = 0; refreshHappy(); play("result"); }),
    button("oneEach", () => { state.pattern = 2; refreshHappy(); play("result"); }),
    button("twoEach", () => { state.pattern = 3; refreshHappy(); play("result"); }),
    button("twoPetals", () => { state.pattern = 4; refreshHappy(); play("result"); })
  );
  secret.reset.onclick = () => { play("reset"); state.pattern = 0; refreshHappy(); };
  secret.canvas.addEventListener("pointerdown", ev => {
    state.active = "secret";
    refreshHappy();
    const rect = secret.canvas.getBoundingClientRect();
    const map = diskMap(rect.width, rect.height);
    const [px, py] = localPos(secret.canvas, ev);
    const geom = ada.geom();
    const gi = ada.geomI();
    const dotAt = gi[6];
    let which = -1, best = 20;
    for (let b = 0; b < gi[1]; b++) {
      const [x, y] = map.to(geom[dotAt + b * 2], geom[dotAt + b * 2 + 1]);
      const d = Math.hypot(px - x, py - y);
      if (d < best) { best = d; which = b; }
    }
    if (which < 0) return;
    state.erased[which] = state.erased[which] ? 0 : 1;
    state.pattern = null;
    play("click");
    refreshHappy();
    play("result");
  });

  translatePage();
  skin.sync();
  area.sync();
}

translatePage();
bindSoundButton();
wireLanguages(() => { play("language"); session.note("language"); });
document.getElementById("crash-dismiss")?.addEventListener("click", () => {
  document.getElementById("crash").hidden = true;
});
document.querySelectorAll("[data-jump]").forEach(link => {
  link.addEventListener("click", ev => {
    ev.preventDefault();
    play("click");
    const id = "card-" + link.dataset.jump;
    document.getElementById(id)?.scrollIntoView({behavior: reduced ? "instant" : "smooth", block: "start"});
    history.replaceState(null, "", "#" + id);
    state.active = link.dataset.jump;
  });
});

loadAda().then(mod => {
  ada = mod;
  ada.compute(6);
  const o = readOut();
  state.C = {G: o[2], c: o[3], h: o[4], hbar: o[5], kB: o[6], lp: o[7], sun: o[8], earth: o[9]};
  state.mass = state.C.sun;
  session.note("wasm loaded");
  build();
  refreshAll();
  document.title = t("brand") + " · " + t("tour");
  document.querySelectorAll("[data-jump]").forEach(link => {
    link.textContent = t("cards." + link.dataset.jump + ".title");
  });
  addEventListener("languagechange", () => {
    translatePage();
    document.querySelectorAll("[data-jump]").forEach(link => {
      link.textContent = t("cards." + link.dataset.jump + ".title");
    });
    cards.skin.sync();
    refreshAll();
    document.title = t("brand") + " · " + t("tour");
  });
  addEventListener("resize", () => refreshAll());
}).catch(err => session.fail(err));
