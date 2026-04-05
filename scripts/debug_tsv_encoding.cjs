/* eslint-disable no-console */
const fs = require("fs");

const tsvPath = process.argv[2] || "jikan_title_updates.tsv";
const outPath = process.argv[3] || ".tmp_tsv_debug.json";

function parseTsv(tsvText) {
  const lines = String(tsvText || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines.shift().split("\t");
  return lines.map((line) => {
    const cols = line.split("\t");
    const row = {};
    for (let i = 0; i < header.length; i += 1) row[header[i]] = cols[i] ?? "";
    return row;
  });
}

function codepoints(str, limit = 32) {
  const cps = [];
  for (const ch of String(str || "")) {
    cps.push("U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
    if (cps.length >= limit) break;
  }
  return cps;
}

const raw = fs.readFileSync(tsvPath, "utf8");
const rows = parseTsv(raw);
const first = rows[0] || null;

const payload = {
  tsvPath,
  rowCount: rows.length,
  header: first ? Object.keys(first) : [],
  firstRow: first,
  titleNewCodepoints: first ? codepoints(first.title_new) : [],
  titleOldCodepoints: first ? codepoints(first.title_old) : [],
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath}`);
