import test from 'node:test';
import assert from 'node:assert/strict';
import { getEffectiveAnimeGenre, getEffectiveAnimeGenres, matchesAnimeGenre, normalizeAnimeGenres, getAnimeGenreLabel } from '../src/lib/animeGenre.js';

test('multiple saved categories work independently in filters and labels', () => {
  const anime = {title: 'Custom anime', genres: ['romance', 'comedy'], genre: 'action', genreSource: 'manual'};
  assert.equal(getEffectiveAnimeGenre(anime), 'romance');
  assert.ok(matchesAnimeGenre(anime, 'romance'));
  assert.ok(matchesAnimeGenre(anime, 'comedy'));
  assert.equal(matchesAnimeGenre(anime, 'action'), false);
  assert.equal(getAnimeGenreLabel(anime), 'โรแมนซ์ / คอมเมดี้');
});
test('legacy manual genre remains valid and curated shows have supplemental tags', () => {
  assert.deepEqual(getEffectiveAnimeGenres({title:'Re:Zero', genre:'romance', genreSource:'manual'}), ['romance']);
  assert.ok(matchesAnimeGenre({title:'Re:ZERO Season 2 (OP1)'}, 'isekai'));
  assert.ok(matchesAnimeGenre({title:'Re:ZERO Season 2 (OP1)'}, 'fantasy'));
  assert.ok(matchesAnimeGenre({title:'Re:ZERO Season 2 (OP1)'}, 'action'));
});
test('invalid and duplicate tags are removed, other does not accompany known tags', () => {
  assert.deepEqual(normalizeAnimeGenres(['other', 'comedy', 'comedy', 'invalid']), ['comedy']);
  assert.deepEqual(getEffectiveAnimeGenres({title:'Unknown', songTitle:'Idol', note:'slime'}), ['other']);
  assert.ok(matchesAnimeGenre({title:'Unknown'}, 'all'));
});
