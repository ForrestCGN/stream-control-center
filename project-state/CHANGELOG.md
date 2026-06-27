# Changelog

## RDAP Docs Cleanup 8

- 40 `REVIEW_MANUALLY`-Dateien aus Cleanup 6 einzeln bewertet.
- 9 Dateien als `KEEP_CURRENT` bestaetigt.
- 31 Dateien als `ARCHIVE` klassifiziert und fuer Move nach `docs/archive/docs-current-cleanup-8/` vorbereitet.
- PowerShell-Script `tools/cleanup/rdap-docs-cleanup-8-review-manually.ps1` vorbereitet.
- Script laeuft standardmaessig als Dry-Run und verschiebt nur mit `-Execute`.
- Keine Merges in diesem Step.
- Keine harten Deletes.
- Keine Code-, DB- oder Webserver-Aenderungen.

## RDAP Docs Cleanup 7

- Exaktes Move-Manifest aus der Cleanup-6-Kategorie `ARCHIVE_OR_MERGE` vorbereitet.
- Umfang: 1033 Dateien.
- Zielarchiv: `docs/archive/docs-current-cleanup-7/`.
- PowerShell-Script `tools/cleanup/rdap-docs-cleanup-7-archive-or-merge.ps1` vorbereitet.
- Script laeuft standardmaessig als Dry-Run und verschiebt nur mit `-Execute`.
- Keine harten Deletes.
- `KEEP_CURRENT` bleibt unangetastet.
- `REVIEW_MANUALLY` bleibt unangetastet.
- Keine Code-, DB- oder Webserver-Aenderungen.

## RDAP Docs Cleanup 6

- Second-Pass-Audit fuer `docs/current/` nach Cleanup 5 vorbereitet.
- Verbliebenen `docs/current/`-Bestand in `KEEP_CURRENT`, `ARCHIVE_OR_MERGE`, `DELETE_OR_REGENERATE` und `REVIEW_MANUALLY` klassifiziert.
- Die versehentlich nach `docs/archive/docs-current-cleanup-5/` verschobene Pflichtdatei `RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md` wieder fuer `docs/current/` bereitgestellt.
- PowerShell-Script `tools/cleanup/rdap-docs-cleanup-6-second-pass.ps1` vorbereitet.
- Keine harten Deletes.
- Keine Massen-Moves in diesem Step.
- Keine Code-, DB- oder Webserver-Aenderungen.

## RDAP Docs Cleanup 5

- Historische `RDAP*`- und `NEXT_CHAT_PROMPT*`-Dateien aus `docs/current/` nach `docs/archive/docs-current-cleanup-5/` verschoben.
- Zielarchiv: `docs/archive/docs-current-cleanup-5/`.
- Keine harten Deletes in diesem Step.
- Keine Code-, DB- oder Webserver-Aenderungen.

## Version 0.1.3

- OBS-Status read-only hinzugefuegt.
- Lokale TCP-Port-Erreichbarkeit fuer OBS WebSocket vorbereitet.
- Keine OBS-Anmeldung, keine OBS-Abfrage, keine Steuerung.
- Dashboard zeigt OBS-Status aus Komponentenstatus.
