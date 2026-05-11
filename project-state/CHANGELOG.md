## 2026-05-11 - STEP237 Hug/Rehug Command-Flow verifiziert

- Hug/Rehug Command-Flow per API geprueft.
- `/api/hug/command?command=hug...` funktioniert mit den Streamer.bot-relevanten Parametern.
- `/api/hug/command?command=rehug...` blockiert korrekt, wenn kein vorheriger Gegen-Hug existiert.
- `/api/hug/statscmd` und Toplisten funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug dokumentiert.
- Wichtige Ausgaberegel dokumentiert: `result.streamerbot_send` beachten, damit Streamer.bot keine Doppelposts erzeugt.
- Keine Code-, Config-, Dashboard- oder DB-Dateien geaendert.

---


## 2026-05-11 - STEP235 Hug/Rehug Ist-Analyse

- Hug/Rehug Live-API-Test dokumentiert.
- Acht Routen erfolgreich geprüft:
  - `/api/hug/status`
  - `/api/hug/integration-check`
  - `/api/hug/routes`
  - `/api/dashboard/community/hug/status`
  - `/api/dashboard/community/hug/text-pairs`
  - `/api/dashboard/community/hug/hug-all-texts`
  - `/api/dashboard/community/hug/response-texts`
  - `/api/dashboard/community/hug/top-title-texts`
- Integration-Check: 12 OK, 0 Warnungen, 0 Fehler.
- DB-/Config-/Textbestand fuer Hug/Rehug dokumentiert.
- Keine Code-, Config-, DB- oder Dashboard-Dateien geaendert.

# CHANGELOG - stream-control-center

## 2026-05-11 - STEP234 System Route Module Overview

- Frisches Quell-ZIP nach STEP233 analysiert.
- Aktive Backend-Module, Dashboard-Module, Config-Dateien und Routen erfasst.
- Neue Current-Dokumente erstellt:
  - `docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md`
  - `docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md`
  - `docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md`
  - `docs/current/PROJECT_DASHBOARD_MAP_2026-05-11.md`
- `CURRENT_SYSTEM_STATUS`, `CURRENT_STATUS`, `FILES` und `NEXT_STEPS` aktualisiert.
- Keine Code-, Config-, DB- oder Runtime-Dateien geändert.


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


## STEP233 - 2026-05-11 - Projekt-Doku Archivierung vorbereitet

- Archiv-Move-Script fuer alte Append-/Status-/Handoff-Doku-Fragmente erstellt.
- Manifest mit 187 geprüften Kandidaten erzeugt.
- Keine Inhalte gelöscht, nur geplante Verschiebung in Archivordner.
- Keine Code-, Config-, DB- oder Dashboard-Logik geändert.

## STEP236 - 2026-05-11 - Hug/Rehug Dashboard Insert-Fix

- `backend/modules/hug.js` korrigiert: Neue Hug-Dashboard-Texte und neue Hug/Rehug-Textpaare können wieder angelegt werden.
- Fehlerursache war ein überzähliger named parameter `id` bei INSERT-Statements.
- INSERT-Pfade in `saveHugTextItem()` und `saveTextPair()` verwenden jetzt bereinigte Parameterobjekte ohne `id`.
- Keine Änderung an Dashboard-Dateien, Core-DB-Schicht, Configs oder SQLite-Datei.
