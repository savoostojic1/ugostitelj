import path from "node:path";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../../..");
const chrome = path.join(
  root,
  "video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell"
);
const base = "http://localhost:3123/host/video-preview";

const targets = {
  dashboard: ["Dashboard", "Occupancy", "Arrivals today", "Upcoming arrivals", "Properties", "Bungalow 5"],
  calendars: ["Calendars", "Bungalow 1", "Bungalow 3", "Bungalow 5"],
  arrivals: ["Arrivals & Departures", "Today", "Tomorrow", "This Week"],
  cleanings: ["Cleanings", "Monthly calendar", "Free days until end of month", "October 2026", "21", "22", "23"],
};

const browser = await puppeteer.launch({ executablePath: chrome, headless: "shell" });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const out = {};
for (const [screen, texts] of Object.entries(targets)) {
  await page.goto(`${base}/${screen}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".hostvia-dashboard-page h1, .hostvia-dashboard-page h2");
  await new Promise((r) => setTimeout(r, 1500));
  out[screen] = await page.evaluate((texts) => {
    const res = {};
    const all = [...document.querySelectorAll(".hostvia-dashboard-page *, .hostvia-sidebar *")];
    for (const t of texts) {
      const el = all.find((e) => e.children.length === 0 && e.textContent.trim() === t);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      res[t] = { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: Math.round(r.left) };
    }
    res.__height = document.documentElement.scrollHeight;
    return res;
  }, texts);
}
fs.writeFileSync(path.resolve(here, "../ui/positions.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await browser.close();
