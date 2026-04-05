/* eslint-disable no-console */
const fs = require("fs");

const datasetPath = process.argv[2] || "anime_op_quiz_starter.jsx";

function detectEol(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function ensureSuffixTitle(title) {
  // Normalize (OP) -> (OP1), (ED) -> (ED1)
  const t = String(title || "");
  if (/\((OP|ED)\d+\)\s*$/i.test(t)) return t;
  const m = t.match(/\((OP|ED)\)\s*$/i);
  if (!m) return t;
  const kind = m[1].toUpperCase();
  return t.replace(/\((OP|ED)\)\s*$/i, `(${kind}1)`);
}

const newEntries = [
  {
    id: 404,
    title: "Attack on Titan Season 1 (OP2)",
    altTitles: ["ผ่าพิภพไททัน"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=PbAIfxZl7qQ",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Jiyuu no Tsubasa",
  },
  {
    id: 405,
    title: "Attack on Titan Season 3 Part 2 (OP1)",
    altTitles: ["ผ่าพิภพไททัน ภาค 3 พาร์ท 2"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=0w1JqKk7c8U",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Shoukei to Shikabane no Michi",
  },
  {
    id: 406,
    title: "Attack on Titan The Final Season Part 2 (ED1)",
    altTitles: ["ผ่าพิภพไททัน ไฟนอลซีซั่น พาร์ท 2"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=1OwvauKDzHA",
    acceptedAnswers: ["attack on titan", "shingeki no kyojin", "ผ่าพิภพไททัน"],
    note: "Akuma no Ko (เด็กปีศาจ)",
  },
  {
    id: 407,
    title: "Sword Art Online (OP2)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์"],
    difficulty: "normal",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=kL-ELP7E0i4",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Innocence",
  },
  {
    id: 408,
    title: "Sword Art Online: Alicization - War of Underworld (OP1)",
    altTitles: ["ซอร์ดอาร์ตออนไลน์ อลิซิเซชั่น วอร์ออฟอันเดอร์เวิลด์"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=LKaEabfB52I",
    acceptedAnswers: ["sword art online", "sao", "ซอร์ดอาร์ตออนไลน์"],
    note: "Resolution",
  },
  {
    id: 409,
    title: "Demon Slayer: Mugen Train Arc (ED1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคศึกรถไฟสู่นิรันดร์"],
    difficulty: "easy",
    year: 2020,
    youtubeVideoId: "https://www.youtube.com/watch?v=4DxL6IKm8A0",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Homura",
  },
  {
    id: 410,
    title: "Demon Slayer: Hashira Training Arc (OP1)",
    altTitles: ["ดาบพิฆาตอสูร ภาคการสั่งสอนของเสาหลัก"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=1F2l47-1x8g",
    acceptedAnswers: ["demon slayer", "kimetsu no yaiba", "ดาบพิฆาตอสูร"],
    note: "Mugen",
  },
  {
    id: 411,
    title: "Jujutsu Kaisen Season 1 (OP2)",
    altTitles: ["มหาเวทย์ผนึกมาร"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=8nW-IPrzM1g",
    acceptedAnswers: ["jujutsu kaisen", "มหาเวทย์ผนึกมาร"],
    note: "VIVID VICE",
  },
  {
    id: 412,
    title: "Jujutsu Kaisen 0 (ED1)",
    altTitles: ["มหาเวทย์ผนึกมาร 0"],
    difficulty: "easy",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=fKbyFEK74_U",
    acceptedAnswers: ["jujutsu kaisen 0", "jujutsu kaisen", "มหาเวทย์ผนึกมาร 0", "มหาเวทย์ผนึกมาร"],
    note: "Ichizu",
  },
  {
    id: 413,
    title: "My Hero Academia Season 4 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 4"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=sI9f-2mB0kM",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "Polaris",
  },
  {
    id: 414,
    title: "My Hero Academia Season 6 (OP1)",
    altTitles: ["มายฮีโร่ อคาเดเมีย ภาค 6"],
    difficulty: "normal",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=S21iFvC2X6c",
    acceptedAnswers: ["my hero academia", "boku no hero academia", "มายฮีโร่ อคาเดเมีย"],
    note: "Bokura no",
  },
  {
    id: 415,
    title: "Tokyo Ghoul:re (OP2)",
    altTitles: ["โตเกียวกูล:รี"],
    difficulty: "hard",
    year: 2018,
    youtubeVideoId: "https://www.youtube.com/watch?v=M5G8-y4Aozc",
    acceptedAnswers: ["tokyo ghoul", "tokyo ghoul re", "โตเกียวกูล", "โตเกียวกูล รี"],
    note: "Katharsis",
  },
  {
    id: 416,
    title: "Fullmetal Alchemist: Brotherhood (OP2)",
    altTitles: ["FMA Brotherhood", "แขนกลคนแปรธาตุ"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=P22zFqH0iE0",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "แขนกลคนแปรธาตุ"],
    note: "Hologram",
  },
  {
    id: 417,
    title: "Fullmetal Alchemist: Brotherhood (OP3)",
    altTitles: ["FMA Brotherhood", "แขนกลคนแปรธาตุ"],
    difficulty: "normal",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=ZJ_5hXQWn4c",
    acceptedAnswers: ["fullmetal alchemist brotherhood", "fma brotherhood", "แขนกลคนแปรธาตุ"],
    note: "Golden Time Lover",
  },
  {
    id: 418,
    title: "JoJo: Battle Tendency (OP1)",
    altTitles: ["โจโจ้ ภาค 2 กระแสเลือดแห่งการต่อสู้"],
    difficulty: "easy",
    year: 2012,
    youtubeVideoId: "https://www.youtube.com/watch?v=NI9Sa8jvwXA",
    acceptedAnswers: ["jojo", "โจโจ้", "battle tendency"],
    note: "Bloody Stream",
  },
  {
    id: 419,
    title: "JoJo: Golden Wind (OP2)",
    altTitles: ["โจโจ้ ภาค 5"],
    difficulty: "normal",
    year: 2019,
    youtubeVideoId: "https://www.youtube.com/watch?v=E_aw2qXJ25M",
    acceptedAnswers: ["jojo", "golden wind", "โจโจ้"],
    note: "Uragirimono no Requiem",
  },
  {
    id: 420,
    title: "Oshi no Ko Season 2 (ED1)",
    altTitles: ["เกิดใหม่เป็นลูกโอชิ ภาค 2"],
    difficulty: "easy",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=vVj_n2XhPWA",
    acceptedAnswers: ["oshi no ko", "เกิดใหม่เป็นลูกโอชิ", "ลูกโอชิ"],
    note: "Burning",
  },
  {
    id: 421,
    title: "Date A Live V (OP1)",
    altTitles: ["พิชิตรัก พิทักษ์โลก ภาค 5"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=aG3H-B_zI0E",
    acceptedAnswers: ["date a live", "พิชิตรัก พิทักษ์โลก", "เดทอะไลฟ์"],
    note: "Paradoxes",
  },
  {
    id: 422,
    title: "Naruto: Shippuden (OP16)",
    altTitles: ["นารูโตะ ตำนานวายุสลาตัน"],
    difficulty: "easy",
    year: 2014,
    youtubeVideoId: "https://www.youtube.com/watch?v=Z21XQkS9I5o",
    acceptedAnswers: ["naruto shippuden", "naruto", "นารูโตะ"],
    note: "Silhouette",
  },
  {
    id: 423,
    title: "Naruto: Shippuden (OP6)",
    altTitles: ["นารูโตะ ตำนานวายุสลาตัน"],
    difficulty: "easy",
    year: 2009,
    youtubeVideoId: "https://www.youtube.com/watch?v=o3ASICWeSLc",
    acceptedAnswers: ["naruto shippuden", "naruto", "นารูโตะ"],
    note: "Sign",
  },
  {
    id: 424,
    title: "Bleach (OP2)",
    altTitles: ["บลีช เทพมรณะ"],
    difficulty: "normal",
    year: 2005,
    youtubeVideoId: "https://www.youtube.com/watch?v=d_kX2E2rXoI",
    acceptedAnswers: ["bleach", "บลีช", "บลีช เทพมรณะ"],
    note: "D-tecnoLife",
  },
  {
    id: 425,
    title: "Bleach (OP13)",
    altTitles: ["บลีช เทพมรณะ"],
    difficulty: "easy",
    year: 2010,
    youtubeVideoId: "https://www.youtube.com/watch?v=cZ7HntI-Szw",
    acceptedAnswers: ["bleach", "บลีช", "บลีช เทพมรณะ"],
    note: "Ranbu no Melody",
  },
  {
    id: 426,
    title: "One Piece (OP20)",
    altTitles: ["วันพีซ"],
    difficulty: "easy",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=n7z5jF4w15U",
    acceptedAnswers: ["one piece", "วันพีซ"],
    note: "Hope",
  },
  {
    id: 427,
    title: "One Piece Film: Red (OP1)",
    altTitles: ["วันพีซ ฟิล์ม เรด"],
    difficulty: "easy",
    year: 2022,
    youtubeVideoId: "https://www.youtube.com/watch?v=1FliVTv8ls1",
    acceptedAnswers: ["one piece", "one piece film red", "วันพีซ"],
    note: "New Genesis",
  },
  {
    id: 428,
    title: "Gintama (OP13)",
    altTitles: ["กินทามะ"],
    difficulty: "normal",
    year: 2013,
    youtubeVideoId: "https://www.youtube.com/watch?v=i1x0A6q7P4k",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Sakura Mitsutsuki",
  },
  {
    id: 429,
    title: "Gintama (ED17)",
    altTitles: ["กินทามะ"],
    difficulty: "easy",
    year: 2011,
    youtubeVideoId: "https://www.youtube.com/watch?v=sD2uGv2i7l8",
    acceptedAnswers: ["gintama", "กินทามะ"],
    note: "Samurai Heart (Some Like It Hot!!)",
  },
  {
    id: 430,
    title: "Black Clover (OP13)",
    altTitles: ["แบล็คโคลเวอร์"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=P2f2X-E87Q0",
    acceptedAnswers: ["black clover", "แบล็คโคลเวอร์"],
    note: "Grandeur",
  },
  {
    id: 431,
    title: "Tensei shitara slime datta ken Season 2 (OP1)",
    altTitles: ["เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว ภาค 2"],
    difficulty: "normal",
    year: 2021,
    youtubeVideoId: "https://www.youtube.com/watch?v=wX-y0lE0n48",
    acceptedAnswers: [
      "that time i got reincarnated as a slime",
      "tensura",
      "เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว",
      "สไลม์",
    ],
    note: "Storyteller",
  },
  {
    id: 432,
    title: "Cardfight Vanguard G: NEXT (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G NEXT"],
    difficulty: "normal",
    year: 2016,
    youtubeVideoId: "https://www.youtube.com/watch?v=k4KzZ8yMvRE",
    acceptedAnswers: ["cardfight vanguard", "vanguard g next", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "Hello, Mr. Wonder land",
  },
  {
    id: 433,
    title: "Cardfight Vanguard G: Z (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด G Z"],
    difficulty: "hard",
    year: 2017,
    youtubeVideoId: "https://www.youtube.com/watch?v=hJ3f-Zt7A8A",
    acceptedAnswers: ["cardfight vanguard", "vanguard g z", "vanguard", "แวนการ์ด", "แวนการ์ด g"],
    note: "Jonetsu no Auto Score",
  },
  {
    id: 434,
    title: "Cardfight Vanguard will+Dress Season 3 (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด วิลเดรส ภาค 3"],
    difficulty: "normal",
    year: 2023,
    youtubeVideoId: "https://www.youtube.com/watch?v=1F_Ew2K-AHE",
    acceptedAnswers: ["cardfight vanguard will+dress", "vanguard will dress", "vanguard", "แวนการ์ด", "แวนการ์ด วิลเดรส"],
    note: "The last resort",
  },
  {
    id: 435,
    title: "Cardfight Vanguard Divinez Season 2 (OP1)",
    altTitles: ["การ์ดไฟท์!! แวนการ์ด ดีไวน์ซ ภาค 2"],
    difficulty: "normal",
    year: 2024,
    youtubeVideoId: "https://www.youtube.com/watch?v=6hV5m_8xZ2w",
    acceptedAnswers: ["cardfight vanguard divinez", "vanguard divinez", "vanguard", "แวนการ์ด", "แวนการ์ด ดีไวน์ซ"],
    note: "Shukumei",
  },
].map((e) => ({ ...e, title: ensureSuffixTitle(e.title) }));

function serializeEntry(entry, eol) {
  const pad = "    ";
  const lines = [];
  lines.push("  {");
  lines.push(`${pad}id: ${entry.id},`);
  lines.push(`${pad}title: ${JSON.stringify(entry.title)},`);
  lines.push(`${pad}altTitles: ${JSON.stringify(entry.altTitles)},`);
  lines.push(`${pad}difficulty: ${JSON.stringify(entry.difficulty)},`);
  lines.push(`${pad}year: ${entry.year},`);
  lines.push(`${pad}youtubeVideoId: ${JSON.stringify(entry.youtubeVideoId)},`);
  lines.push(`${pad}acceptedAnswers: ${JSON.stringify(entry.acceptedAnswers)},`);
  lines.push(`${pad}note: ${JSON.stringify(entry.note)}`);
  lines.push("  }");
  return lines.join(eol);
}

const text = fs.readFileSync(datasetPath, "utf8");
const eol = detectEol(text);

const start = text.indexOf("const animeData = [");
if (start < 0) throw new Error("animeData start not found");
const endArray = text.indexOf("];", start);
if (endArray < 0) throw new Error("animeData end not found");

// Prevent double-insert
if (text.includes("id: 404,")) {
  console.log("Entries already present; nothing to do.");
  process.exit(0);
}

const lastBrace = text.lastIndexOf("}", endArray);
if (lastBrace < 0) throw new Error("Could not locate last object end");
const between = text.slice(lastBrace + 1, endArray);
if (!/^\s*$/.test(between)) {
  throw new Error("Unexpected content between last object and end of array; aborting");
}

const before = text.slice(0, lastBrace + 1);
const after = text.slice(lastBrace + 1);

const entriesText = newEntries
  .map((e) => serializeEntry(e, eol))
  .join("," + eol);

const updated = before + "," + eol + entriesText + after;
fs.writeFileSync(datasetPath, updated, "utf8");
console.log(`Inserted ${newEntries.length} entries into ${datasetPath}`);
