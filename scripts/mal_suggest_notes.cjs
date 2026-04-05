/* eslint-disable no-console */
const fs = require("fs");
const cp = require("child_process");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

const DATASET_PATH = "anime_op_quiz_starter.jsx";

function sleepMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return;
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, n);
}

function looksLikeMalBlocked(html) {
  const s = String(html || "").toLowerCase();
  if (!s) return false;
  return (
    s.includes("human verification") ||
    s.includes("captcha") ||
    s.includes("please verify") ||
    s.includes("unusual traffic") ||
    s.includes("cloudflare") ||
    s.includes("incapsula")
  );
}

function parseJikanSearchResults(json) {
  const items = json && json.data && Array.isArray(json.data) ? json.data : [];
  return items
    .map((a) => {
      const id = Number(a.mal_id);
      // Prefer MAL's default title (often romaji) for matching against dataset titles.
      const title = String(a.title || a.title_english || "").trim();
      const year =
        Number(a.year) ||
        Number(a.aired && a.aired.prop && a.aired.prop.from && a.aired.prop.from.year) ||
        null;
      const aliases = [];
      if (a.title_english) aliases.push(String(a.title_english).trim());
      if (Array.isArray(a.titles)) {
        for (const t of a.titles) {
          const tt = String(t && t.title ? t.title : "").trim();
          if (tt) aliases.push(tt);
        }
      }
      if (!Number.isFinite(id) || id <= 0 || title.length < 2) return null;
      return {
        url: `https://myanimelist.net/anime/${id}`,
        id,
        title,
        year: Number.isFinite(year) ? year : null,
        aliases,
      };
    })
    .filter(Boolean);
}

function resolvesByAliases(candidate, baseTitle) {
  const q = norm(baseTitle);
  if (!q) return false;
  const all = [candidate?.title].concat(candidate?.aliases || []).map(norm).filter(Boolean);
  return all.some((t) => t === q || t.includes(q) || q.includes(t));
}

function tryResolveByAliasValidation(baseTitle, yearHint, candidates) {
  const q = norm(baseTitle);
  if (!q) return null;
  const scored = (candidates || [])
    .slice(0, 15)
    .map((c) => {
      const yearDelta = yearHint && c.year ? Math.abs(c.year - yearHint) : 999;
      const sim = tokenSetRatio(baseTitle, c.title);
      const aliasHit = resolvesByAliases(c, baseTitle) ? 1 : 0;
      return { ...c, __yearDelta: yearDelta, __sim: sim, __aliasHit: aliasHit };
    })
    .sort((a, b) => {
      if (b.__aliasHit !== a.__aliasHit) return b.__aliasHit - a.__aliasHit;
      if (a.__yearDelta !== b.__yearDelta) return a.__yearDelta - b.__yearDelta;
      return b.__sim - a.__sim;
    });

  const best = scored[0];
  if (!best) return null;
  if (!resolvesByAliases(best, baseTitle)) return null;
  return best;
}

