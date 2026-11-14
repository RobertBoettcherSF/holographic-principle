import {t} from "./i18n.js?v=1";

const KEY = "hp.sound";
export const SOUND_EVENTS = ["input", "result", "language", "reset", "click"];
const tones = {input: [740, 0.028], result: [988, 0.045], language: [523, 0.055], reset: [392, 0.04], click: [640, 0.03]};
let muted = false;
try { muted = localStorage.getItem(KEY) === "off"; } catch { /* private mode */ }
let context = null;
export const isMuted = () => muted;

export function setMuted(value) {
  muted = Boolean(value);
  try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* ignore */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("soundchange"));
}
export function toggleMuted() { setMuted(!muted); return muted; }

export function play(name) {
  if (!SOUND_EVENTS.includes(name) || muted) return false;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return true;
  try {
    if (!context) context = new AC();
    if (context.state === "suspended") context.resume().catch(() => {});
    const [freq, dur] = tones[name], start = context.currentTime;
    const osc = context.createOscillator(), gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  } catch { /* autoplay limits */ }
  return true;
}

export function bindSoundButton() {
  const button = document.getElementById("sound-toggle");
  if (!button) return;
  const update = () => {
    button.textContent = t(muted ? "soundOn" : "soundOff");
    button.setAttribute("aria-pressed", String(muted));
  };
  button.onclick = () => { toggleMuted(); update(); };
  window.addEventListener("languagechange", update);
  update();
}
