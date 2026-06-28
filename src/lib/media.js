export function getYouTubeId(videoSource) {
  const raw = String(videoSource || "").trim();
  if (!raw) return "";

  const pickCandidate = (candidate) => {
    const token = String(candidate || "").trim().split(/[?&#/\s]+/)[0] || "";
    return /^[a-zA-Z0-9_-]{6,20}$/.test(token) ? token : "";
  };

  const direct = pickCandidate(raw);
  if (direct && !raw.includes(".")) return direct;

  const match = raw.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{6,20})/i);
  if (match?.[1]) return pickCandidate(match[1]);

  try {
    const url = /^https?:\/\//i.test(raw)
      ? new URL(raw)
      : /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(raw)
        ? new URL(`https://${raw}`)
        : null;
    if (!url) return "";

    const queryId = pickCandidate(url.searchParams.get("v"));
    if (queryId) return queryId;

    if (url.hostname.includes("youtu.be")) {
      return pickCandidate(url.pathname.replace(/^\//, ""));
    }

    const parts = url.pathname.split("/").filter(Boolean);
    for (const marker of ["embed", "shorts"]) {
      const index = parts.indexOf(marker);
      if (index !== -1 && parts[index + 1]) return pickCandidate(parts[index + 1]);
    }
  } catch {
    return "";
  }

  return "";
}

export function getYouTubeThumbUrl(videoSource, quality = "hqdefault") {
  const videoId = getYouTubeId(videoSource);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg` : "";
}

export function getAnimeImageUrl(anime) {
  if (!anime) return "";
  return String(anime.imageUrl || "").trim() || getYouTubeThumbUrl(anime.youtubeVideoId);
}