function parseThemeStringToTitle(themeStr) {
  const s = String(themeStr || "").trim().replace(/^\s*\d+\s*:\s*/, "");
  const quoted = s.match(/\"([^\"]+)\"/);
  if (quoted?.[1]) return quoted[1].trim();
  const byIdx = s.toLowerCase().indexOf(" by ");
  const head = (byIdx >= 0 ? s.slice(0, byIdx) : s).trim();
  return head.replace(/^"|"$/g, "").trim();
}

function pickThemeTitleFromJikan(themesJson, kind, desiredIndex) {
  const data = themesJson && themesJson.data ? themesJson.data : null;
  const arr =
    kind === "ending"
      ? Array.isArray(data?.endings)
        ? data.endings
        : []
      : Array.isArray(data?.openings)
        ? data.openings
        : [];
  if (!arr.length) return null;
  const idx = Number.isFinite(desiredIndex) && desiredIndex > 0 ? desiredIndex : 1;
  const picked = arr[idx - 1] || arr[0];
  const title = parseThemeStringToTitle(picked);
  return title || null;
}

function curlGet(url) {
  return cp.execFileSync(
    "curl.exe",
    ["-s", "-L", "-A", UA, url],
    { encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
  );
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
  const hasLetters = /[a-z]/.test(n);
  // If it normalizes to only digits (or no letters), it's too ambiguous.
  if (!hasLetters) return false;
  // Avoid extremely short queries like single letters.
  if (n.replace(/\s+/g, "").length < 3) return false;
  return true;
}

function stripSuffix(title) {
  // Remove suffix like " (OP2)", " (ED1)", " (ED)", etc.
  return String(title || "").replace(/\s*\((OP|ED)\s*\d*\)\s*$/i, "").trim();
}

function parseYearByIdFromDataset() {
  if (!fs.existsSync(DATASET_PATH)) return new Map();
  const text = fs.readFileSync(DATASET_PATH, "utf8");

  // Best-effort: find `id: N,` and the nearest `year: YYYY,` within the same object.
  // Keep it permissive but bounded so it doesn't drift across objects.
  const re = /\{[\s\S]{0,2000}?\bid\s*:\s*(\d+)[\s\S]{0,2000}?\byear\s*:\s*(\d{4})\b[\s\S]{0,2000}?\}/g;
  const map = new Map();
  let match;
  while ((match = re.exec(text))) {
    const id = Number(match[1]);
    const year = Number(match[2]);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (!Number.isFinite(year) || year < 1900 || year > 2100) continue;
    if (!map.has(id)) map.set(id, year);
  }
  return map;
}

function parseAltTitlesByIdFromDataset() {
  if (!fs.existsSync(DATASET_PATH)) return new Map();
  const text = fs.readFileSync(DATASET_PATH, "utf8");

  // Capture the altTitles array within the same object as the id.
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
    if (titles.length) map.set(id, titles);
  }
  return map;
}

function escapeRegExp(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractInfoField(html, fieldLabel) {
  const re = new RegExp(
    `<span\\s+class=\\"dark_text\\">${escapeRegExp(fieldLabel)}:<\\/span>\\s*([^<\\r\\n]+)`,
    "i"
  );
  const m = String(html || "").match(re);
  return m ? String(m[1]).replace(/\s+/g, " ").trim() : "";
}

function malPageValidatesTitle(animeHtml, baseTitle) {
  const q = norm(baseTitle);
  if (!q) return false;

  const english = extractInfoField(animeHtml, "English");
  const synonyms = extractInfoField(animeHtml, "Synonyms");

  const enN = norm(english);
  const synN = norm(synonyms);

  if (enN && (enN === q || enN.includes(q) || q.includes(enN))) return true;
  if (synN && (synN.includes(q) || q.includes(synN))) return true;

  // Fallback: raw HTML contains the base title near the English label.
  const nearEnglishRe = new RegExp(
    `dark_text\\\">English:<\\/span>[\\s\\S]{0,200}?${escapeRegExp(baseTitle)}`,
    "i"
  );
  return nearEnglishRe.test(String(animeHtml || ""));
}

function tryResolveByValidatingCandidates(baseTitle, yearHint, candidates) {
  // candidates: array of {url, title, year}
  // Sort: year closest first, then by existing title similarity.
  const scored = candidates
    .slice(0, 8)
    .map((c) => {
      const yearDelta = yearHint && c.year ? Math.abs(c.year - yearHint) : 999;
      const sim = tokenSetRatio(baseTitle, c.title);
      return { ...c, __yearDelta: yearDelta, __sim: sim };
    })
    .sort((a, b) => {
      if (a.__yearDelta !== b.__yearDelta) return a.__yearDelta - b.__yearDelta;
      return b.__sim - a.__sim;
    });

  for (const c of scored) {
    try {
      const html = curlGet(c.url);
      if (malPageValidatesTitle(html, baseTitle)) {
        return { resolved: c, html };
      }
    } catch {
      // ignore and try next
    }
  }
  return null;
}

function parseSeasonHint(title) {
  const t = String(title || "");
  const mSeason = t.match(/\bSeason\s*(\d+)\b/i);
  if (mSeason) return { kind: "season", n: Number(mSeason[1]) };

  const mPart = t.match(/\bPart\s*(\d+)\b/i);
  if (mPart) return { kind: "part", n: Number(mPart[1]) };

  const mRoman = t.match(/\b(II|III|IV|V|VI|VII|VIII|IX|X)\b/);
  if (mRoman) {
    const romanMap = { II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
    return { kind: "roman", n: romanMap[mRoman[1]] };
  }

  const mNumericSuffix = t.match(/\b(\d+)\b/);
  if (mNumericSuffix) {
    const n = Number(mNumericSuffix[1]);
    if (Number.isFinite(n) && n >= 2 && n <= 10) return { kind: "number", n };
  }

  return null;
}

function normalizeTokens(str) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "of",
    "and",
    "to",
    "in",
    "on",
    "no",
    "season",
    "part",
    "movie",
    "film",
    "tv"
  ]);
  const tokens = norm(str)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !stop.has(t));
  return tokens;
}

