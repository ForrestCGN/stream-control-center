Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58D - Media Agent Inventory Sync Reconnect Diagnostic`

Bestaetigter Stand:
- 0.2.56A zeigt im Remote-Modboard die Online-DB-Read-Source korrekt.
- Media-System zeigt 333 Medien aus `remote_media_index`.
- 0.2.57 hat Delta-Sync/Loeschstatus geplant.
- 0.2.58 fuegt eine read-only Diff-Diagnose hinzu.
- 0.2.58A normalisiert den Diff-Metadatenvergleich robuster.
- 0.2.58B verhindert falsche Missing-/Loeschstatus-Schluesse bei leerem Agent-Snapshot.
- 0.2.58C zeigt eine Agent-Snapshot-Diagnose in der Diff-Route.
- 0.2.58D verbessert den lokalen Agent: Media-Inventory Initial-Retry nach WSS-Open plus Diagnosefelder.

Wichtig:
- 0.2.58D betrifft lokal `backend/modules/remote_agent.js`.
- Webserver-DB-Code wurde nicht geaendert.
- Keine Online->Agent-Aktion.
- Keine DB-Writes.
- Keine Datei-Inhalte, keine absoluten Pfade.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58D.md`
2. `docs/current/RDAP_0.2.58D_MEDIA_AGENT_INVENTORY_SYNC_RECONNECT_DIAGNOSTIC.md`
3. `docs/current/RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_STATUS_DIAGNOSTIC.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`

Naechster sinnvoller Schritt:
Nach lokalem Agent-Neustart/Reconnect Webserver-Diff erneut pruefen. Wenn Agent-Snapshot verfuegbar ist, Diff-Ergebnis bewerten. Danach gated Delta-Upsert separat planen.
