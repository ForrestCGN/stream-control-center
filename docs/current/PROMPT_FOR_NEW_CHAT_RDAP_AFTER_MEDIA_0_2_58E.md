Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58E - Media Index Diff ModifiedAt DB Diagnostic`

Bestaetigter Stand:
- 0.2.56A zeigt im Remote-Modboard die Online-DB-Read-Source korrekt.
- Media-System zeigt 333 Medien aus `remote_media_index`.
- 0.2.57 hat Delta-Sync/Loeschstatus geplant.
- 0.2.58 fuegt eine read-only Diff-Diagnose hinzu.
- 0.2.58A normalisiert den Diff-Metadatenvergleich robuster.
- 0.2.58B verhindert falsche Missing-/Loeschstatus-Schluesse bei leerem Agent-Snapshot.
- 0.2.58C zeigt eine Agent-Snapshot-Diagnose in der Diff-Route.
- 0.2.58D verbessert lokal den Agent Initial-Media-Inventory-Sync.
- 0.2.58E zeigt `modifiedAt`-Delta-Details zwischen Agent und DB.

Route:

```text
GET /api/remote/media/index/diff/status
```

0.2.58E Zweck:
- `changedOnAgent` Preview zeigt `agentModifiedAt`, `dbModifiedAt`, `modifiedAtDeltaMs`, `modifiedAtDeltaAbsMs`.
- `counts.modifiedAtDeltaStats` zeigt min/max/avg und Vorzeichen-Verteilung.
- Weiterhin read-only.

Sicherheit:
- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58E.md`
2. `docs/current/RDAP_0.2.58E_MEDIA_INDEX_DIFF_MODIFIED_AT_DB_DIAGNOSTIC.md`
3. `docs/current/RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_STATUS_DIAGNOSTIC.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller Schritt:
Nach Webserver-Test die `modifiedAtDeltaStats` bewerten. Erst danach Delta-Upsert planen; Tombstone/Loeschstatus bleibt separat.
