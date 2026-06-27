# RDAP Docs Cleanup 5 - Candidate Summary

Stand: 2026-06-27

## Ergebnis aus Cleanup 4

`docs/current` hatte im Scan weiterhin rund 1481 Dateien. Nur ein sehr kleiner Teil ist wirklich aktueller Start-/Arbeitsstand.

## Dieser Step

Dieser Step verschiebt zuerst nur die klar historischen Handoff-Dateien aus `docs/current`:

```text
RDAP*.md / RDAP_*.md: historische RDAP-Step-Doku
NEXT_CHAT_PROMPT*.md: alte Chat-Handoffs / Prompt-Staende
```

Anzahl exakter Move-Kandidaten: **400**.

## Warum Move statt Delete?

Die Dateien sind wahrscheinlich nicht mehr aktuelle Wahrheit, können aber als historische Nachvollziehbarkeit noch nützlich sein. Deshalb werden sie in diesem Step aus `docs/current` entfernt, aber unter `docs/archive/docs-current-cleanup-5/` behalten.

## Was danach übrig bleibt

Nach diesem Step bleiben die vielen fachlichen Alt-Dokus in `docs/current` noch vorhanden. Die werden in Cleanup 6 getrennt behandelt, weil dort manuelle Gegenprüfung wichtiger ist.

## Nächster Step

`RDAP_DOCS_CLEANUP_6_DOCS_CURRENT_REVIEW_BUCKETS`

Ziel:

- verbleibende `docs/current`-Dateien nach Themen-Buckets sortieren,
- echte Current-Doku behalten,
- alte CAN/EVS/LC/Diagnostics/Tagebuch-Dateien zusammenführen oder archivieren,
- keine aktiven Projektgrundlagen verlieren.
