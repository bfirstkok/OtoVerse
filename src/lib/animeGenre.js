export const GENRE_CONFIG = {
  action: { label: "แอ็กชัน" },
  fantasy: { label: "แฟนตาซี" },
  isekai: { label: "ต่างโลก" },
  scifi: { label: "ไซไฟ" },
  sports: { label: "กีฬา" },
  mystery: { label: "สืบสวน/จิตวิทยา" },
  romance: { label: "โรแมนซ์" },
  comedy: { label: "คอมเมดี้" },
  music: { label: "ดนตรี/ไอดอล" },
  mecha: { label: "หุ่นยนต์" },
  slice: { label: "ชีวิตประจำวัน" },
  other: { label: "อื่นๆ" }
};

const GENRE_KEYWORD_RULES = [
  { genre: "sports", keywords: ["haikyuu", "slam dunk", "kuroko", "blue lock", "diamond no ace", "yowamushi", "prince of tennis"] },
  { genre: "music", keywords: ["k-on", "bocchi", "paripi", "zombieland saga", "your lie in april", "idol", "love live", "macross"] },
  { genre: "mecha", keywords: ["gundam", "evangelion", "code geass", "darling in the franxx", "gurren lagann", "mecha", "eureka seven"] },
  { genre: "isekai", keywords: ["re:zero", "konosuba", "slime", "shield hero", "mushoku", "overlord", "tanya", "log horizon", "sao", "sword art", "no game no life"] },
  { genre: "scifi", keywords: ["steins", "psycho", "ghost in the shell", "cyberpunk", "86", "dr. stone", "vivy", "akudama", "edgerunners", "science"] },
  { genre: "mystery", keywords: ["death note", "conan", "erased", "neverland", "parasyte", "monster", "summertime", "boku dake", "higurashi"] },
  { genre: "romance", keywords: ["kaguya", "toradora", "your name", "horimiya", "clannad", "bunny girl", "kimi ni todoke", "fruits basket", "shigatsu"] },
  { genre: "comedy", keywords: ["gintama", "nichijou", "asobi", "saiki", "grand blue", "osomatsu", "komi", "spy x family"] },
  { genre: "fantasy", keywords: ["fate", "frieren", "made in abyss", "vinland", "seven deadly sins", "black clover", "fairy tail", "akame", "magi"] },
  { genre: "slice", keywords: ["barakamon", "non non", "yuru camp", "hyouka", "violet", "anohana", "daily life", "slice"] }
];

function normalizeGenreText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function inferAnimeGenre(anime) {
  const haystack = normalizeGenreText([
    anime?.title,
    ...(Array.isArray(anime?.altTitles) ? anime.altTitles : []),
    anime?.note,
    anime?.songTitle
  ].join(" "));
  const matched = GENRE_KEYWORD_RULES.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(normalizeGenreText(keyword)))
  );
  return matched?.genre || "action";
}

export function getEffectiveAnimeGenre(anime) {
  const current = String(anime?.genre || "").trim();
  return current && current !== "other" ? current : inferAnimeGenre(anime);
}

export function getAnimeGenreLabel(anime) {
  const genre = getEffectiveAnimeGenre(anime);
  return GENRE_CONFIG[genre]?.label || genre;
}
