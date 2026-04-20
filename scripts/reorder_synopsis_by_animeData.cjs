const fs = require("fs");
const path = require("path");

const root = process.cwd();
const animePath = path.join(root, "public", "animeData.json");
const synopsisPath = path.join(root, "public", "synopsis_th.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
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
  const out = [];
  if (a) out.push(a);
  if (b && b !== a) out.push(b);
  return out;
}

function normalizeAnimeTitle(title) {
  return String(title || "")
    .replace(/\s*\(\s*(?:op|ed|insert|ost)\s*\d*\s*\)\s*$/i, "")
    .trim();
}

function uniqueStrings(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr || []) {
    const s = String(v || "").trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function buildOldIndex(oldDb) {
  const items = oldDb && oldDb.items && typeof oldDb.items === "object" ? oldDb.items : {};
  const byKey = new Map();

  for (const [key, entry] of Object.entries(items)) {
    if (!entry || typeof entry !== "object") continue;

    const titles = uniqueStrings([
      entry.title,
      ...(Array.isArray(entry.aliases) ? entry.aliases : [])
    ]);

    const keys = uniqueStrings([
      key,
      ...titles.flatMap((t) => synopsisKeyVariants(t))
    ]);

    for (const k of keys) {
      if (!byKey.has(k)) byKey.set(k, entry);
    }
  }

  return byKey;
}

function findExistingEntry(anime, oldIndex) {
  const baseTitle = normalizeAnimeTitle(anime.title);
  const candidates = uniqueStrings([
    anime.title,
    baseTitle,
    ...(Array.isArray(anime.altTitles) ? anime.altTitles : [])
  ]);

  for (const title of candidates) {
    for (const k of synopsisKeyVariants(title)) {
      const found = oldIndex.get(k);
      if (found) return found;
    }
  }

  return null;
}

function main() {
  const animeData = readJson(animePath);
  const oldDb = readJson(synopsisPath);

  if (!Array.isArray(animeData)) {
    throw new Error("public/animeData.json is not an array");
  }

  const oldIndex = buildOldIndex(oldDb);
  const newItems = {};
  let matched = 0;
  let missing = 0;

  for (const anime of animeData) {
    const baseTitle = normalizeAnimeTitle(anime.title);
    const key = normalizeSynopsisKey(baseTitle);

    if (!key) continue;

    const existing = findExistingEntry(anime, oldIndex);
    const aliases = uniqueStrings(anime.altTitles || []);

    if (existing) {
      matched += 1;
      newItems[key] = {
        id: String(existing.id || anime.id || "").padStart(3, "0"),
        title: existing.title || baseTitle,
        ...(aliases.length || (existing.aliases && existing.aliases.length)
          ? { aliases: uniqueStrings([...(existing.aliases || []), ...aliases]) }
          : {}),
        text: String(existing.text || "").trim()
      };
    } else {
      missing += 1;
      newItems[key] = {
        id: String(anime.id || "").padStart(3, "0"),
        title: baseTitle,
        ...(aliases.length ? { aliases } : {}),
        text: ""
      };
    }
  }

  const newDb = {
    version: Number(oldDb.version || 0) + 1,
    generatedAt: new Date().toISOString(),
    count: Object.keys(newItems).length,
    items: newItems
  };

  writeJson(synopsisPath, newDb);

  console.log("Done.");
  console.log("animeData:", animeData.length);
  console.log("synopsis items:", newDb.count);
  console.log("matched existing:", matched);
  console.log("missing synopsis:", missing);
}

main();