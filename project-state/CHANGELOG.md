# CHANGELOG - stream-control-center

## 2026-05-11 - STEP232 Project Docs Cleanup & Sorting

- Bereitgestelltes Projekt-Doku-ZIP analysiert.
- Doku-/Projektstatus-Struktur neu sortiert.
- `docs/current/CURRENT_SYSTEM_STATUS.md` als kompakte aktuelle Arbeitsbasis neu aufgebaut.
- Neue Orientierungsdatei erstellt: `docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md`.
- Neue Cleanup-Plan-Datei erstellt: `docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md`.
- `project-state/CURRENT_STATUS.md`, `NEXT_STEPS.md`, `FILES.md` und `CHANGELOG.md` auf aktuellen Stand verdichtet.
- Message-Rotator-STABLE-Stand nach Livetest als abgeschlossen dokumentiert.
- Keine Code-Dateien, keine Datenbank, keine Configs und keine Runtime-Dateien geaendert.
- Historische Dateien wurden nicht geloescht oder verschoben.

## 2026-05-11 - STEP231 Message-Rotator Livetest Abschluss

- Message-Rotator als stabil dokumentiert.
- Backend-Settings ueber `message_rotator_settings` bestaetigt.
- Textvarianten ueber `module_text_variants` / `module = message_rotator` bestaetigt.
- Dashboard-Bearbeitung fuer Settings und Nachrichten bestaetigt.
- Livetest im Stream lief erfolgreich.

## 2026-05-11 - STEP230B Message-Rotator Dashboard Modul

- Dashboard-Modul fuer Message-Rotator hinzugefuegt.
- Modul unter `System -> Message-Rotator` aktiviert.
- Status, Settings, Items, Nachrichtenvarianten und Integration-Check im Dashboard verfuegbar.
- Dashboard nutzt Backend-APIs und greift nicht direkt auf DB/Dateien zu.

## 2026-05-11 - STEP230A Message-Rotator DB Text Runtime

- Runtime-Ausgaben des Message-Rotators auf DB-Textvarianten umgestellt.
- Quelle: `module_text_variants`, `module = message_rotator`.
- JSON bleibt Fallback.
- Integration-Check zeigt `source = database_variants_with_json_fallback`.

## 2026-05-11 - STEP229 Message-Rotator Backend Admin Basis

- Message-Rotator um DB-Settings ueber `helper_settings` erweitert.
- Tabelle `message_rotator_settings` vorbereitet.
- Admin-Routen fuer Settings und Texte ergaenzt:
  - `/api/message-rotator/admin/settings`
  - `/api/message-rotator/admin/texts`
- Keine bestehende Runtime-Funktion entfernt.

## Historie

Die aeltere ausfuehrliche STEP-Historie bleibt in den einzelnen `project-state/STEP*.md` Dateien erhalten. Dieses Changelog ist ab STEP232 bewusst als kompakte aktuelle Arbeitschronik gehalten.
