import aliases from './animeSearchAliases.js';

import {normalizeAnimeSearch} from './searchNormalization.js';
export {normalizeAnimeSearch};

function titleKey(value) {
  return normalizeAnimeSearch(String(value || '').replace(/\s*\((OP|ED)\s*\d*\)\s*$/i, ''));
}

export function matchesAnimeSearch(item, query) {
  const compact = normalizeAnimeSearch(query);
  if (!compact) return true;
  const names = [item.title, item.animeTitle, item.songTitle, item.artist, item.note,
    ...(Array.isArray(item.altTitles) ? item.altTitles : []),
    ...(Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : []),
    ...(Array.isArray(item.aliases) ? item.aliases : []),
    ...(aliases[titleKey(item.title)] || []),
    ...(aliases[titleKey(item.animeTitle)] || [])].filter(Boolean).map(normalizeAnimeSearch);
  if (names.some(name => name.includes(compact))) return true;
  const tokens = String(query).trim().split(/\s+/).map(normalizeAnimeSearch).filter(Boolean);
  return tokens.length > 1 && tokens.every(token => token.length >= 3 || /^\d+$/.test(token))
    && tokens.every(token => names.some(name => name.includes(token)));
}
