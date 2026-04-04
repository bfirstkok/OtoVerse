/* eslint-disable no-console */
const fs = require("fs");

function extractAnimeDataChunk(source) {
  const start = source.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");

  // Find the first closing array token after the start.
  const end = source.indexOf("];", start);
  if (end < 0) throw new Error("animeData end not found");

  return source.slice(start, end + 2);
}

function parseRows(chunk) {
  // Best-effort regex: grabs id/title/note within each object.
  const re = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^"]+)"[\s\S]*?\bnote\s*:\s*"([^"]+)"[\s\S]*?\}/g;
  const rows = [];
  let match;
  while ((match = re.exec(chunk))) {
    rows.push({
      id: Number(match[1]),
      title: String(match[2] || "").trim(),
      song: String(match[3] || "").trim()
    });
  }
  rows.sort((a, b) => a.id - b.id);
  return rows;
}

function toTsv(rows) {
  const lines = ["id\ttitle\tsong", ...rows.map((r) => `${r.id}\t${r.title}\t${r.song}`)];
  return lines.join("\n") + "\n";
}

function toReadableList(rows) {
  // One row per anime (keeps duplicates if any).
  const lines = rows.map((r) => `${r.title} — ${r.song}`);
  return lines.join("\n") + "\n";
}

function main() {
  const sourcePath = "anime_op_quiz_starter.jsx";
  const source = fs.readFileSync(sourcePath, "utf8");
  const chunk = extractAnimeDataChunk(source);
  const rows = parseRows(chunk);

  if (rows.length === 0) {
    throw new Error("No rows parsed. The file format may have changed.");
  }

  fs.writeFileSync("songs_with_titles.tsv", toTsv(rows), "utf8");
  fs.writeFileSync("songs_with_titles.txt", toReadableList(rows), "utf8");
  console.log(`Wrote ${rows.length} rows to songs_with_titles.tsv and songs_with_titles.txt`);
}

main();
