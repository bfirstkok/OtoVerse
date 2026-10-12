# Bulk MyAnimeList catalog import

`scripts/import-mal-catalog.mjs` imports successive popularity ranking pages, preserving the existing catalog. It reads all Firestore pages and keeps local backups and source caches under ignored `.firebase/mal-import/`.

Requires the existing logged-in Firebase CLI, and `server/mascot-api` dependencies. Set `FIREBASE_CLI_ROOT` to the installed `firebase-tools` directory. Credentials are used in memory and are never included in reports or commits.

Preview with `node scripts/import-mal-catalog.mjs --pages 1`. Import with `--apply --pages 20`. Continue from the next ranking position using `--offset 1000`. Each ranking page contains up to 50 entries. This is a bounded batch, not a claim that the entire MyAnimeList database has been imported.

- MAL ID, legacy titles/aliases, season naming variants and year prevent duplicates. Distinct MAL IDs remain separate. Existing records are not overwritten.
- Metadata and OP/ED assignments come from MyAnimeList. Promotional trailers stay separate from theme songs; special/insert songs are not guessed as regular OP/ED.
- YouTube candidates require a verified channel, matching song title and artist, and successful embed playability at import time. Covers, remixes and live performances are excluded. Availability can change later and some matches require human review.
- Records without a verified video are inactive and visible through the admin filter “นำเข้าแล้ว · รอวิดีโอ”. They cannot enter the game.
- Every anime is committed atomically with deterministic record IDs and `exists:false` preconditions. Reruns skip already imported anime. A race or uncertain match is reported rather than overwriting data.
- English source synopses are preserved until Thai summaries are ready. `mal-summaries.yml` uses the existing encrypted `NEWS_AI_KEY` with the user-selected KKC provider; no key enters the browser or repository. The summary job runs only for explicitly added input batches, not on a recurring schedule.
- After pulling completed summaries, `node scripts/import-mal-catalog.mjs --apply-summaries` updates only imported records that have not been edited by an admin, with document update-time preconditions.

Tests: `node --test scripts/mal-bulk.test.mjs` checks alias/year/season deduplication, OP/ED parsing and strict video candidate filtering. Live batches should additionally check the report, sampled source assignments and Firestore counters before reporting completion.
