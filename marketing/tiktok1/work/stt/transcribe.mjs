import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../../..");
const compositor = path.join(root, "video/node_modules/@remotion/compositor-darwin-arm64");
const audio = path.resolve(
  here,
  "../../ElevenLabs_2026-10-25T21_05_19_Tony Smyles - The Voice of Trust_pvc_sp100_s50_sb75_v4.mp3"
);
const wav = path.join(here, "narration-16k.wav");
const whisperPath = path.join(here, "whisper.cpp");
const model = "medium.en";

execFileSync(path.join(compositor, "ffmpeg"), ["-y", "-i", audio, "-ar", "16000", "-ac", "1", wav], {
  env: { ...process.env, DYLD_LIBRARY_PATH: compositor },
  stdio: "inherit",
});

await installWhisperCpp({ to: whisperPath, version: "1.5.5" });
await downloadWhisperModel({ model, folder: whisperPath });

const result = await transcribe({
  inputPath: wav,
  whisperPath,
  model,
  whisperCppVersion: "1.5.5",
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput: result });
fs.writeFileSync(path.join(here, "transcript-words.json"), JSON.stringify(captions, null, 2));
console.log(captions.map((c) => c.text).join(""));
