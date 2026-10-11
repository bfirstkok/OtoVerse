# Anime primary genres

The shared resolver in `src/lib/animeGenre.js` supplies public game/library filters and admin content. It uses curated title families (including alternate titles), never song titles or notes. Each series can carry multiple genres in `genres`; `genre` remains the first primary tag for compatible game rotation and statistics. Admin checkboxes select multiple tags. Genre filters and labels use the whole array. Supplemental curated tags enrich legacy automatic entries. Unknown titles remain `other` rather than being guessed as action.

Explicit admin saves carry `genreSource: manual`; these take precedence over curated defaults. Legacy unmarked inferred values are corrected by known title rules at read time. No production catalog documents need to be rewritten. OP/ED records use the same title-family genre.

The bundled 589 song entries have 586 classified entries. Two With You: Mitsumeteitai entries and one ambiguous Paradise entry remain Other until their identity is confirmed.

Reference checks: Crunchyroll Vinland Saga (drama/historical setting), Hyouka (school mysteries):
- https://www.crunchyroll.com/fr/series/GEXH3WKK0/vinland-saga
- https://www.crunchyroll.com/de/series/G6P585256/hyouka

These are editorial primary categories, not a full imported external genre dataset.
