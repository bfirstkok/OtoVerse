import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const root = process.cwd();

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function toAbs(p) {
  return path.resolve(root, p);
}

async function convertGifToMp4({ inputRel, outputRel }) {
  const input = toAbs(inputRel);
  const output = toAbs(outputRel);

  if (!existsSync(input)) {
    throw new Error(`Missing input: ${inputRel}`);
  }

  // Notes:
  // - scale to even dims for H.264
  // - baseline profile for broad mobile Safari compatibility
  // - +faststart for streaming
  const args = [
    "-y",
    "-i",
    input,
    "-movflags",
    "+faststart",
    "-an",
    "-vf",
    "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v",
    "libx264",
    "-profile:v",
    "baseline",
    "-level",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "slow",
    "-crf",
    "28",
    output
  ];

  console.log(`\nConverting ${inputRel} -> ${outputRel}`);
  await run(ffmpegPath, args);
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static did not provide a binary path");
  }

  await convertGifToMp4({ inputRel: "public/libarry1.gif", outputRel: "public/libarry1.mp4" });
  await convertGifToMp4({ inputRel: "public/libarry2.gif", outputRel: "public/libarry2.mp4" });

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
