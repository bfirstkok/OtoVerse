/* eslint-disable no-console */
const fs = require("fs");
const cp = require("child_process");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

const DATASET_PATH = process.argv[2] || "anime_op_quiz_starter.jsx";
const OUT_PATH = process.argv[3] || "jikan_romaji_title_updates.tsv";

function curlGet(url) {
  return cp.execFileSync("curl.exe", ["-s", "-L", "-A", UA, url], {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
  });
}

function sleepMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return;
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, n);
}

function norm(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(and|und)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSetRatio(a, b) {
  const aT = new Set(norm(a).split(" ").filter(Boolean));
  const bT = new Set(norm(b).split(" ").filter(Boolean));
  if (aT.size === 0 || bT.size === 0) return 0;

  let inter = 0;
  for (const t of aT) if (bT.has(t)) inter += 1;
  const union = new Set([...aT, ...bT]).size;
  return union ? inter / union : 0;
}

function longestCommonSubstringLen(a, b) {
  const s1 = norm(a);
  const s2 = norm(b);
  if (!s1 || !s2) return 0;
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let best = 0;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > best) best = dp[i][j];
      }
    }
  }
  return best;
}

function stripSuffix(title) {
  return String(title || "").replace(/\s*\((OP|ED)\s*\d+\)\s*$/i, "").trim();
}

function parseOpEdHint(title) {
  const m = String(title || "").match(/\((OP|ED)\s*(\d+)\)\s*$/i);
  if (!m) return { kind: "opening", index: 1, hasExplicit: false };
  const kind = m[1].toLowerCase() === "ed" ? "ending" : "opening";
  const index = Number(m[2]);
  return { kind, index: Number.isFinite(index) && index > 0 ? index : 1, hasExplicit: true };
}

function ensureSuffix(kind, index) {
  const n = Number.isFinite(index) && index > 0 ? index : 1;
  return kind === "ending" ? ` (ED${n})` : ` (OP${n})`;
}

function isMeaningfulLatinQuery(q) {
  const n = norm(q);
  if (!n) return false;
  if (!/[a-z]/.test(n)) return false;
  if (n.replace(/\s+/g, "").length < 3) return false;
  return true;
}

function hasJapaneseScript(s) {
  return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(String(s || ""));
}

function isRomajiishTitle(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  if (hasJapaneseScript(t)) return false; // user requested no JP chars
  if (!/[A-Za-z]/.test(t)) return false;
  if (t.length < 2) return false;
  return true;
}

function parseAnimeDataObjects(text) {
  const start = text.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");
  const end = text.indexOf("];", start);
  if (end < 0) throw new Error("animeData end not found");

  const chunk = text.slice(start, end);
  const objRe = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\byear\s*:\s*(\d{4})[\s\S]*?\}/g;
  const rows = [];
  let m;
  while ((m = objRe.exec(chunk))) {
    const id = Number(m[1]);
    const title = String(m[2] || "").trim();
    const year = Number(m[3]);
    if (!Number.isFinite(id) || id <= 0) continue;
    rows.push({ id, title, year: Number.isFinite(year) ? year : null });
  }
  return rows;
}

function parseStringArrayById(text, key) {
  const re = new RegExp(
    `\\{[\\s\\S]{0,2500}?\\bid\\s*:\\s*(\\d+)[\\s\\S]{0,2500}?\\b${key}\\s*:\\s*(\\[[\\s\\S]*?\\])[\\s\\S]{0,2500}?\\}`,
    "g"
  );
  const map = new Map();
  let match;
  while ((match = re.exec(text))) {
    const id = Number(match[1]);
    const arrText = String(match[2] || "");
    if (!Number.isFinite(id) || id <= 0) continue;

    const out = [];
    const strRe = /"([^"]+)"/g;
    let m;
    while ((m = strRe.exec(arrText))) {
      const t = String(m[1] || "").trim();
      if (t) out.push(t);
    }
    map.set(id, out);
  }
  return map;
}

function parseJikanSearchResults(json) {
  const items = json && json.data && Array.isArray(json.data) ? json.data : [];
  return items
    .map((a) => {
      const id = Number(a.mal_id);
      const title = String(a.title || a.title_english || "").trim();
      const year =
        Number(a.year) ||
        Number(a.aired && a.aired.prop && a.aired.prop.from && a.aired.prop.from.year) ||
        null;
      const type = String(a.type || "").trim() || null;

      const titlesAll = [];
      const push = (v) => {
        const s = String(v || "").trim();
        if (s) titlesAll.push(s);
      };

      push(a.title);
      push(a.title_english);
      push(a.title_japanese);

      if (Array.isArray(a.title_synonyms)) for (const t of a.title_synonyms) push(t);

      if (Array.isArray(a.titles)) {
        for (const t of a.titles) push(t && t.title);
      }

      const aliases = Array.from(new Set(titlesAll));

      if (!Number.isFinite(id) || id <= 0 || title.length < 2) return null;
      return {
        id,
        url: `https://myanimelist.net/anime/${id}`,
        title,
        year: Number.isFinite(year) ? year : null,
        type,
        aliases,
      };
    })
    .filter(Boolean);
}

function resolvesByAliases(candidate, queryTitle) {
  const q = norm(queryTitle);
  if (!q) return false;
  const all = [candidate?.title].concat(candidate?.aliases || []).map(norm).filter(Boolean);
  return all.some((t) => t === q || t.includes(q) || q.includes(t));
}

