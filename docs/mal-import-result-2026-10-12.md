# Production import: 12 October 2026

The first 1,000 MyAnimeList popularity ranking entries were inspected. This is the first bounded batch, not the entire MyAnimeList database. Continue with `--offset 1000` when importing the next batch.

Final production Firestore audit:

| Result | Count |
| --- | ---: |
| Existing catalog records preserved | 589 |
| Newly imported anime | 695 |
| Public anime profiles with covers and metadata | 695 |
| Anime with AI Thai summaries | 695 |
| Imported OP/ED song assignments | 2,098 |
| New songs with verified, embeddable YouTube videos | 840 |
| Song assignments waiting for a verified video | 1,258 |
| Duplicate records detected by the final ID/title/alias/season/year audit | 0 |

Public profiles appear in the anime directory, including anime without a playable theme video. Only verified video records are active in the music library and eligible for the game. Pending songs remain in the admin review filter.

All 14 relevant tests passed and the production build succeeded. Firebase Hosting target `otoverse` was deployed to project `animequiz-8a93b`. The `/` page and `/admin` login gate loaded in the browser. No administrator credentials were available for a live dashboard interaction; its filter and metadata preservation were checked through the build, code and regression test. Public Firestore reads of sampled anime profiles and playable theme records returned HTTP 200; sampled MAL cover images also returned HTTP 200.

Video verification records availability at import time. Reports and complete Firestore backups are stored locally under ignored `.firebase/mal-import/`.
