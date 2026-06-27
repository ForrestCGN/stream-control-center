# DOCS_CLEANUP_7_CANDIDATE_SUMMARY

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST`

## Ergebnis

Cleanup 7 uebernimmt die aus Cleanup 6 exakt klassifizierte Kategorie `ARCHIVE_OR_MERGE` und bereitet dafuer ein sicheres Move-Manifest vor.

## Geplante Aktion

| Gruppe | Anzahl | Aktion |
| --- | ---: | --- |
| `KEEP_CURRENT` | 15 | bleibt in `docs/current/` |
| `ARCHIVE_OR_MERGE` | 1033 | per Script nach `docs/archive/docs-current-cleanup-7/` verschieben |
| `REVIEW_MANUALLY` | 40 | bleibt unveraendert in `docs/current/` |
| Harte Deletes | 0 | keine |

## Warum dieser Step sicher ist

- Die Move-Liste ist exakt und vollstaendig in `DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.md` dokumentiert.
- Das Script laeuft standardmaessig als Dry-Run.
- `-Execute` verschiebt nur die im Manifest hinterlegten Dateien.
- Bei fehlenden Quelldateien oder vorhandenen Zielpfaden bricht Execute ab.
- Es wird nichts geloescht.

## Erwarteter Zustand nach Execute

- `docs/current/` enthaelt danach nur noch die aktuelle Pflicht-/Current-Doku plus die 40 `REVIEW_MANUALLY`-Dateien aus Cleanup 6.
- Die 1033 historischen/abgeloesten Dateien liegen unter `docs/archive/docs-current-cleanup-7/`.
- Keine Code-, DB- oder Webserver-Aenderungen.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_8_REVIEW_MANUALLY_PASS`

Ziel:

- die 40 `REVIEW_MANUALLY`-Dateien fachlich lesen,
- entscheiden: behalten, in zentrale Current-Doku mergen oder archivieren,
- keine Massenaktion ohne Einzelentscheidung.
