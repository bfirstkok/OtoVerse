/* eslint-disable no-console */
const fs = require("fs");
const cp = require("child_process");

const commitish = process.argv[2] || "276f8c7";
const datasetPath = process.argv[3] || "anime_op_quiz_starter.jsx";

function runGitShow(commit, path) {
  return cp.execFileSync("git", ["show", `${commit}:${path}`], {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024,
  });
}

function stripSuffix(title) {
  return String(title || "").replace(/\s*\((OP|ED)\s*\d+\)\s*$/i, "").trim();
}

function parseOpEdHint(title) {
  const m = String(title || "").match(/\((OP|ED)\s*(\d+)\)\s*$/i);
  if (!m) return null;
  const kind = m[1].toUpperCase();
  const index = Number(m[2]);
  if (!Number.isFinite(index) || index <= 0) return null;
  return { kind, index };
}

function ensureSuffix(titleBase, hint) {
  if (!hint) return titleBase;
  const has = /\s*\((OP|ED)\s*\d+\)\s*$/i.test(String(titleBase || ""));
  if (has) return titleBase;
  return `${titleBase} (${hint.kind}${hint.index})`;
}

function parseIdTitleMap(fileText) {
  const start = fileText.indexOf("const animeData = [");
  if (start < 0) throw new Error("animeData start not found");
  const end = fileText.indexOf("];", start);
  if (end < 0) throw new Error("animeData end not found");
  const chunk = fileText.slice(start, end);

  const re = /\{[\s\S]*?\bid\s*:\s*(\d+)[\s\S]*?\btitle\s*:\s*"([^\"]+)"[\s\S]*?\}/g;
  const map = new Map();
  let m;
  while ((m = re.exec(chunk))) {
    map.set(Number(m[1]), String(m[2] || "").trim());
  }
  return map;
}

function updateTitleById(fileText, id, newTitle) {
  const marker = `id: ${id},`;
  const markerPos = fileText.indexOf(marker);
  if (markerPos < 0) return { ok: false, reason: "id_not_found" };

  const objEnd = fileText.indexOf("},", markerPos);
  if (objEnd < 0) return { ok: false, reason: "object_end_not_found" };

  const segment = fileText.slice(markerPos, objEnd);
  const titleRe = /title:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;
  if (!titleRe.test(segment)) return { ok: false, reason: "title_not_found" };

  const updatedSegment = segment.replace(titleRe, `title: ${JSON.stringify(String(newTitle))}`);
  if (updatedSegment === segment) return { ok: false, reason: "no_change" };

  const updated = fileText.slice(0, markerPos) + updatedSegment + fileText.slice(objEnd);
  return { ok: true, updated };
}

function main() {
  if (!fs.existsSync(datasetPath)) throw new Error(`Missing ${datasetPath}`);

  const currentText = fs.readFileSync(datasetPath, "utf8");
  const currentMap = parseIdTitleMap(currentText);

  const baselineText = runGitShow(commitish, datasetPath);
  const baselineMap = parseIdTitleMap(baselineText);

  // For each current entry: get OP/ED hint from current title (it should always exist now).
  // Then restore baseline title (readable) and re-attach the hint.
  let outText = currentText;

  let changed = 0;
  let missingBaseline = 0;
  let unchanged = 0;

  for (const [id, currentTitle] of currentMap.entries()) {
    const baseTitle = baselineMap.get(id);
    if (!baseTitle) {
      missingBaseline += 1;
      continue;
    }

    const hint = parseOpEdHint(currentTitle);
    const restoredBase = stripSuffix(baseTitle);
    const restored = ensureSuffix(restoredBase, hint);

    const res = updateTitleById(outText, id, restored);
    if (!res.ok) {
      if (res.reason === "no_change") unchanged += 1;
      continue;
    }
    outText = res.updated;
    changed += 1;
  }

  fs.writeFileSync(datasetPath, outText, "utf8");
  console.log(`Restored titles from ${commitish}: changed=${changed} unchanged=${unchanged} missingBaseline=${missingBaseline}`);
}

main();
