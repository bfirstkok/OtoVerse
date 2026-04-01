import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "anime_op_quiz_starter.jsx");
const outPath = path.join(root, "anime_works_320.txt");

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function extractBaseTitle(text) {
  const normalized = normalize(text);
  return normalized
    .replace(/\s*[\-:\/|]\s*(?:season|s|part|pt|vol|volume|cour|arc|chapter|final season|2nd|3rd|4th|5th|6th|7th).*/gi, "")
    .replace(/\s+(?:season|s|part|pt|vol|volume|cour|arc)\s*\d+.*/gi, "")
    .replace(/\s+final.*/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

function isSongEntryTitle(title) {
  const t = String(title || "");
  return /\(\s*(OP|ED)\b/i.test(t) || /\b(OP\d+|ED\d+)\b/i.test(t) || /\b(Insert)\b/i.test(t);
}

function parseJsStringLiteral(lit) {
  const s = String(lit ?? "").trim();
  if (!s) return "";
  if (s.startsWith('"')) {
    try {
      return JSON.parse(s);
    } catch {
      // fallthrough
    }
  }
  if (s.startsWith("'")) {
    // Minimal unescape for common sequences.
    const inner = s.slice(1, -1);
    return inner
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t");
  }
  return s;
}

const src = fs.readFileSync(sourcePath, "utf8");

// Grab titles inside the animeData array block to avoid matching unrelated "title" fields.
const startIdx = src.indexOf("const animeData = [");
if (startIdx < 0) {
  throw new Error("Cannot find 'const animeData = [' in anime_op_quiz_starter.jsx");
}
const afterStart = src.slice(startIdx);
const endIdx = afterStart.indexOf("];\n\n");
const dataBlock = endIdx > 0 ? afterStart.slice(0, endIdx + 2) : afterStart;

const titleMatches = [];
const titleRegex = /\btitle\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
let m;
while ((m = titleRegex.exec(dataBlock))) {
  titleMatches.push(parseJsStringLiteral(m[1]));
}

const allTitles = titleMatches.filter(Boolean);

const worksSource = allTitles.filter((t) => !isSongEntryTitle(t));

// Dedup works by base title (same as app logic): keep shorter display title.
const byBase = new Map();
for (const title of worksSource) {
  const base = extractBaseTitle(title);
  const prev = byBase.get(base);
  if (!prev) {
    byBase.set(base, { base, title, count: 1 });
  } else {
    prev.count += 1;
    if (title.length < prev.title.length) prev.title = title;
  }
}

const works = Array.from(byBase.values())
  .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

const lines = [];
lines.push(`# Anime works list (deduped)\n`);
lines.push(`# Generated: ${new Date().toISOString()}\n`);
lines.push(`# Source: anime_op_quiz_starter.jsx\n`);
lines.push(`# Count: ${works.length}\n`);
lines.push("\n");
works.forEach((w, i) => {
  lines.push(`${String(i + 1).padStart(3, "0")}  ${w.title}`);
});
lines.push("");

fs.writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(`Wrote ${works.length} works to ${outPath}`);
if (works.length !== 320) {
  console.warn(`WARNING: Expected 320, got ${works.length}. The dataset may have changed.`);
}
