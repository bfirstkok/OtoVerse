// Keep Thai vowels and tone marks; only spacing and punctuation are ignored.
export function normalizeAnimeSearch(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/×/g, 'x').replace(/[^\p{L}\p{N}\p{M}]/gu, '');
}

