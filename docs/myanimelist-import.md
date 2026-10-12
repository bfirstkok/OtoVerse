# MyAnimeList import

Admin anime editor: search by English/Japanese title, MAL anime URL, or MAL ID. Select the correct season. Jikan metadata fills a draft only; Save commits it. Imported fields: title/aliases, poster, year, mapped genres/themes, synopsis, MAL identity, YouTube trailer. No song video or game answers are replaced. AI button summarizes the server-fetched MAL synopsis in Thai using the existing provider, without invented details/end spoilers. Keep human review before Save.

Metadata and summary use authenticated admin-only Vercel endpoints `/api/anime-metadata` and `/api/anime-summary`. Firebase ID tokens are verified and admin membership read with caller authorization. Suspension is checked. AI shares existing 60/day quota with mascot chat, 5-second cooldown, and keeps summaries in a six-hour in-memory cache. Provider secret remains server-side. Upstream failures preserve the current draft. No mass rewrite of the production catalog occurs.

Series edits propagate metadata/trailer/source to all songs of that series. Public anime details embed the trailer separately from OP/ED and link MAL attribution. Missing trailer stays empty. Adventure and supernatural are separate supported categories.

Verification: build; metadata transformation tests; API authorization/provider contract tests with test-only mocks; browser inspection of actual admin form in a local fixture; deployed endpoints reject anonymous requests. A live signed-in admin summary/import still requires validation with the user's admin session. Jikan timed out from this local network during verification.

Sources: https://docs.api.jikan.moe/ and https://myanimelist.net/

## Source recovery

Jikan times out after 3.5 seconds and the server then fetches the public MAL anime page directly. A strict MAL URL is built from the validated numeric ID. Cheerio extracts title, aliases, genres/themes, year, poster and synopsis; the MAL video page supplies only promotional videos, never opening/ending songs. Results cache for one hour. Both metadata and AI summary share this source loader. No user login or challenge bypass is used. Direct MAL markup can change; parsing fails visibly if expected identity/synopsis is missing. Live checks: MAL 52299 (Solo Leveling) and 31240 (Re:Zero), plus rezero search succeeded on 2026-10-12.
