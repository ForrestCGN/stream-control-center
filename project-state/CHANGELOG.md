# Changelog

## RDAP Docs Cleanup 9

- Finalen Current-Docs-Rescan nach Cleanup 8 vorbereitet.
- 13 abgeschlossene Cleanup-/Prompt-Dateien als Archiv-Kandidaten klassifiziert.
- Zielarchiv: `docs/archive/docs-current-cleanup-9/`.
- PowerShell-Script `tools/cleanup/rdap-docs-cleanup-9-current-docs-final-rescan.ps1` vorbereitet.
- Script laeuft standardmaessig als Dry-Run und verschiebt nur mit `-Execute`.
- Erwarteter Endbestand in `docs/current/` nach Execute: 20 Dateien.
- Keine harten Deletes.
- Keine automatischen Merges.
- Keine Code-, DB- oder Webserver-Aenderungen.

## RDAP Docs Cleanup 8

- Die 40 `REVIEW_MANUALLY`-Dateien einzeln bewertet.
- 31 Dateien nach `docs/archive/docs-current-cleanup-8/` vorbereitet.
- 9 Dateien bleiben bewusst in `docs/current/`.
- Keine Merges, keine Deletes, keine Code-, DB- oder Webserver-Aenderungen.

## RDAP Docs Cleanup 7

- Exaktes Move-Manifest aus der Cleanup-6-Kategorie `ARCHIVE_OR_MERGE` vorbereitet.
- Umfang: 1033 Dateien.
- Zielarchiv: `docs/archive/docs-current-cleanup-7/`.
- Keine harten Deletes.
- `KEEP_CURRENT` und `REVIEW_MANUALLY` blieben unangetastet.

## Version 0.1.3

- OBS-Status read-only hinzugefuegt.
- Lokale TCP-Port-Erreichbarkeit fuer OBS WebSocket vorbereitet.
- Keine OBS-Anmeldung, keine OBS-Abfrage, keine Steuerung.
- Dashboard zeigt OBS-Status aus Komponentenstatus.
