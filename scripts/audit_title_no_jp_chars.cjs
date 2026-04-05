/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";

function hasJapaneseScript(s) {
  return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(String(s || ""));
}

const text = fs.readFileSync(datasetPath, "utf8");
const start = text.indexOf("const animeData = [");
if (start < 0) throw new Error("animeData start not found");
const end = text.indexOf("];", start);
if (end < 0) throw new Error("animeData end not found");
const chunk = text.slice(start, end);

const re = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\}/g;
const bad = [];
let m;
while ((m = re.exec(chunk))) {
  const id = Number(m[1]);
  const title = String(m[2] || "").trim();
  if (hasJapaneseScript(title)) bad.push({ id, title });
}

console.log(`badTitlesWithJapaneseChars=${bad.length}`);
for (const r of bad.slice(0, 25)) console.log(`- id=${r.id} title=${r.title}`);
