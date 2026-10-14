# Catalog organization — 2026-10-14

## Released

- Anime groups use MyAnimeList IDs where available so seasons stay distinct even when titles are similar.
- Metadata is the primary anime information; it no longer appears as a fake song in the expanded list.
- Track status is derived separately: ready, awaiting video, or needs review. Metadata is never counted as a ready track.
- Source-backed season/year display labels are available in admin and the music library without renaming document IDs or breaking saved favorites/watch lists. Manually edited titles remain intact.
- Admin offers anime, songs awaiting video, and songs needing review views. AI summaries carry an unreviewed notice.
- Quiz excludes metadata, inactive tracks, and tracks carrying a review reason.
- Bulk import is paused by default; deliberate operator resumption is required.

## Data migration prepared, not applied

Firestore returned RESOURCE_EXHAUSTED while loading current data. The organization script was therefore run in planning mode against the existing 3,380-record audit backup. It proposes organizing 2,791 imported records, including title/alias consistency and 251 special OP/ED assignments. Cached genres already matched the source mapping, so this comparison proposed zero genre changes. These are planning counts, not proof of current server state.

The script preserves admin-edited records, creates a full timestamped backup, and uses update-time preconditions. It refuses to apply an offline backup; it must read current server data before writing. No data migration writes were made this turn.

## Remaining

Apply the prepared migration when Firestore quota is available. Manual factual review of all Thai AI synopses, legacy metadata, and every replacement video remains outstanding. No claim that these are all correct is made.