function tokenSetRatio(a, b) {
  const aTokens = new Set(normalizeTokens(a));
  const bTokens = new Set(normalizeTokens(b));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let inter = 0;
  for (const t of aTokens) if (bTokens.has(t)) inter += 1;
  const union = aTokens.size + bTokens.size - inter;
  return union > 0 ? inter / union : 0;
}

function longestCommonSubstringLen(a, b) {
  const s1 = norm(a).replace(/\s+/g, "");
  const s2 = norm(b).replace(/\s+/g, "");
  if (!s1 || !s2) return 0;
  const m = s1.length;
  const n = s2.length;

  // O(m*n) DP, but strings here are short.
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

function parseOpEdHint(title) {
  const m = String(title || "").match(/\((OP|ED)\s*(\d*)\)\s*$/i);
  if (!m) return { kind: "opening", index: 1 };
  const kind = m[1].toLowerCase() === "ed" ? "ending" : "opening";
  const index = m[2] ? Number(m[2]) : 1;
  return { kind, index: Number.isFinite(index) && index > 0 ? index : 1 };
}

function parseSearchResults(html) {
  const results = [];

  // Preferred: MAL search result blocks include data-l-content-id and an <img alt="TITLE">.
  // This avoids brittle parsing of nested <strong> tags and broken-newline URLs.
  const blockRe = /data-l-content-id="(\d+)"[\s\S]{0,400}?data-l-content-type="anime"[\s\S]{0,2500}?<img[^>]*\salt="([^"]{1,200})"/g;
  let match;
  while ((match = blockRe.exec(html))) {
    const id = Number(match[1]);
    const title = String(match[2] || "").replace(/\s+/g, " ").trim();
    if (!Number.isFinite(id) || id <= 0) continue;
    if (title.length < 2) continue;

    // Try to find the year from nearby info like: TV (2011)
    const snippet = html.slice(match.index, match.index + 4000);
    const yearMatch = snippet.match(/\((\d{4})\)/);
    const year = yearMatch ? Number(yearMatch[1]) : null;

    results.push({ url: `https://myanimelist.net/anime/${id}`, id, title, year: Number.isFinite(year) ? year : null });
  }

  // Fallback: anchors that directly display an anime title (works for some layouts).
  if (results.length === 0) {
    const re = /<a[^>]*href="(https:\/\/myanimelist\.net\/anime\/(\d+)\/[^\"]+)"[^>]*>([^<]{1,200}?)<\/a>/g;
    while ((match = re.exec(html))) {
      const title = String(match[3] || "").replace(/\s+/g, " ").trim();
      if (title.length < 2) continue;
      if (!/[A-Za-z0-9]/.test(title)) continue;
      if (/^(More|Top|Login|Sign Up|Home|Anime|Manga|Community|Help)$/i.test(title)) continue;
      results.push({ url: match[1], id: Number(match[2]), title });
    }
  }

  // De-dupe by id.
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

