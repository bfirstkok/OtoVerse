/* eslint-disable no-console */
const fs = require("fs");
const cp = require("child_process");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

const DATASET_PATH = process.argv[2] || "anime_op_quiz_starter.jsx";
const OUT_PATH = process.argv[3] || "jikan_title_updates.tsv";

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

function isMeaningfulLatinQuery(q) {
  const n = norm(q);
  if (!n) return false;
  if (!/[a-z]/.test(n)) return false;
  if (n.replace(/\s+/g, "").length < 3) return false;
  return true;
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
  return String(title || "").replace(/\s*\((OP|ED)\s*\d*\)\s*$/i, "").trim();
}

function parseOpEdHint(title) {
  const m = String(title || "").match(/\((OP|ED)\s*(\d*)\)\s*$/i);
  if (!m) return { kind: "opening", index: 1, hasExplicit: false };
  const kind = m[1].toLowerCase() === "ed" ? "ending" : "opening";
  const index = m[2] ? Number(m[2]) : 1;
  return { kind, index: Number.isFinite(index) && index > 0 ? index : 1, hasExplicit: true };
}

function ensureSuffix(kind, index) {
  const n = Number.isFinite(index) && index > 0 ? index : 1;
  return kind === "ending" ? ` (ED${n})` : ` (OP${n})`;
}

function parseAnimeDataObjects(text) {
  const start = text.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");
  const end = text.indexOf("];", start);
  if (end < 0) throw new Error("animeData end not found");

  const chunk = text.slice(start, end);
  // Best-effort parse each object; bounded to avoid catastrophic backtracking.
  const objRe = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^"]+)"[\s\S]*?\byear\s*:\s*(\d{4})[\s\S]*?\}/g;
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

function parseAltTitlesByIdFromDataset(text) {
  const re = /\{[\s\S]{0,2500}?\bid\s*:\s*(\d+)[\s\S]{0,2500}?\baltTitles\s*:\s*(\[[\s\S]*?\])[\s\S]{0,2500}?\}/g;
  const map = new Map();
  let match;
  while ((match = re.exec(text))) {
    const id = Number(match[1]);
    const arrText = String(match[2] || "");
    if (!Number.isFinite(id) || id <= 0) continue;

    const titles = [];
    const strRe = /"([^"]+)"/g;
    let m;
    while ((m = strRe.exec(arrText))) {
      const t = String(m[1] || "").trim();
      if (t) titles.push(t);
    }
    map.set(id, titles);
  }
  return map;
}

function parseAcceptedAnswersByIdFromDataset(text) {
  const re = /\{[\s\S]{0,2500}?\bid\s*:\s*(\d+)[\s\S]{0,2500}?\bacceptedAnswers\s*:\s*(\[[\s\S]*?\])[\s\S]{0,2500}?\}/g;
  const map = new Map();
  let match;
  while ((match = re.exec(text))) {
    const id = Number(match[1]);
    const arrText = String(match[2] || "");
    if (!Number.isFinite(id) || id <= 0) continue;

    const answers = [];
    const strRe = /"([^"]+)"/g;
    let m;
    while ((m = strRe.exec(arrText))) {
      const t = String(m[1] || "").trim();
      if (t) answers.push(t);
    }
    map.set(id, answers);
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

      const aliases = [];
      if (a.title_english) aliases.push(String(a.title_english).trim());
      if (a.title_japanese) aliases.push(String(a.title_japanese).trim());
      if (Array.isArray(a.titles)) {
        for (const t of a.titles) {
          const tt = String(t && t.title ? t.title : "").trim();
          if (tt) aliases.push(tt);
        }
      }

      const titleJapanese = String(a.title_japanese || "").trim() || null;

      if (!Number.isFinite(id) || id <= 0 || title.length < 2) return null;
      return {
        id,
        url: `https://myanimelist.net/anime/${id}`,
        title,
        titleJapanese,
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

    // Light preference for main entries (TV/Movie/OVA) over Specials.
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

function main() {
  if (!fs.existsSync(DATASET_PATH)) throw new Error(`Missing ${DATASET_PATH}`);
  const text = fs.readFileSync(DATASET_PATH, "utf8");

  const rows = parseAnimeDataObjects(text);
  const altTitlesById = parseAltTitlesByIdFromDataset(text);
  const acceptedById = parseAcceptedAnswersByIdFromDataset(text);

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

    const yearHint = r.year || null;
    const altTitles = altTitlesById.get(r.id) || [];
    const accepted = acceptedById.get(r.id) || [];

    // For whole-dataset runs, keep requests low: baseTitle + best Latin accepted/alt.
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
      out.push([r.id, r.title, "", kind, index, "", "search_no_result"].join("\t"));
      continue;
    }

    const bestScoreFinal = best.score || 0;
    const secondScore = best.secondScore ?? -1;
    const margin = bestScoreFinal - secondScore;
    const confident = bestScoreFinal >= 45 || (bestScoreFinal >= 30 && margin >= 10) || (yearHint && bestScoreFinal >= 35);

    const jp = best.titleJapanese || null;

    if (!jp) {
      // User requirement: if no Japanese title, leave the original title as-is
      // (but still ensure OP/ED suffix exists).
      const fallbackTitle = `${baseTitle}${ensureSuffix(kind, index)}`;
      out.push([r.id, r.title, fallbackTitle, kind, index, best.url, "no_japanese_title"].join("\t"));
      continue;
    }

    const newTitle = `${jp}${ensureSuffix(kind, index)}`;
    out.push([r.id, r.title, newTitle, kind, index, best.url, confident ? "ok" : "low_confidence"].join("\t"));
  }

  fs.writeFileSync(OUT_PATH, out.join("\n") + "\n", "utf8");
  console.log(`Wrote ${OUT_PATH} (rows=${rows.length})`);
}

main();
