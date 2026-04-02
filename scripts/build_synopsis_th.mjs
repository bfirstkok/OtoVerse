import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function normalizeSynopsisKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}

function truncateSynopsis(text, maxLen = 320) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

async function main() {
  const repoRoot = process.cwd();
  const srcPath = path.join(repoRoot, "anime_synopsis_th_source.txt");
  const outPath = path.join(repoRoot, "public", "synopsis_th.json");

  const raw = await readFile(srcPath, "utf8");
  const lines = raw.split(/\r?\n/);

  const items = [];
  const rx = /^\s*(\d{3})\.\s*(.*?)\s*—\s*(.+)\s*$/u;

  for (const line of lines) {
    const m = line.match(rx);
    if (!m) continue;
    const id = m[1];
    const title = String(m[2] || "").trim();
    const text = truncateSynopsis(m[3] || "", 320);
    if (!title || !text) continue;
    items.push({ id, title, text });
  }

  const byKey = {};
  for (const it of items) {
    const key = normalizeSynopsisKey(it.title);
    if (!key) continue;
    byKey[key] = { id: it.id, title: it.title, text: it.text };
  }

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    count: Object.keys(byKey).length,
    items: byKey
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Wrote ${payload.count} synopses to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