function pickBestResult(queryTitle, results, opts = {}) {
  const qn = norm(queryTitle);
  if (!qn) return null;

  const seasonHint = parseSeasonHint(queryTitle);
  const yearHint = Number.isFinite(opts.yearHint) ? opts.yearHint : null;

  let best = null;
  let bestScore = -1;
  let secondScore = -1;
  for (const r of results.slice(0, 15)) {
    const rn = norm(r.title);

    let score = 0;

    if (rn === qn) score += 120;
    if (rn.includes(qn) || qn.includes(rn)) score += 40;

    const tsr = tokenSetRatio(queryTitle, r.title);
    score += Math.round(tsr * 80);

    const lcs = longestCommonSubstringLen(queryTitle, r.title);
    if (lcs >= 7) score += 25;
    if (lcs >= 10) score += 15;

    // If Jikan says this anime has an English/Synonym title matching the query,
    // strongly prefer it (avoids accidental matches on generic words like "hero").
    if (resolvesByAliases(r, queryTitle)) score += 90;

    if (yearHint && Number.isFinite(r.year)) {
      if (r.year === yearHint) score += 30;
      else if (Math.abs(r.year - yearHint) === 1) score += 10;
      else if (Math.abs(r.year - yearHint) >= 3) score -= 20;
    }

    // Penalize Part-specific entries when query doesn't request a Part.
    // This helps series like "... das Finale" prefer Part 1 by default.
    const qHasPart = /\bpart\b/i.test(String(queryTitle || ""));
    const rTitleStr = String(r.title || "");
    const partMatch = rTitleStr.match(/\bpart\s*(\d+)\b/i);
    if (!qHasPart && partMatch) {
      const partNum = Number(partMatch[1]);
      score -= 20; // base penalty for any Part entry
      if (Number.isFinite(partNum) && partNum > 1) score -= 12 * (partNum - 1);
    }

    if (seasonHint && Number.isFinite(seasonHint.n) && seasonHint.n > 1) {
      const cand = String(r.title || "");
      const n = seasonHint.n;
      const roman = { 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X" }[n];
      const seasonMatches =
        new RegExp(`\\bSeason\\s*${n}\\b`, "i").test(cand) ||
        new RegExp(`\\b${n}(?:nd|rd|th)?\\s+Season\\b`, "i").test(cand) ||
        (roman ? new RegExp(`\\b${roman}\\b`).test(cand) : false) ||
        new RegExp(`\\b${n}\\b`).test(cand);
      if (seasonMatches) score += 18;
    }

    // Keep ordering stable; track 2nd best for confidence.
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

function extractThemeSection(html, kind) {
  const header = kind === "ending" ? "Ending Theme" : "Opening Theme";
  const startIdx = html.indexOf(`<h2>${header}</h2>`);
  if (startIdx < 0) return "";

  // End at the next <h2> after start.
  const nextIdx = html.indexOf("<h2>", startIdx + 1);
  return html.slice(startIdx, nextIdx > startIdx ? nextIdx : html.length);
}

function parseThemeSongs(sectionHtml) {
  function decodeBasicEntities(s) {
    return String(s || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseEpisodeRange(text) {
    const m = String(text || "").match(/eps?\s+(\d+)(?:\s*-\s*(\d+))?/i);
    if (!m) return null;
    const start = Number(m[1]);
    const end = Number(m[2] || m[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  }

  // Extract rows from the theme table; MAL has multiple HTML variants.
  // We parse each <td width="84%">...</td> entry.
  const tdRe = /<td\s+width="84%">([\s\S]*?)<\/td>/g;
  const songs = [];
  let match;
  let autoIndex = 1;
  while ((match = tdRe.exec(sectionHtml))) {
    const itemHtml = String(match[1] || "");

    const idxMatch = itemHtml.match(/theme-song-index">\s*(\d+)\s*:<\/span>/);
    const malIndex = idxMatch ? Number(idxMatch[1]) : autoIndex;

    // Variant 1: <span class="theme-song-title">"TITLE"</span>
    let title = "";
    const titleMatch = itemHtml.match(/theme-song-title">\s*(?:&quot;|")([^&\"]+?)(?:&quot;|")\s*<\/span>/);
    if (titleMatch?.[1]) {
      title = decodeBasicEntities(titleMatch[1]);
    }

    // Variant 2: plain text title before artist span (covers multiple HTML variants).
    if (!title) {
      const split = itemHtml.split(/<span\s+class="theme-song-artist">/);
      const beforeArtist = split[0] || "";

      // Remove tags (including <a>, <span>, etc.) then decode entities.
      const text = decodeBasicEntities(beforeArtist.replace(/<[^>]+>/g, " "));
      const cleaned = text
        .replace(/^\s*\d+\s*:\s*/g, "")
        .replace(/^"|"$/g, "")
        .trim();

      if (cleaned) title = cleaned;
    }

    // Episode range if present.
    const epMatch = itemHtml.match(/theme-song-episode">\s*\(([^)]+)\)\s*<\/span>/);
    const ep = parseEpisodeRange(epMatch?.[1] || "");

    if (Number.isFinite(malIndex) && malIndex > 0 && title) {
      songs.push({ malIndex, title, epStart: ep?.start ?? null, epEnd: ep?.end ?? null });
      autoIndex = Math.max(autoIndex, malIndex + 1);
    } else {
      autoIndex += 1;
    }
  }

  // De-dupe by (malIndex,title).
  const seen = new Set();
  return songs
    .filter((s) => {
      const key = `${s.malIndex}|${s.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.malIndex - b.malIndex);
}

function pickThemeByLogicalIndex(songs, desiredIndex) {
  if (!songs || songs.length === 0) return null;

  const hasEpisodeInfo = songs.some((s) => Number.isFinite(s.epStart) && Number.isFinite(s.epEnd));
  const multiRangeExists = songs.some(
    (s) => Number.isFinite(s.epStart) && Number.isFinite(s.epEnd) && s.epEnd > s.epStart
  );

  let candidates = [...songs];
  if (multiRangeExists) {
    candidates = candidates.filter(
      (s) => !(Number.isFinite(s.epStart) && Number.isFinite(s.epEnd) && s.epStart === s.epEnd)
    );
    if (candidates.length === 0) candidates = [...songs];
  }

  if (hasEpisodeInfo) {
    candidates.sort((a, b) => {
      const aStart = Number.isFinite(a.epStart) ? a.epStart : Number.POSITIVE_INFINITY;
      const bStart = Number.isFinite(b.epStart) ? b.epStart : Number.POSITIVE_INFINITY;
      if (aStart !== bStart) return aStart - bStart;
      return a.malIndex - b.malIndex;
    });
  } else {
    candidates.sort((a, b) => a.malIndex - b.malIndex);
  }

  const idx = Number.isFinite(desiredIndex) && desiredIndex > 0 ? desiredIndex : 1;
  return candidates[idx - 1] || candidates[0] || null;
}

function main() {
  const debugId = process.env.DEBUG_ID ? Number(process.env.DEBUG_ID) : null;
  const requestedPath = "anime_data_requested_placeholders.tsv";
  if (!fs.existsSync(requestedPath)) {
    throw new Error(`Missing ${requestedPath}. Run scripts/audit_anime_data.cjs first.`);
  }

  const yearById = parseYearByIdFromDataset();
  const altTitlesById = parseAltTitlesByIdFromDataset();

  const lines = fs.readFileSync(requestedPath, "utf8").split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header || !header.startsWith("id\t")) throw new Error("Unexpected TSV header");

  // Unique by id.
  const rows = [];
  const seen = new Set();
  for (const line of lines) {
    const [idStr, title, note, flags] = line.split("\t");
    const id = Number(idStr);
    if (!Number.isFinite(id) || !title) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push({ id, title, note: note || "", flags: flags || "" });
  }

  const out = [];
  out.push(["id", "title", "note_old", "note_new", "kind", "index", "mal_url", "status"].join("\t"));

  const jsonCache = new Map();
  function getJsonCached(url) {
    if (jsonCache.has(url)) return jsonCache.get(url);
    const text = curlGet(url);
    const json = JSON.parse(text);
    jsonCache.set(url, json);
    // Jikan rate limit is strict; keep a modest delay.
    sleepMs(450);
    return json;
  }

  for (const r of rows) {
    const baseTitle = stripSuffix(r.title);
    const { kind, index } = parseOpEdHint(r.title);
    const q = encodeURIComponent(baseTitle);

    const yearHint = yearById.get(r.id) || null;
    const altTitles = altTitlesById.get(r.id) || [];

    let malUrl = "";
    let noteNew = "";
    let status = "";

    try {
      const queries = [baseTitle]
        .concat(altTitles)
        .map((t) => String(t || "").trim())
        .filter(Boolean)
        .filter((t, idx, arr) => arr.indexOf(t) === idx);

      let best = null;
      let bestFromQuery = baseTitle;
      let baseResults = [];

      for (const qq of queries.filter(isMeaningfulLatinQuery).slice(0, 5)) {
        const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(qq)}&limit=10`;
        const searchJson = getJsonCached(searchUrl);
        const results = parseJikanSearchResults(searchJson);
        if (qq === baseTitle) baseResults = results;
        if (Number.isFinite(debugId) && r.id === debugId) {
          console.log("\nDEBUG", { id: r.id, query: qq, yearHint });
          console.log(
            results
              .slice(0, 8)
              .map((x) => ({ id: x.id, title: x.title, year: x.year }))
          );
        }
        const picked = pickBestResult(qq, results, { yearHint });
        if (Number.isFinite(debugId) && r.id === debugId && picked) {
          console.log("DEBUG picked", { pickedId: picked.id, pickedTitle: picked.title, pickedYear: picked.year, score: picked.score, secondScore: picked.secondScore });
        }
        if (!picked) continue;
        if (!best || (picked.score || 0) > (best.score || 0)) {
          best = picked;
          bestFromQuery = qq;
        }
      }

      if (!best) {
        status = "search_no_result";
        out.push([r.id, r.title, r.note, noteNew, kind, index, malUrl, status].join("\t"));
        continue;
      }

      // Use margin vs 2nd best for confidence.
      const bestScore = best.score || 0;
      const secondScore = best.secondScore ?? -1;
      const margin = bestScore - secondScore;
      const confident = bestScore >= 45 || (bestScore >= 30 && margin >= 10) || (yearHint && bestScore >= 35);
      malUrl = best.url;

      if (!confident) {
        const validated = tryResolveByAliasValidation(baseTitle, yearHint, baseResults);
        if (!validated) {
          status = "search_low_confidence";
          out.push([r.id, r.title, r.note, noteNew, kind, index, malUrl, status].join("\t"));
          continue;
        }
        best = { ...best, id: validated.id, url: validated.url, title: validated.title, year: validated.year, aliases: validated.aliases };
        malUrl = validated.url;
      }

      const themesUrl = `https://api.jikan.moe/v4/anime/${best.id}/themes`;
      const themesJson = getJsonCached(themesUrl);
      let pickedTitle = pickThemeTitleFromJikan(themesJson, kind, index);
      let pickedStatus = "ok";
      if (!pickedTitle) {
        const otherKind = kind === "ending" ? "opening" : "ending";
        const otherTitle = pickThemeTitleFromJikan(themesJson, otherKind, index);
        if (otherTitle) {
          pickedTitle = otherTitle;
          pickedStatus = "ok_other_section";
        }
      }

      if (!pickedTitle) {
        status = "no_theme_songs";
        out.push([r.id, r.title, r.note, noteNew, kind, index, malUrl, status].join("\t"));
        continue;
      }

      noteNew = pickedTitle;
      status = pickedStatus;
      out.push([r.id, r.title, r.note, noteNew, kind, index, malUrl, status].join("\t"));
    } catch (e) {
      status = `error:${String(e.message || e).slice(0, 120)}`;
      out.push([r.id, r.title, r.note, noteNew, kind, index, malUrl, status].join("\t"));
    }
  }

  fs.writeFileSync("mal_note_updates.tsv", out.join("\n") + "\n", "utf8");
  console.log(`Wrote mal_note_updates.tsv (rows=${rows.length})`);
}

main();
