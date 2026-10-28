import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(dir, "../../../../video");
const modulesLink = path.join(dir, "node_modules");
if (!existsSync(modulesLink)) {
  symlinkSync(path.join(videoDir, "node_modules"), modulesLink, "dir");
}
const remotion = path.join(videoDir, "node_modules/.bin/remotion");
const entry = path.join(dir, "src/index.ts");
const publicDir = path.join(dir, "public");
const output = path.resolve(dir, "../../hostvia_tiktok1.mp4");

function run(args) {
  const result = spawnSync(remotion, args, { cwd: dir, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const mode = process.argv[2] ?? "video";

if (mode === "stills") {
  const stillsDir = path.resolve(dir, "../qa/stills");
  mkdirSync(stillsDir, { recursive: true });
  const frames = process.argv.slice(3).map(Number);
  for (const frame of frames) {
    run([
      "still", entry, "HostviaTikTok1", path.join(stillsDir, `f${String(frame).padStart(4, "0")}.jpg`),
      "--public-dir", publicDir, "--frame", String(frame), "--image-format", "jpeg", "--jpeg-quality", "85", "--scale", "0.5",
    ]);
  }
} else {
  run([
    "render", entry, "HostviaTikTok1", output,
    "--public-dir", publicDir,
    "--codec", "h264",
    "--crf", "16",
    "--pixel-format", "yuv420p",
    "--color-space", "bt709",
    "--audio-codec", "aac",
    "--audio-bitrate", "256k",
    "--image-format", "jpeg",
    "--jpeg-quality", "95",
    "--concurrency", "4",
  ]);
  console.log(`\nWrote ${output}`);
}
