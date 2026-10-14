# Catalog audit — 2026-10-14

Checked all 3,380 current Firestore records, including 695 imported anime and 2,096 imported song assignments, against the cached MyAnimeList source.

## Findings and repairs

- Quarantined 19 additional imported video assignments using Music Box, piano, or instrumental arrangements. Kept song metadata and disabled gameplay until a replacement is confirmed. The earlier two LET'S GO OUT assignments were already quarantined.
- No malformed YouTube IDs after extracting IDs from URL fields.
- No imported song type/number/title mismatches against the cached source.
- No duplicate MAL song slots or imported-versus-existing anime duplicates under the current matching rules.
- Preserved School Days' officially named Remix Ver. theme: its title is present in the source, so a remix label alone does not make it wrong.
- Preserved Gintama's episode-specific OP/ED swaps and distinct seasons.

## Video assignments awaiting replacement

- Zero no Tsukaima F (OP1)
- Hunter x Hunter (ED2)
- Gintama' — ภาค 3: Enchousen (2012) (ED3)
- Gintama' — ภาค 3: Enchousen (2012) (OP4)
- Nekomonogatari: Kuro (OP1)
- Bleach Movie 1: Memories of Nobody (ED1)
- Lovely★Complex (ED2)
- Shinmai Maou no Testament (OP1)
- Aldnoah.Zero Part 2 (ED3)
- Durarara!!x2 Ketsu (ED1)
- Asobi Asobase (OP1)
- Plunderer (OP1)
- Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka II (OP1)
- Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka III (OP1)
- Kanojo, Okarishimasu 2nd Season (OP1)
- Kaguya-sama wa Kokurasetai: Ultra Romantic (ED3)
- Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san (OP1)
- Make Heroine ga Oosugiru! (ED2)
- Azumanga Daiou The Animation (OP1)

## Limits

This is a complete structural audit of the current database, not a claim that all content is correct. The MyAnimeList comparison uses cached source data from import, not a fresh fetch of every anime page. Legacy songs have no equivalent complete source snapshot. Videos were checked against saved discovery titles/channels; every current video was not individually played. Thai AI synopses and genre classifications were not manually fact-checked.
