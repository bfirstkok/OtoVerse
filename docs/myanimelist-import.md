# MyAnimeList import

Admin anime editor: search by English/Japanese title, MAL anime URL, or MAL ID. Select the correct season. Jikan metadata fills a draft only; Save commits it. Imported fields: title/aliases, poster, year, mapped genres/themes, synopsis, MAL identity, YouTube trailer. No song video or game answers are replaced. AI button summarizes the server-fetched MAL synopsis in Thai using the existing provider, without invented details/end spoilers. Keep human review before Save.

Metadata and summary use authenticated admin-only Vercel endpoints `/api/anime-metadata` and `/api/anime-summary`. Firebase ID tokens are verified and admin membership read with caller authorization. Suspension is checked. AI shares existing 60/day quota with mascot chat, 5-second cooldown, and keeps summaries in a six-hour in-memory cache. Provider secret remains server-side. Upstream failures preserve the current draft. No mass rewrite of the production catalog occurs.

Series edits propagate metadata/trailer/source to all songs of that series. Public anime details embed the trailer separately from OP/ED and link MAL attribution. Missing trailer stays empty. Adventure and supernatural are separate supported categories.

Verification: build; metadata transformation tests; API authorization/provider contract tests with test-only mocks; browser inspection of actual admin form in a local fixture; deployed endpoints reject anonymous requests. A live signed-in admin summary/import still requires validation with the user's admin session. Jikan timed out from this local network during verification.

Sources: https://docs.api.jikan.moe/ and https://myanimelist.net/
