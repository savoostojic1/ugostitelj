// Extracts frames from the rendered MP4 and renders them into out/hostvia-promo-contact-sheet.jpg.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const TIMES = [1.0, 2.3, 4.0, 7.2, 10.0, 11.5, 13.3, 16.0, 18.5, 20.3, 23.0, 27.8, 30.0, 32.0, 33.8, 39.9];
const run = (args) => execFileSync("npx", args, { stdio: ["ignore", "ignore", "inherit"] });

mkdirSync("public/contact", { recursive: true });
TIMES.forEach((time, i) => {
  run([
    "remotion", "ffmpeg", "-v", "error", "-y",
    "-ss", String(time), "-i", "out/hostvia-promo.mp4",
    "-frames:v", "1", "-vf", "scale=920:-1",
    `public/contact/${String(i + 1).padStart(2, "0")}.png`,
  ]);
});
run([
  "remotion", "still", "src/index.ts", "ContactSheet",
  "out/hostvia-promo-contact-sheet.jpg", "--image-format=jpeg", "--jpeg-quality=90",
]);
console.log("Wrote out/hostvia-promo-contact-sheet.jpg");
