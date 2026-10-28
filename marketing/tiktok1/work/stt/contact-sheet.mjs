import path from "node:path";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../../..");
const chrome = path.join(
  root,
  "video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell"
);
const dir = path.resolve(here, "../qa/final");
const files = fs.readdirSync(dir).filter((f) => f.startsWith("t") && f.endsWith(".png")).sort();
const perSheet = 15;

const browser = await puppeteer.launch({ executablePath: chrome, headless: "shell", args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
for (let s = 0; s * perSheet < files.length; s++) {
  const chunk = files.slice(s * perSheet, (s + 1) * perSheet);
  const html = `<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(5,270px);gap:6px;padding:6px;font:16px sans-serif;color:#fff">${chunk
    .map((f) => `<div><img src="file://${dir}/${f}" width="270" height="480"><div>${f.slice(1, -4)} s</div></div>`)
    .join("")}</body></html>`;
  const htmlPath = path.join(dir, `sheet${s}.html`);
  fs.writeFileSync(htmlPath, html);
  await page.setViewport({ width: 5 * 276 + 6, height: 3 * 510 + 12 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.screenshot({ path: path.join(dir, `sheet${s}.jpg`), type: "jpeg", quality: 85 });
}
await browser.close();
