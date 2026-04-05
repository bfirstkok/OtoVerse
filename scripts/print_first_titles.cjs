/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";
const count = Number(process.argv[3] || 15);

const text = fs.readFileSync(datasetPath, "utf8");
const start = text.indexOf("const animeData = [");
if (start < 0) throw new Error("animeData start not found");
const end = text.indexOf("];", start);
if (end < 0) throw new Error("animeData end not found");
const chunk = text.slice(start, end);

const re = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\}/g;
const rows = [];
let m;
while ((m = re.exec(chunk))) {
  rows.push({ id: Number(m[1]), title: String(m[2] || "").trim() });
  if (rows.length >= count) break;
}

console.log(JSON.stringify(rows, null, 2));
