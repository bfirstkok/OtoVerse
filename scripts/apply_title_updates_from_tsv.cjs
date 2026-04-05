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
  if (!titleRe.test(segment)) return { ok: false, reason: "title_not_found" };

  const updatedSegment = segment.replace(titleRe, `title: ${escapeJsString(newTitle)}`);
  if (updatedSegment === segment) return { ok: false, reason: "no_change" };

  const updated = fileText.slice(0, markerPos) + updatedSegment + fileText.slice(objEnd);
  return { ok: true, updated };
}

function main() {
  const tsvPath = process.argv[2] || "jikan_title_updates.tsv";
  const targetPath = process.argv[3] || "anime_op_quiz_starter.jsx";

  if (!fs.existsSync(tsvPath)) throw new Error(`Missing ${tsvPath}`);
  if (!fs.existsSync(targetPath)) throw new Error(`Missing ${targetPath}`);

  const rows = parseTsv(fs.readFileSync(tsvPath, "utf8"));
  const updates = rows
    // Apply any row that proposes a non-empty title_new (status may vary: ok/low_confidence/forced/search_no_result, etc.)
    .map((r) => ({
      id: Number(r.id),
      titleOld: r.title_old,
      titleNew: r.title_new,
      status: String(r.status || "").trim(),
    }))
    .filter((u) => Number.isFinite(u.id) && u.id > 0 && String(u.titleNew || "").trim().length > 0);

  let fileText = fs.readFileSync(targetPath, "utf8");

  const applied = [];
  const failed = [];
  for (const u of updates) {
    const res = updateTitleById(fileText, u.id, u.titleNew);
    if (!res.ok) {
      failed.push({ ...u, reason: res.reason });
      continue;
    }
    fileText = res.updated;
    applied.push(u);
  }

  fs.writeFileSync(targetPath, fileText, "utf8");

  console.log(`Applied ${applied.length}/${updates.length} title updates to ${targetPath}`);
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) console.log(`- id=${f.id} reason=${f.reason}`);
  }
}

main();
