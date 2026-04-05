/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";

const text = fs.readFileSync(datasetPath, "utf8");
const start = text.indexOf("const animeData = [");
if (start < 0) throw new Error("animeData start not found");
const end = text.indexOf("];", start);
if (end < 0) throw new Error("animeData end not found");
const chunk = text.slice(start, end);

const objRe = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\}/g;
const rows = [];
let m;
while ((m = objRe.exec(chunk))) {
  rows.push({ id: Number(m[1]), title: String(m[2] || "").trim() });
}

const suffixRe = /\s*\((OP|ED)\s*\d+\)\s*$/i;

const missing = rows.filter((r) => !suffixRe.test(r.title));

console.log(`rows=${rows.length}`);
console.log(`missingSuffix=${missing.length}`);
if (missing.length) {
  console.log("First 25 missing:");
  for (const r of missing.slice(0, 25)) console.log(`- id=${r.id} title=${r.title}`);
}
