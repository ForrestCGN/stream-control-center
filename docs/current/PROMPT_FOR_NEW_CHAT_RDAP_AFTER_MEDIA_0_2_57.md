Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.57 - Media Index Delta Sync Plan`

Bestaetigter Stand:
- 0.2.56A zeigt im Remote-Modboard die Online-DB-Read-Source korrekt.
- Media-System zeigt 333 Medien aus `remote_media_index`.
- Sync-Status zeigt 333 / 333, 100%, vollstaendig, DB Read-only.
- Agent-Memory-Fallback bleibt per `?source=agent` pruefbar.
- MEDIA_INDEX Write/Data/FullSync Gates sind deaktiviert.
- Upload/Edit/Delete ist aus.
- FileContent/AbsolutePath Writes sind aus.

0.2.57 ist ein Doku-/Plan-Step:
- Delta-Sync-Konzept beschrieben.
- Neue/geaenderte/fehlende/unveraenderte Dateien fachlich getrennt.
- Fehlende Dateien duerfen spaeter nicht blind geloescht werden.
- Tombstone/`deleted=1` nur spaeter mit eigenem Gate, Confirm, Audit/Lock und Readback.
- Naechster technischer Step sollte read-only Diff-Diagnose sein.

Sicherheit:
- Keine Runtime-Code-Aenderung.
- Keine DB-Writes.
- Keine Gate-Aktivierung.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
- Kein Webserver-Deploy fuer 0.2.57 noetig.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_57.md`
2. `docs/current/RDAP_0.2.57_MEDIA_INDEX_DELTA_SYNC_PLAN.md`
3. `docs/current/RDAP_0.2.56A_MEDIA_SYNC_STATUS_DB_SOURCE_UI.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-readonly.routes.js`
- `remote-modboard/backend/src/routes/routes.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/public/assets/modules/media/library.js`
- `htdocs/dashboard-v2/assets/modules/media/library.js`

Naechster sinnvoller Schritt:
`RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY`

Ziel:
- Read-only Diff-Diagnose Agent-Snapshot vs. `remote_media_index` planen/bauen.
- Nur Counts und sichere IDs/relative Pfade.
- Keine absoluten Pfade.
- Keine Datei-Inhalte.
- Keine DB-Writes.
- Keine Upload/Edit/Delete-Funktion.