function pickBestResult(queryTitle, results, { yearHint } = {}) {
  const qn = norm(queryTitle);
  if (!qn) return null;

  let best = null;
  let bestScore = -1;
  let secondScore = -1;

  for (const r of (results || []).slice(0, 15)) {
    const rn = norm(r.title);

    let score = 0;
    if (rn === qn) score += 120;
    if (rn.includes(qn) || qn.includes(rn)) score += 40;

    score += Math.round(tokenSetRatio(queryTitle, r.title) * 80);

    const lcs = longestCommonSubstringLen(queryTitle, r.title);
    if (lcs >= 7) score += 25;
    if (lcs >= 10) score += 15;

    if (resolvesByAliases(r, queryTitle)) score += 90;

    if (r.type && /special/i.test(r.type)) score -= 8;

    if (yearHint && Number.isFinite(r.year)) {
      if (r.year === yearHint) score += 30;
      else if (Math.abs(r.year - yearHint) === 1) score += 10;
      else if (Math.abs(r.year - yearHint) >= 3) score -= 20;
    }

    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      best = r;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  if (!best) return null;
  return { ...best, score: bestScore, secondScore };
}

function pickRomajiTitle(best, knownTitles) {
  const pool = [best.title].concat(best.aliases || []).filter(Boolean);
  const candidates = pool.filter(isRomajiishTitle);
  if (!candidates.length) return null;

  let bestCand = null;
  let bestScore = -1;

  for (const c of candidates) {
    let score = 0;
    for (const kt of knownTitles) {
      score += Math.round(tokenSetRatio(kt, c) * 80);
      const lcs = longestCommonSubstringLen(kt, c);
      if (lcs >= 7) score += 10;
      if (lcs >= 10) score += 10;
    }

    // Mild preference to shorter, cleaner titles.
    score -= Math.min(20, Math.max(0, c.length - 40) / 2);

    if (score > bestScore) {
      bestScore = score;
      bestCand = c;
    }
  }

  return bestCand;
}

function isCardfightVanguardTitle(baseTitle) {
  const n = norm(baseTitle);
  return n.includes("cardfight") && n.includes("vanguard");
}

function main() {
  if (!fs.existsSync(DATASET_PATH)) throw new Error(`Missing ${DATASET_PATH}`);
  const text = fs.readFileSync(DATASET_PATH, "utf8");

  const rows = parseAnimeDataObjects(text);
  const altTitlesById = parseStringArrayById(text, "altTitles");
  const acceptedById = parseStringArrayById(text, "acceptedAnswers");

  const jsonCache = new Map();
  function getJsonCached(url) {
    if (jsonCache.has(url)) return jsonCache.get(url);
    const json = JSON.parse(curlGet(url));
    jsonCache.set(url, json);
    sleepMs(450);
    return json;
  }

  const out = [];
  out.push(["id", "title_old", "title_new", "kind", "index", "mal_url", "status"].join("\t"));

  for (const r of rows) {
    const { kind, index } = parseOpEdHint(r.title);
    const baseTitle = stripSuffix(r.title);

    // Special instruction
    if (isCardfightVanguardTitle(baseTitle)) {
      const forced = `Cardfight Vanguard${ensureSuffix(kind, index)}`;
      out.push([r.id, r.title, forced, kind, index, "", "forced"].join("\t"));
      continue;
    }

    const yearHint = r.year || null;
    const altTitles = altTitlesById.get(r.id) || [];
    const accepted = acceptedById.get(r.id) || [];

    const candidates = [baseTitle]
      .concat(accepted)
      .concat(altTitles)
      .map((t) => String(t || "").trim())
      .filter(Boolean)
      .filter((t, idx, arr) => arr.indexOf(t) === idx)
      .filter(isMeaningfulLatinQuery);

    const usableQueries = candidates.slice(0, 2);

    let best = null;
    let bestScore = -1;

    for (const qq of usableQueries.length ? usableQueries : [baseTitle]) {
      const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(qq)}&limit=8`;
      let results = [];
      try {
        const json = getJsonCached(searchUrl);
        results = parseJikanSearchResults(json);
      } catch {
        results = [];
      }
      const picked = pickBestResult(qq, results, { yearHint });
      if (!picked) continue;
      if (picked.score > bestScore) {
        best = picked;
        bestScore = picked.score;
      }
    }

    if (!best) {
      const fallback = `${baseTitle}${ensureSuffix(kind, index)}`;
      out.push([r.id, r.title, fallback, kind, index, "", "search_no_result"].join("\t"));
      continue;
    }

    const known = [baseTitle].concat(altTitles).concat(accepted).filter(Boolean);
    const romaji = pickRomajiTitle(best, known) || best.title;

    const titleNewBase = isRomajiishTitle(romaji) ? romaji : baseTitle;
    const newTitle = `${stripSuffix(titleNewBase)}${ensureSuffix(kind, index)}`;

    // Guarantee: no JP script in title_new.
    const safeTitle = hasJapaneseScript(newTitle) ? `${baseTitle}${ensureSuffix(kind, index)}` : newTitle;

    const confident = (best.score || 0) >= 35;
    out.push([r.id, r.title, safeTitle, kind, index, best.url, confident ? "ok" : "low_confidence"].join("\t"));
  }

  fs.writeFileSync(OUT_PATH, out.join("\n") + "\n", "utf8");
  console.log(`Wrote ${OUT_PATH} (rows=${rows.length})`);
}

main();
