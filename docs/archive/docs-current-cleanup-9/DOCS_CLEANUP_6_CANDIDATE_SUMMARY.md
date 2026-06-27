# DOCS_CLEANUP_6_CANDIDATE_SUMMARY

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_6_DOCS_CURRENT_SECOND_PASS`

## Ergebnis

Nach Cleanup 5 liegen im Snapshot weiterhin **1084** Dateien unter `docs/current/`. Mit der wiederherzustellenden RDAP-Arbeitsweise-Datei ergibt sich fuer die Klassifikation ein Bestand von **1088** Dateien.

## Konkreter Restore in diesem Step

Diese Datei wird wieder in `docs/current/` bereitgestellt:

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
```

Grund: Sie ist im Cleanup-5-Manifest als `KEEP_CURRENT` aufgefuehrt und wird in neuen Chat-Startprompts als Pflichtdatei verlangt.

## Kandidatenlage

| Kategorie | Anzahl | Aktion in Cleanup 6 |
| --- | ---: | --- |
| KEEP_CURRENT | 15 | bleibt in `docs/current/` |
| ARCHIVE_OR_MERGE | 1033 | noch nicht automatisch verschieben; naechster Step kann daraus ein exaktes Move-Manifest bauen |
| DELETE_OR_REGENERATE | 0 | keine Deletes in diesem Step |
| REVIEW_MANUALLY | 40 | nicht blind anfassen |

## Warum kein Massen-Move in Cleanup 6?

Der Restbestand ist gross und fachlich gemischt. Ein automatischer Move waere zu riskant, weil noch echte aktuelle Fach-Doku zwischen historischen Handoffs liegen kann. Cleanup 6 baut deshalb die exakte Klassifikation und repariert nur den klaren `KEEP_CURRENT`-Fehler.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST`

Ziel:

- aus `ARCHIVE_OR_MERGE` ein exaktes Move-Manifest bauen,
- eindeutige Alt-Doku nach `docs/archive/docs-current-cleanup-7/` verschieben,
- fachlich wichtige Inhalte in zentrale Current-Dokus ueberfuehren,
- `REVIEW_MANUALLY` weiter unangetastet lassen, bis sie gelesen wurde.
