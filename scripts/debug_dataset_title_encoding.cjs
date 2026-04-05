/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";
const idArg = Number(process.argv[3] || 1);
const outPath = process.argv[4] || ".tmp_dataset_title_debug.json";

function codepoints(str, limit = 64) {
  const cps = [];
  for (const ch of String(str || "")) {
    cps.push("U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
    if (cps.length >= limit) break;
  }
  return cps;
}

const text = fs.readFileSync(datasetPath, "utf8");

const marker = `id: ${idArg},`;
const pos = text.indexOf(marker);
if (pos < 0) throw new Error("marker not found");
const slice = text.slice(Math.max(0, pos - 80), Math.min(text.length, pos + 260));

const m = text.slice(pos, pos + 800).match(/title\s*:\s*"([^"]+)"/);
const title = m ? m[1] : null;

const payload = {
  datasetPath,
  id: idArg,
  markerPos: pos,
  nearbyText: slice,
  title,
  titleCodepoints: codepoints(title),
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath}`);
