const GENRES = {'Action':'action','Adventure':'adventure','Supernatural':'supernatural','Fantasy':'fantasy','Sci-Fi':'scifi','Sports':'sports','Mystery':'mystery','Psychological':'mystery','Romance':'romance','Comedy':'comedy','Music':'music','Mecha':'mecha','Slice of Life':'slice','Drama':'drama','Historical':'historical','Horror':'horror','Isekai':'isekai'};
export function parseMalId(value) {
  const input = String(value || '').trim();
  if (/^[1-9]\d{0,7}$/.test(input)) return Number(input);
  try { const url = new URL(input); if (!['myanimelist.net','www.myanimelist.net'].includes(url.hostname) || url.protocol !== 'https:') return null; return Number(url.pathname.match(/^\/anime\/(\d+)(?:\/|$)/)?.[1]) || null; } catch { return null; }
}
export function malDraft(data) {
  const tags = [...(data.genres || []), ...(data.themes || [])].map(x => GENRES[x.name]).filter(Boolean);
  const genres = [...new Set(tags)];
  const altTitles = [...new Set([data.title_english, data.title_japanese, ...(data.title_synonyms || [])].filter(Boolean))];
  const video = data.trailer?.youtube_id;
  const image = data.images?.jpg?.large_image_url || data.images?.jpg?.image_url || '';
  return { animeTitle: data.title || '', altTitles: altTitles.join('\n'), year: data.year || data.aired?.prop?.from?.year || '', genres: genres.length ? genres : ['other'], genre: genres[0] || 'other', imageUrl: /^https:\/\/cdn\.myanimelist\.net\//.test(image) ? image : '', synopsis: String(data.synopsis || '').replace(/\s*\[Written by MAL Rewrite\]\s*$/i, '').trim(), malId: Number(data.mal_id), malUrl: `https://myanimelist.net/anime/${Number(data.mal_id)}`, trailerVideoId: /^[a-zA-Z0-9_-]{11}$/.test(video || '') ? video : '', synopsisSource: 'MyAnimeList via Jikan' };
}
