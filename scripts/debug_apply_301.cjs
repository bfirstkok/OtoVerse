/* eslint-disable no-console */
const fs = require("fs");

function parseTsv(tsvText) {
  const lines = String(tsvText || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = lines.shift().split("\t");
  const rows = [];
  for (const line of lines) {
    const cols = line.split("\t");
    const row = {};
    for (let i = 0; i < header.length; i += 1) row[header[i]] = cols[i] ?? "";
    rows.push(row);
  }
  return rows;
}

function escapeJsString(str) {
  return JSON.stringify(String(str ?? ""));
}

function updateTitleById(fileText, id, newTitle) {
  const marker = `id: ${id},`;
  const markerPos = fileText.indexOf(marker);
  if (markerPos < 0) return { ok: false, reason: "id_not_found" };

  const objEnd = fileText.indexOf("},", markerPos);
  if (objEnd < 0) return { ok: false, reason: "object_end_not_found" };

  const segment = fileText.slice(markerPos, objEnd);
  const titleRe = /title:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;
  const m = segment.match(titleRe);
  if (!m) return { ok: false, reason: "title_not_found" };

  const replacement = `title: ${escapeJsString(newTitle)}`;

  const updatedSegment = segment.replace(titleRe, replacement);
  if (updatedSegment === segment) {
    return {
      ok: false,
      reason: "no_change",
      matched: m[0],
      replacement,
      segmentPreview: segment.slice(0, 220),
    };
  }

  return {
    ok: true,
    before: m[0],
    replacement,
    after: updatedSegment.match(titleRe)?.[0],
    segmentPreview: segment.slice(0, 220),
  };
}

const tsvPath = process.argv[2] || "jikan_romaji_title_updates.tsv";
const targetPath = process.argv[3] || "anime_op_quiz_starter.jsx";

console.log("cwd:", process.cwd());
try {
  console.log("tsv realpath:", fs.realpathSync(tsvPath));
} catch {
  console.log("tsv realpath: <failed>");
}
try {
  console.log("target realpath:", fs.realpathSync(targetPath));
} catch {
  console.log("target realpath: <failed>");
}

const tsv = fs.readFileSync(tsvPath, "utf8");
const rows = parseTsv(tsv);
const r301 = rows.find((r) => Number(r.id) === 301);
console.log("TSV header:", tsv.split(/\r?\n/)[0]);
console.log("Row 301:", r301);

const fileText = fs.readFileSync(targetPath, "utf8");
const st = fs.statSync(targetPath);
console.log("target size:", st.size, "bytes");
console.log(
  "contains Cardfight!! OP1:",
  fileText.includes('title: "Cardfight!! Vanguard (OP1)"')
);
console.log(
  "contains Cardfight OP1:",
  fileText.includes('title: "Cardfight Vanguard (OP1)"')
);
function extractTitleLine(fileText, id) {
  const marker = `id: ${id},`;
  const pos = fileText.indexOf(marker);
  if (pos < 0) return null;
  const end = fileText.indexOf("},", pos);
  const segment = fileText.slice(pos, end < 0 ? pos + 500 : end);
  const m = segment.match(/title:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
  return m?.[0] ?? null;
}

for (const id of [301, 302, 303]) {
  const row = rows.find((r) => Number(r.id) === id);
  console.log("\n== id", id, "==");
  console.log("row title_new:", row?.title_new);
  console.log("disk title:", extractTitleLine(fileText, id));
  const preview = updateTitleById(fileText, id, row?.title_new);
  console.log("update preview:", preview);
}
