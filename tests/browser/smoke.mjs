import puppeteer from "puppeteer-core";
import {mkdir} from "node:fs/promises";

const base = process.env.BASE || "http://127.0.0.1:8765";
const out = process.env.SHOTS || "/workspace/screenshots";
await mkdir(out, {recursive: true});

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--use-fake-ui-for-media-stream"]
});
const errors = [];
const page = await browser.newPage();
page.on("pageerror", err => errors.push("pageerror: " + err.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push("console: " + msg.text());
});
await page.setViewport({width: 1280, height: 800});

await page.goto(base + "/index.html?v=1", {waitUntil: "networkidle0"});
await page.waitForFunction(() => {
  const c = document.getElementById("sky");
  if (!c || c.width < 100) return false;
  const px = c.getContext("2d").getImageData(Math.floor(c.width / 2), Math.floor(c.height * 0.46), 1, 1).data;
  return px[3] > 200;
});
await page.screenshot({path: out + "/splash.png"});

await Promise.all([
  page.waitForNavigation({waitUntil: "networkidle0"}),
  page.click("#enter h1")
]);
await page.waitForFunction(() => {
  const b = document.querySelector("#card-skin .stats b");
  return b && /km/i.test(b.textContent);
});
await shot("#card-skin", "card-1-skin.png");

const slider = await page.$("#card-skin input[type=range]");
const box = await slider.boundingBox();
await page.mouse.click(box.x + box.width * 0.72, box.y + box.height / 2);
await page.waitForFunction(() => /Sun|Sonne|sol|Soleil/i.test(document.querySelector("#card-skin .answer").textContent));
await page.click("#card-skin .presets button");
await page.waitForFunction(() => document.querySelector("#card-skin .answer").textContent.length > 0);

await shot("#card-area", "card-2-area.png");
const ball = await page.$("#card-area input[type=range]");
const bb = await ball.boundingBox();
await page.mouse.click(bb.x + bb.width * 0.8, bb.y + bb.height / 2);
await page.waitForFunction(() => {
  const b = document.querySelector("#card-area .stats b");
  return b && b.textContent.trim().length > 0;
});

await page.$eval("#card-sheet", el => el.scrollIntoView({block: "center"}));
const disk = await page.$("#card-sheet canvas");
const db = await disk.boundingBox();
await page.mouse.move(db.x + db.width * 0.62, db.y + db.height * 0.42);
await page.mouse.down();
await page.mouse.move(db.x + db.width * 0.7, db.y + db.height * 0.55, {steps: 6});
await page.mouse.up();
await page.mouse.move(db.x + db.width * 0.3, db.y + db.height * 0.3);
await page.mouse.down();
await page.mouse.move(db.x + db.width * 0.38, db.y + db.height * 0.34, {steps: 4});
await page.mouse.up();
await shot("#card-sheet", "card-3-disk.png");

await page.$eval("#card-path", el => el.scrollIntoView({block: "center"}));
const path = await page.$("#card-path canvas");
const pb = await path.boundingBox();
const cx = pb.x + pb.width / 2, cy = pb.y + pb.height / 2;
const R = Math.min(pb.width, pb.height) * 0.44;
await page.mouse.move(cx + R * Math.cos(0.4), cy - R * Math.sin(0.4));
await page.mouse.down();
await page.mouse.move(cx + R * Math.cos(1.1), cy - R * Math.sin(1.1), {steps: 5});
await page.mouse.up();
await page.waitForFunction(() => document.querySelectorAll("#card-path .stats b").length === 4);
await shot("#card-path", "card-4-geodesic.png");

await shot("#card-secret", "card-5-happy.png");
await page.click("#card-skin summary");
await page.waitForFunction(() => /rₛ|2GM/.test(document.querySelector("#card-skin .equation").textContent));
await page.click("#card-secret .controls button:nth-of-type(3)");
await page.waitForFunction(() => document.querySelector("#card-secret .answer").textContent.trim().startsWith("0"));
await shot("#card-secret", "card-5-erased.png");
await page.$eval("#card-secret", el => el.scrollIntoView({block: "center"}));
const secret = await page.$("#card-secret canvas");
const sb = await secret.boundingBox();
await page.mouse.click(sb.x + sb.width * 0.5, sb.y + 28);

await page.click("[data-language=es]");
await page.waitForFunction(() => document.documentElement.lang === "es-ES" && /agujero negro/i.test(document.body.innerText));
await page.click("[data-language=fr]");
await page.waitForFunction(() => document.documentElement.lang === "fr-FR" && /trou noir/i.test(document.body.innerText));
await page.click("[data-language=de]");
await page.waitForFunction(() => document.documentElement.lang === "de-DE");
await page.waitForFunction(() => /Gedächtnis|Fläche|Haut/.test(document.body.innerText));
await shot("#card-skin", "card-1-german.png");

await page.click("#sound-toggle");
await page.reload({waitUntil: "networkidle0"});
await page.waitForFunction(() => document.querySelector("#card-skin .stats b"));
const muted = await page.$eval("#sound-toggle", el => el.getAttribute("aria-pressed") === "true");
if (!muted) errors.push("sound preference did not survive reload");

const cdp = await page.createCDPSession();
await cdp.send("Page.setDownloadBehavior", {behavior: "allow", downloadPath: "/tmp"});
await page.keyboard.press("F9");
await new Promise(r => setTimeout(r, 400));

await page.setViewport({width: 390, height: 844});
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({path: out + "/card-1-mobile.png"});

const quiet = await browser.newPage();
const quietErrors = [];
quiet.on("pageerror", err => quietErrors.push(err.message));
quiet.on("console", msg => { if (msg.type() === "error") quietErrors.push(msg.text()); });
await quiet.emulateMediaFeatures([{name: "prefers-reduced-motion", value: "reduce"}]);
await quiet.setViewport({width: 1280, height: 800});
await quiet.goto(base + "/index.html?v=1", {waitUntil: "networkidle0"});
await quiet.waitForFunction(() => {
  const c = document.getElementById("sky");
  return c && c.width > 100;
});
await quiet.screenshot({path: out + "/splash-reduced-motion.png"});
errors.push(...quietErrors);

await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("BROWSER PASS");

async function shot(sel, name) {
  await page.evaluate(() => { document.querySelector("header").style.visibility = "hidden"; });
  const el = await page.$(sel);
  await el.evaluate(node => node.scrollIntoView({block: "center"}));
  await el.screenshot({path: out + "/" + name});
  await page.evaluate(() => { document.querySelector("header").style.visibility = ""; });
}
