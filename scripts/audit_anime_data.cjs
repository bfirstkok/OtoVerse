/* eslint-disable no-console */
const fs = require("fs");

function extractAnimeDataChunk(source) {
  const start = source.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");

  // Grab through the first closing bracket sequence for the array.
  const end = source.indexOf("];", start);
  if (end < 0) throw new Error("animeData end not found");

  return source.slice(start, end + 2);
}

function parseRows(chunk) {
  // Best-effort regex: captures id/title/note per object.
  const re = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^"]+)"[\s\S]*?\bnote\s*:\s*"([^"]+)"[\s\S]*?\}/g;
  const rows = [];
  let match;
  while ((match = re.exec(chunk))) {
    rows.push({
      id: Number(match[1]),
      title: String(match[2] || "").trim(),
      note: String(match[3] || "").trim()
    });
  }
  rows.sort((a, b) => a.id - b.id);
  return rows;
}

function norm(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesCI(haystack, needle) {
  return norm(haystack).includes(norm(needle));
}

function findTitles(rows, query) {
  return rows.filter((r) => includesCI(r.title, query));
}

function isLikelyPlaceholder(note) {
  const n = String(note || "").trim();
  if (!n) return true;

  // Very short tokens that look like structural placeholders.
  if (/^(op|ed)\s*\d+$/i.test(n)) return true;
  if (/^(insert)\s*\d+$/i.test(n)) return true;

  // Thai explanatory text often indicates placeholder.
  if (/[\u0E00-\u0E7F]/.test(n) && n.length > 8) return true;

  // If it contains "OP"/"ED" keywords with no other words, likely placeholder.
  const compact = n.replace(/[^a-z0-9]/gi, "");
  if (/^(op|ed)\d+$/i.test(compact)) return true;

  // Common placeholder-ish phrases.
  if (/\b(op|ed|insert)\b/i.test(n) && n.length <= 10) return true;

  return false;
}

function isExplicitEdOrInsert(title, note) {
  const t = String(title || "");
  const n = String(note || "");
  return /(\(\s*ed\b|\bed\b\s*\d+|\(\s*insert\b|\binsert\b)/i.test(t) || /(\bed\b\s*\d+|\binsert\b)/i.test(n);
}

function toTsv(rows) {
  const header = "id\ttitle\tnote\tflags";
  const lines = [header];
  for (const r of rows) {
    const flags = [];
    if (isLikelyPlaceholder(r.note)) flags.push("placeholder");
    if (isExplicitEdOrInsert(r.title, r.note)) flags.push("ed_or_insert");
    lines.push(`${r.id}\t${r.title}\t${r.note}\t${flags.join(",")}`);
  }
  return lines.join("\n") + "\n";
}

function main() {
  const sourcePath = "anime_op_quiz_starter.jsx";
  const source = fs.readFileSync(sourcePath, "utf8");
  const chunk = extractAnimeDataChunk(source);
  const rows = parseRows(chunk);
  if (rows.length === 0) throw new Error("No rows parsed (format changed?)");

  // 1) User-requested franchise gaps (summary of what exists today).
  const franchises = [
    {
      label: "Overlord",
      query: "Overlord",
      suggested: ["Overlord IV"]
    },
    {
      label: "Attack on Titan",
      query: "Attack on Titan",
      suggested: [
        "Attack on Titan The Final Season Part 3",
        "Attack on Titan The Final Season Part 4 / The Final Chapters"
      ]
    },
    {
      label: "Tokyo Ghoul",
      query: "Tokyo Ghoul",
      suggested: ["Tokyo Ghoul:re Season 2 (Tokyo Ghoul:re 2nd Season)"]
    },
    {
      label: "Sword Art Online",
      query: "Sword Art Online",
      suggested: ["Sword Art Online: Alicization – War of Underworld"]
    },
    {
      label: "Black Butler",
      query: "Black Butler",
      suggested: ["Black Butler II", "Black Butler: Book of Circus", "Black Butler: Public School Arc"]
    },
    {
      label: "Noragami",
      query: "Noragami",
      suggested: ["(Optional) Keep Noragami Aragoto grouped with Noragami"]
    },
    {
      label: "Blue Exorcist",
      query: "Blue Exorcist",
      suggested: ["Blue Exorcist: Kyoto Saga", "Blue Exorcist: Shimane Illuminati Saga"]
    },
    {
      label: "Mushoku Tensei",
      query: "Mushoku Tensei",
      suggested: ["(Naming consistency) Mushoku Tensei Season 1 label"]
    },
    {
      label: "Spy x Family",
      query: "Spy x Family",
      suggested: ["(Naming consistency) Spy x Family Season 1 label"]
    },
    {
      label: "Oshi no Ko",
      query: "Oshi no Ko",
      suggested: ["(Naming consistency) Oshi no Ko Season 1 label"]
    },
    {
      label: "The Apothecary Diaries",
      query: "The Apothecary Diaries",
      suggested: ["(Naming consistency) The Apothecary Diaries Season 1 label"]
    },
    {
      label: "Mashle",
      query: "Mashle",
      suggested: ["(Naming consistency) Normalize Season casing"]
    },
    {
      label: "Kuroko's Basketball",
      query: "Kuroko",
      suggested: ["Kuroko's Basketball Season 3"]
    },
    {
      label: "Haikyuu!!",
      query: "Haikyuu",
      suggested: ["Haikyuu!! Season 4 / To the Top"]
    },
    {
      label: "My Hero Academia",
      query: "My Hero Academia",
      suggested: ["My Hero Academia Season 4+"]
    },
    {
      label: "Jujutsu Kaisen",
      query: "Jujutsu Kaisen",
      suggested: [
        "(Structuring) Split Season 2 into Hidden Inventory/Premature Death + Shibuya Incident",
        "(Avoid duplicates) Keep only one consistent naming per arc"
      ]
    }
  ];

  const md = [];
  md.push(`# AnimeData Audit (auto-generated)\n`);
  md.push(`Generated: ${new Date().toISOString()}\n`);

  md.push(`## 1) Franchise continuity (what exists in the 403-item list today)\n`);
  for (const f of franchises) {
    const found = findTitles(rows, f.query);
    md.push(`### ${f.label}`);
    if (found.length === 0) {
      md.push(`- Found: (none)`);
    } else {
      md.push(`- Found (${found.length}): ${found.map((r) => r.title).join(" | ")}`);
    }
    if (Array.isArray(f.suggested) && f.suggested.length > 0) {
      md.push(`- Suggested (from your list): ${f.suggested.join(" | ")}`);
    }
    md.push("");
  }

  // 2) Specific titles user called out for "real song name".
  const requestedPlaceholderTitles = [
    "Mirai Nikki",
    "Guilty Crown",
    "Fate/Grand Order - Absolute Demonic Front: Babylonia",
    "Soul Eater",
    "Blue Exorcist",
    "Noragami",
    "Bocchi the Rock!",
    "No Game No Life: Zero",
    "Black Butler",
    "Solo Leveling",
    "Sword Art Online: Alicization",
    "Tokyo Ghoul:re",
    "Toradora! (OP2)",
    "Angel Beats! (ED1)",
    "Psycho-Pass (ED1)",
    "Noragami Aragoto",
    "Blue Exorcist (OP2)",
    "Sword Art Online II (OP2)",
    "KonoSuba Season 2",
    "The Seven Deadly Sins (OP2)",
    "Shokugeki no Soma (OP2)",
    "No Game No Life (ED)",
    "Overlord III",
    "The Rising of the Shield Hero (OP2)",
    "Mushoku Tensei Season 2",
    "Spy x Family Season 2",
    "Oshi no Ko (ED)",
    "Frieren: Beyond Journey's End (OP2)",
    "The Apothecary Diaries (OP2)",
    "Mashle Season 1",
    "Chainsaw Man (ED3)",
    "Coppelion",
    "Madan no Ou to Vanadis",
    "Girls und Panzer",
    "Drifters",
    "Qualidea Code",
    "Mahouka Koukou no Rettousei (OP1)",
    "Mahouka Koukou no Rettousei (OP2)",
    "Mahouka Koukou no Rettousei: Visitor Arc",
    "Absolute Duo",
    "Seiken Tsukai no World Break",
    "Isekai wa Smartphone to Tomo ni (OP1)"
  ];

  md.push(`## 2) Titles flagged for replacing placeholder notes (current note values)\n`);
  const placeholderRows = [];
  for (const titleQuery of requestedPlaceholderTitles) {
    const found = findTitles(rows, titleQuery);
    if (found.length === 0) {
      md.push(`- ${titleQuery}: NOT FOUND`);
      continue;
    }
    // If multiple found, list them all.
    for (const r of found) {
      const flags = [];
      if (isLikelyPlaceholder(r.note)) flags.push("placeholder");
      if (isExplicitEdOrInsert(r.title, r.note)) flags.push("ed_or_insert");
      md.push(`- ${r.title}: ${r.note}${flags.length ? `  [${flags.join(", ")}]` : ""}`);
      placeholderRows.push({ ...r, flags: flags.join(",") });
    }
  }
  md.push("");

  // 3) ED/Insert mixing candidates.
  md.push(`## 3) Entries that look like ED/Insert (if the goal is OP-only)\n`);
  const edInsert = rows.filter((r) => isExplicitEdOrInsert(r.title, r.note));
  if (edInsert.length === 0) {
    md.push(`- (none detected by heuristic)`);
  } else {
    for (const r of edInsert) {
      md.push(`- ${r.title}: ${r.note}`);
    }
  }
  md.push("");

  // 4) Global "likely placeholders" heuristic list.
  md.push(`## 4) Additional notes that look like placeholders (heuristic)\n`);
  const likely = rows.filter((r) => isLikelyPlaceholder(r.note));
  md.push(`- Count: ${likely.length}`);
  md.push(`- See TSV for full list: anime_data_audit.tsv`);
  md.push("");

  fs.writeFileSync("anime_data_audit.md", md.join("\n"), "utf8");
  fs.writeFileSync("anime_data_audit.tsv", toTsv(rows), "utf8");

  // A compact TSV for just the user-requested placeholder titles.
  const requestedTsvLines = ["id\ttitle\tnote\tflags", ...placeholderRows.map((r) => `${r.id}\t${r.title}\t${r.note}\t${r.flags}`)];
  fs.writeFileSync("anime_data_requested_placeholders.tsv", requestedTsvLines.join("\n") + "\n", "utf8");

  console.log(`Parsed rows=${rows.length}`);
  console.log(`Wrote anime_data_audit.md, anime_data_audit.tsv, anime_data_requested_placeholders.tsv`);
}

main();
