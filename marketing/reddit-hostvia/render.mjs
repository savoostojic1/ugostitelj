import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(dir, "../../video");
const modulesLink = path.join(dir, "node_modules");
if (!existsSync(modulesLink)) {
  symlinkSync(path.join(videoDir, "node_modules"), modulesLink, "dir");
}
const remotion = path.join(videoDir, "node_modules/.bin/remotion");
const entry = path.join(dir, "src/index.ts");
const publicDir = path.join(videoDir, "public");
const mp4 = path.join(dir, "hostvia-reddit.mp4");
const gif = path.join(dir, "hostvia-reddit.gif");

function run(args) {
  const result = spawnSync(remotion, args, { cwd: videoDir, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run([
  "render",
  entry,
  "HostviaRedditAd",
  mp4,
  "--public-dir",
  publicDir,
  "--image-format",
  "png",
  "--codec",
  "h264",
  "--crf",
  "16",
  "--pixel-format",
  "yuv420p",
]);

const palette = path.join(mkdtempSync(path.join(tmpdir(), "hostvia-gif-")), "palette.png");

// Remotion's ffmpeg build does not include the fps filter. -r sets the output rate.
run([
  "ffmpeg",
  "-y",
  "-i",
  mp4,
  "-vf",
  "scale=1200:1200:flags=lanczos,palettegen=max_colors=192:stats_mode=full",
  "-update",
  "1",
  palette,
]);

run([
  "ffmpeg",
  "-y",
  "-i",
  mp4,
  "-i",
  palette,
  "-lavfi",
  "scale=1200:1200:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle",
  "-r",
  "12",
  "-loop",
  "0",
  gif,
]);

console.log(`\nWrote\n  ${mp4}\n  ${gif}`);
