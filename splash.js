import {VERSION, loadAda} from "./ada.js?v=2";
import {t, translatePage, wireLanguages} from "./i18n.js?v=2";
import {play, bindSoundButton} from "./sounds.js?v=2";
import {startSession} from "./session.js?v=2";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const session = startSession({version: VERSION, details: () => ({page: "splash", reduced})});
translatePage();
document.title = t("brand");
bindSoundButton();
wireLanguages(() => play("language"));
document.getElementById("crash-dismiss")?.addEventListener("click", () => {
  document.getElementById("crash").hidden = true;
});
document.getElementById("enter")?.addEventListener("click", () => play("click"));

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
let ada = null;
let running = !reduced;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function stars(w, h) {
  let s = 20261114;
  for (let i = 0; i < 70; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const x = (s % 1000) / 1000 * w;
    s = (s * 1103515245 + 12345) >>> 0;
    const y = (s % 1000) / 1000 * h;
    ctx.globalAlpha = 0.15 + (s % 50) / 120;
    ctx.fillStyle = "#d5e6f2";
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  const w = innerWidth, h = innerHeight;
  ctx.clearRect(0, 0, w, h);
  stars(w, h);
  if (!ada) return;
  const out = ada.outputs();
  const geom = ada.geom();
  const n = ada.geomI()[0];
  const cx = w / 2, cy = h * 0.46;
  const scale = Math.min(w, h) * 0.92;
  const R = out[2] * scale;
  const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.4);
  glow.addColorStop(0, "#02060a");
  glow.addColorStop(0.45, "#02060a");
  glow.addColorStop(0.62, "#16384c");
  glow.addColorStop(0.78, "#0c2433");
  glow.addColorStop(1, "rgba(9,19,29,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e5ff70";
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = geom[i * 3 + 2];
    ctx.fillStyle = "#e5ff70";
    const x = cx + geom[i * 3] * scale;
    const y = cy - geom[i * 3 + 1] * scale;
    ctx.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#02060a";
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

function frame() {
  try {
    if (running) ada.tick();
    draw();
  } catch (err) {
    session.fail(err);
    const lead = document.querySelector(".hint-line");
    if (lead) lead.textContent = t("splashError");
    return;
  }
  if (running) requestAnimationFrame(frame);
}

addEventListener("resize", () => { resize(); if (ada) draw(); });
resize();

loadAda().then(mod => {
  ada = mod;
  ada.compute(0);
  session.note("wasm loaded");
  draw();
  if (running) requestAnimationFrame(frame);
}).catch(err => {
  session.fail(err);
  const lead = document.querySelector(".hint-line");
  if (lead) lead.textContent = t("splashError");
});
