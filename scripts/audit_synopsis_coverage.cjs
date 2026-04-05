/* eslint-disable no-console */

// Audit which WORK titles (derived from animeData) are missing in public/synopsis_th.json
// Usage: node scripts/audit_synopsis_coverage.cjs

const fs = require("fs");
const path = require("path");

function normalizeAvailabilityKey(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Keep ASCII punctuation (matches app logic for availability keys)
    .replace(/[^\u0000-\u007F\p{L}\p{N} ]/gu, "")
    .trim();
}

function availabilityBaseKeyFromTitle(title) {
  const s = normalizeAvailabilityKey(title);
  return s
    .replace(/\s*[\-:\/|]\s*(season|s|part|pt|vol|volume|cour|arc|chapter|final season).*$/i, "")
    .replace(/\s+(season|s|part|pt|vol|volume|cour|arc)\s*\d+.*$/i, "")
    .replace(/\s+the final season.*$/i, "")
    .replace(/\s+final.*$/i, "")
    .trim();
}

function stripOpEdSuffix(text) {
  return String(text || "").replace(/\s*\(\s*(OP|ED)\s*\d+\s*\)\s*$/i, "").trim();
}

function normalizeSynopsisKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}

function normalizeSynopsisKeySpaced(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function synopsisKeyVariants(title) {
  const a = normalizeSynopsisKey(title);
  const b = normalizeSynopsisKeySpaced(title);
  if (a && b && a !== b) return [a, b];
  return a ? [a] : b ? [b] : [];
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function parseAnimeDataTitles(sourceText) {
  const start = sourceText.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");

  // Find the matching closing bracket for the array.
  const openIdx = sourceText.indexOf("[", start);
  if (openIdx < 0) throw new Error("animeData '[' not found");

  let depth = 0;
  let endIdx = -1;
  for (let i = openIdx; i < sourceText.length; i++) {
    const ch = sourceText[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx < 0) throw new Error("animeData end not found");

  const chunk = sourceText.slice(openIdx, endIdx + 1);

  // Extract title fields from objects. We keep it simple and assume title is a double-quoted string.
  const re = /\btitle\s*:\s*"([^"]+)"/g;
  const titles = [];
  let m;
  while ((m = re.exec(chunk))) {
    titles.push(m[1]);
  }
  return titles;
}

function dedupePreserveOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const appPath = path.join(root, "anime_op_quiz_starter.jsx");
  const synopsisPath = path.join(root, "public", "synopsis_th.json");

  const src = fs.readFileSync(appPath, "utf8");
  const rawTitles = parseAnimeDataTitles(src);

  // Derive WORK titles: strip (OP/EDn), then collapse by base title.
  const baseToDisplay = new Map();
  for (const t of rawTitles) {
    const stripped = stripOpEdSuffix(t);
    const base = availabilityBaseKeyFromTitle(stripped) || normalizeAvailabilityKey(stripped);
    if (!base) continue;
    if (!baseToDisplay.has(base)) baseToDisplay.set(base, stripped);
  }

  const works = Array.from(baseToDisplay.values());
  const worksUnique = dedupePreserveOrder(works);

  const db = loadJson(synopsisPath);
  const items = db?.items && typeof db.items === "object" ? db.items : {};

  // Build byTitle index using the same variants as the app.
  const byTitle = {};
  for (const entry of Object.values(items)) {
    const primaryTitle = String(entry?.title || "").trim();
    const aliases = Array.isArray(entry?.aliases) ? entry.aliases : [];
    const candidateTitles = [primaryTitle, ...aliases]
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    if (!candidateTitles.length) continue;

    for (const t of candidateTitles) {
      for (const k of synopsisKeyVariants(t)) {
        if (k && !byTitle[k]) byTitle[k] = entry;
      }
    }
  }

  const missing = [];
  const present = [];

  for (const title of worksUnique) {
    const baseTitle = availabilityBaseKeyFromTitle(title) || title;
    const keysToTry = [...synopsisKeyVariants(title), ...synopsisKeyVariants(baseTitle)];
    let ok = false;
    for (const k of keysToTry) {
      if (items[k] || byTitle[k]) {
        ok = true;
        break;
      }
    }
    if (ok) present.push(title);
    else missing.push(title);
  }

  console.log("worksCount=", worksUnique.length);
  console.log("synopsisItems=", Object.keys(items).length);
  console.log("presentCount=", present.length);
  console.log("missingCount=", missing.length);

  const examples = missing.slice(0, 60);
  if (examples.length) {
    console.log("\nMissing examples (first " + examples.length + "):");
    for (const t of examples) console.log("- " + t);
  }

  // Write a TSV to make it easy to add new entries.
  const outTsv = [
    "title\tkey_suggest\tkey_suggest_spaced",
    ...missing.map((t) => {
      const k1 = normalizeSynopsisKey(t);
      const k2 = normalizeSynopsisKeySpaced(t);
      return `${t}\t${k1}\t${k2}`;
    })
  ].join("\n") + "\n";

  const outPath = path.join(root, "synopsis_missing_works.tsv");
  fs.writeFileSync(outPath, outTsv, "utf8");
  console.log("\nWrote:", outPath);
}

main();
