# DOCS_CLEANUP_8_CANDIDATE_SUMMARY

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_8_REVIEW_MANUALLY_PASS`

## Ergebnis

Cleanup 8 prueft die 40 `REVIEW_MANUALLY`-Dateien aus Cleanup 6 einzeln und bereitet eine sichere Archiv-Aktion fuer die eindeutig historischen/abgeloesten Dateien vor.

## Entscheidung

| Gruppe | Anzahl | Aktion |
| --- | ---: | --- |
| `KEEP_CURRENT` | 9 | bleibt unveraendert in `docs/current/` |
| `ARCHIVE` | 31 | per Script nach `docs/archive/docs-current-cleanup-8/` verschieben |
| `MERGE_INTO_CURRENT` | 0 | kein automatischer Merge in diesem Step |
| `DELETE_OR_REGENERATE` | 0 | keine Deletes |

## Warum keine Merges in Cleanup 8?

Die 40 Dateien sind fachlich gemischt. Bei den aktuellen Dateien ist ein Verbleib sicherer als ein schneller Merge in grosse zentrale Dokumente. Historische Dateien werden archiviert, nicht geloescht. Damit bleibt der Inhalt erhalten und `docs/current/` wird trotzdem weiter entlastet.

## Erwarteter Zustand nach Execute

- 31 Review-Dateien liegen unter `docs/archive/docs-current-cleanup-8/`.
- 9 Review-Dateien bleiben bewusst in `docs/current/`.
- Keine Code-, DB- oder Webserver-Aenderungen.
- Keine harten Deletes.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN`

Ziel:

- `docs/current/` nach Cleanup 8 neu scannen,
- verbliebene Current-Doku zaehlen,
- alte Cleanup-/Next-Prompt-Dateien nach Abschluss ggf. archivieren,
- nur noch echte Start-/Master-/Status-/Architektur-Doku in `docs/current/` belassen.
