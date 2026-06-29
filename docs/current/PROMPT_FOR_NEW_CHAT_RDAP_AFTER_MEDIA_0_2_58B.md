Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58B - Media Index Diff Agent Empty Unreliable`

Bestaetigter Stand:
- 0.2.56A zeigt im Remote-Modboard die Online-DB-Read-Source korrekt.
- Media-System zeigt 333 Medien aus `remote_media_index`.
- 0.2.57 hat Delta-Sync/Loeschstatus geplant.
- 0.2.58 fuegt eine read-only Diff-Diagnose hinzu.
- 0.2.58A normalisiert den Diff-Metadatenvergleich robuster.
- 0.2.58B verhindert falsche Missing-/Loeschstatus-Schluesse bei leerem Agent-Snapshot.

Route:

```text
GET /api/remote/media/index/diff/status
```

0.2.58B Zweck:
- Wenn Agent-Snapshot leer/nicht verfuegbar ist, gilt `missingOnAgent` nicht als belastbar.
- `missingOnAgentCount=null`.
- `missingOnAgentReliable=false`.
- `reliability.agentSnapshotUnavailable=true`.
- `status=diff_available_agent_snapshot_unavailable`.

Sicherheit:
- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58B.md`
2. `docs/current/RDAP_0.2.58B_MEDIA_INDEX_DIFF_AGENT_EMPTY_UNRELIABLE.md`
3. `docs/current/RDAP_0.2.58A_MEDIA_INDEX_DIFF_COMPARE_NORMALIZATION.md`
4. `docs/current/RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/media-readonly.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller Schritt:
`RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_RECOVERY_OR_SYNC_TRIGGER_PLAN`

Ziel:
- Klaeren, warum der Agent-Snapshot nach Restart leer ist.
- Read-only Status/Diagnose nutzen, keine Online->Agent-Dateiaktion.
- Erst danach Delta-Upsert planen.
