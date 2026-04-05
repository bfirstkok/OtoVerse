/* eslint-disable no-console */
const fs = require("fs");

function parseTsv(tsvText) {
  const lines = String(tsvText || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (!lines.length) return { header: [], rows: [] };
  const header = lines.shift().split("\t");
  const rows = lines.map((line) => {
    const cols = line.split("\t");
    const row = {};
    for (let i = 0; i < header.length; i += 1) row[header[i]] = cols[i] ?? "";
    return row;
  });
  return { header, rows };
}

function hasJapanese(s) {
  return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(String(s || ""));
}

function ensureSuffixFromKindIndex(titleOld, kind, index) {
  const t = String(titleOld || "").trim();
  if (/\s*\((OP|ED)\s*\d*\)\s*$/i.test(t)) return t;
  const idx = Number(index);
  const n = Number.isFinite(idx) && idx > 0 ? idx : 1;
  const suffix = String(kind).trim() === "ending" ? ` (ED${n})` : ` (OP${n})`;
  return t + suffix;
}

function main() {
  const inPath = process.argv[2] || "jikan_title_updates.tsv";
  const outPath = process.argv[3] || "jikan_title_overrides_no_japanese.tsv";

  if (!fs.existsSync(inPath)) throw new Error(`Missing ${inPath}`);
  const { header, rows } = parseTsv(fs.readFileSync(inPath, "utf8"));
  if (!header.includes("id") || !header.includes("title_old") || !header.includes("title_new")) {
    throw new Error("Unexpected TSV header; need id/title_old/title_new");
  }

  const overrides = [];
  for (const r of rows) {
    const id = Number(r.id);
    if (!Number.isFinite(id) || id <= 0) continue;

    const titleNew = String(r.title_new || "");
    if (hasJapanese(titleNew)) continue; // already JP

    // Only override the entries that were filled with non-JP fallback.
    if (!titleNew.trim()) continue;

    const fixed = ensureSuffixFromKindIndex(r.title_old, r.kind, r.index);

    overrides.push({
      id: String(id),
      title_old: r.title_old || "",
      title_new: fixed,
      kind: r.kind || "",
      index: r.index || "",
      mal_url: r.mal_url || "",
      status: "ok",
    });
  }

  const outHeader = ["id", "title_old", "title_new", "kind", "index", "mal_url", "status"];
  const lines = [outHeader.join("\t")].concat(
    overrides.map((r) => [r.id, r.title_old, r.title_new, r.kind, r.index, r.mal_url, r.status].join("\t"))
  );

  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
  console.log(`Wrote ${outPath} overrides=${overrides.length}`);
}

main();
