# Kanalpunkte-System – Operation Cleanup Consolidated

Stand: STEP508 / Dashboard UI 1.0.0 / Backend 0.8.8

## Ziel

Dieser Block räumt die Kanalpunkte-Bedienung wieder auf und hält die normale Logik bewusst einfach.

## Verbindliche Bedienlogik

- Reward inaktiv: wird nicht ausgeführt.
- Reward aktiv und Aktion vollständig: kann bei Einlösung ausgeführt werden.
- Reward ohne Aktion: darf nicht aktiviert werden und wird nicht ausgeführt.

Es gibt keine zusätzliche Bedienfreigabe über Shadow-, Live-, Armed-, Allowlist- oder Dryrun-Zustände.

## Dashboard

Normale Bedienbereiche:

- Rewards
- Übersicht
- Einlösungen
- Statistik
- Import
- Diagnose

Test-/Preview-Werkzeuge bleiben in der Diagnose und sind nicht Teil des normalen Betriebs.

## Import

Der Importbereich liest vorhandene Twitch-Rewards lokal ein. Twitch selbst wird in diesem Schritt nicht verändert. Neu importierte Rewards bleiben lokal inaktiv, bis eine Aktion konfiguriert wurde.

## DB-Regel

Das Modul nutzt weiterhin den zentralen `../core/database` Helper. Keine eigene SQLite-Datei, keine eigene DB-Anbindung, keine neue Migration in diesem Block.

## Geänderte Dateien

- `backend/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`
- `docs/modules/channelpoints_operation_cleanup_consolidated.md`
