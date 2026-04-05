/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";
const id = Number(process.argv[3] || 403);

const text = fs.readFileSync(datasetPath, "utf8");
const start = text.indexOf("const animeData = [");
if (start < 0) throw new Error("animeData start not found");
const end = text.indexOf("];", start);
if (end < 0) throw new Error("animeData end not found");
const chunk = text.slice(start, end);

const objRe = new RegExp(
  String.raw`\{[\s\S]*?\bid\s*:\s*(${id})\b[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\}`
);
const m = chunk.match(objRe);
const title = m ? String(m[2]).trim() : null;

const suffixRe = /\s*\((OP|ED)\s*\d+\)\s*$/i;

console.log(JSON.stringify({ datasetPath, id, title, suffixMatch: suffixRe.test(title || "") }, null, 2));
