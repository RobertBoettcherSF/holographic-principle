// Event log, crash marker and the F9 feedback file. Same idea as the
// symmetry-visualizations page: the log survives a reload, and a session
// that did not close cleanly offers the previous log as a crash report.
const LOG_MAX = 200;

function storage() {
  try {
    localStorage.setItem("hp.probe", "1");
    localStorage.removeItem("hp.probe");
    return localStorage;
  } catch {
    const m = new Map();
    return {getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k)};
  }
}

export function startSession({version, details}) {
  const store = storage();
  let log = [];
  try { log = JSON.parse(store.getItem("hp.log") || "[]"); } catch { log = []; }
  const errors = [];
  const crashedBefore = store.getItem("hp.clean") === "0";
  const previousLog = log.slice();
  store.setItem("hp.clean", "0");

  function note(ev, data) {
    log.push({t: new Date().toISOString(), ev, data});
    if (log.length > LOG_MAX) log.shift();
    try { store.setItem("hp.log", JSON.stringify(log)); } catch { /* ignore */ }
  }
  function download(name, obj) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], {type: "application/json"}));
    a.download = name;
    a.click();
    note("download", name);
  }
  function stamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }
  function feedback() {
    let extra = {};
    try { extra = details?.() ?? {}; } catch (err) { errors.push(String(err)); }
    return {
      version, time: new Date().toISOString(),
      browser: navigator.userAgent,
      screen: [innerWidth, innerHeight, devicePixelRatio],
      language: document.documentElement.lang,
      fps: currentFps(), errors, events: log, ...extra
    };
  }

  note("start", {version, crashedBefore, href: location.href});
  let fatal = false;
  addEventListener("pagehide", () => { if (!fatal) { note("clean exit"); store.setItem("hp.clean", "1"); } });
  setInterval(() => { try { store.setItem("hp.heartbeat", String(Date.now())); } catch { /* ignore */ } }, 2000);
  addEventListener("error", ev => { errors.push(String(ev.message) + " @" + ev.lineno); note("error", String(ev.message)); });
  addEventListener("unhandledrejection", ev => { errors.push(String(ev.reason)); note("rejection", String(ev.reason)); });

  const crash = document.getElementById("crash");
  const crashDl = document.getElementById("crash-dl");
  if (crashedBefore && crash && crashDl) {
    crash.hidden = false;
    crashDl.onclick = () => download("crash-report-" + stamp() + ".json", {
      version,
      lastHeartbeat: new Date(+store.getItem("hp.heartbeat") || Date.now()).toISOString(),
      browser: navigator.userAgent,
      eventsBeforeCrash: previousLog,
      eventsAfterReload: log.slice(previousLog.length)
    });
  }

  let frames = 0, fps = 0, windowStart = performance.now();
  setInterval(() => {
    const elapsed = performance.now() - windowStart;
    fps = elapsed > 0 ? Math.round(frames * 1000 / elapsed) : 0;
    frames = 0;
    windowStart = performance.now();
  }, 1000);
  const count = () => { frames++; requestAnimationFrame(count); };
  requestAnimationFrame(count);
  function currentFps() {
    const elapsed = performance.now() - windowStart;
    if (frames > 2 && elapsed > 50) return Math.round(frames * 1000 / elapsed);
    return fps;
  }

  addEventListener("keydown", ev => {
    if (ev.key !== "F9") return;
    ev.preventDefault();
    download("feedback-" + stamp() + ".json", feedback());
  });

  return {
    note, errors, download, stamp,
    fail(err) {
      fatal = true;
      errors.push(String(err));
      note("wasm trap", String(err));
      if (crash) {
        crash.hidden = false;
        const text = crash.querySelector("p");
        if (text) text.textContent = String(err);
      }
      if (crashDl) crashDl.onclick = () => download("crash-report-" + stamp() + ".json", feedback());
    }
  };
}
