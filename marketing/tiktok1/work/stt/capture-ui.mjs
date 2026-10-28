import path from "node:path";
import puppeteer from "puppeteer-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../../..");
const chrome = path.join(
  root,
  "video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell"
);
const outDir = path.resolve(here, "../ui");
const base = process.env.PREVIEW_URL ?? "http://localhost:3123/host/video-preview";
const screens = process.argv.slice(2).length ? process.argv.slice(2) : ["dashboard", "calendars", "arrivals", "cleanings"];

const browser = await puppeteer.launch({ executablePath: chrome, headless: "shell" });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 4, isMobile: true, hasTouch: true });

for (const screen of screens) {
  await page.goto(`${base}/${screen}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector(".hostvia-dashboard-page h1, .hostvia-dashboard-page h2", { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
  });
  const file = path.join(outDir, `${screen}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(screen, "css height", h);
}
await browser.close();
