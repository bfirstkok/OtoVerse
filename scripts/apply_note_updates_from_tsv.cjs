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

function updateNoteById(fileText, id, newNote) {
  const marker = `id: ${id},`;
  const markerPos = fileText.indexOf(marker);
  if (markerPos < 0) return { ok: false, reason: "id_not_found" };

  const objEnd = fileText.indexOf("},", markerPos);
  if (objEnd < 0) return { ok: false, reason: "object_end_not_found" };

  const segment = fileText.slice(markerPos, objEnd);
  const noteRe = /note:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;
  if (!noteRe.test(segment)) return { ok: false, reason: "note_not_found" };

  const updatedSegment = segment.replace(noteRe, `note: ${escapeJsString(newNote)}`);
  if (updatedSegment === segment) return { ok: false, reason: "no_change" };

  const updated = fileText.slice(0, markerPos) + updatedSegment + fileText.slice(objEnd);
  return { ok: true, updated };
}

function main() {
  const tsvPath = process.argv[2] || "mal_note_updates.tsv";
  const targetPath = process.argv[3] || "anime_op_quiz_starter.jsx";

  if (!fs.existsSync(tsvPath)) throw new Error(`Missing ${tsvPath}`);
  if (!fs.existsSync(targetPath)) throw new Error(`Missing ${targetPath}`);

  const rows = parseTsv(fs.readFileSync(tsvPath, "utf8"));
  const updates = rows
    .filter((r) => {
      const s = String(r.status).trim();
      return s === "ok" || s === "ok_other_section";
    })
    .map((r) => ({
      id: Number(r.id),
      title: r.title,
      noteNew: r.note_new,
    }))
    .filter((u) => Number.isFinite(u.id) && u.id > 0 && String(u.noteNew || "").length > 0);

  let fileText = fs.readFileSync(targetPath, "utf8");

  const applied = [];
  const failed = [];
  for (const u of updates) {
    const res = updateNoteById(fileText, u.id, u.noteNew);
    if (!res.ok) {
      failed.push({ ...u, reason: res.reason });
      continue;
    }
    fileText = res.updated;
    applied.push(u);
  }

  fs.writeFileSync(targetPath, fileText, "utf8");

  console.log(`Applied ${applied.length}/${updates.length} note updates to ${targetPath}`);
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) console.log(`- id=${f.id} title=${f.title} reason=${f.reason}`);
  }
}

main();
