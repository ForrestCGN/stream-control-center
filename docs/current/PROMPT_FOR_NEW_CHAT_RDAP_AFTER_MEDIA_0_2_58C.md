Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58C - Media Index Diff Agent Snapshot Status Diagnostic`

Bestaetigter Stand:
- 0.2.56A zeigt im Remote-Modboard die Online-DB-Read-Source korrekt.
- Media-System zeigt 333 Medien aus `remote_media_index`.
- 0.2.57 hat Delta-Sync/Loeschstatus geplant.
- 0.2.58 fuegt eine read-only Diff-Diagnose hinzu.
- 0.2.58A normalisiert den Diff-Metadatenvergleich robuster.
- 0.2.58B verhindert falsche Missing-/Loeschstatus-Schluesse bei leerem Agent-Snapshot.
- 0.2.58C zeigt zusaetzlich eine Agent-Snapshot-Diagnose in der Diff-Route.

Route:

```text
GET /api/remote/media/index/diff/status
```

0.2.58C Zweck:
- `agentSnapshotDiagnostic` ergaenzen.
- Agent-Verbindung, Heartbeat, letzter Media-Inventory-Sync, Rejects und Full-Sync-State sichtbar machen.
- Ursache fuer leeren Snapshot ableiten:
  - `agent_not_connected`
  - `media_inventory_not_received_since_restart`
  - `media_inventory_empty`
  - `media_inventory_rejected`
  - `agent_snapshot_available`

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
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58C.md`
2. `docs/current/RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_STATUS_DIAGNOSTIC.md`
3. `docs/current/RDAP_0.2.58B_MEDIA_INDEX_DIFF_AGENT_EMPTY_UNRELIABLE.md`
4. `docs/current/RDAP_0.2.58A_MEDIA_INDEX_DIFF_COMPARE_NORMALIZATION.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `remote-modboard/backend/src/routes/agent-status.routes.js`
- `remote-modboard/backend/src/app.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller Schritt:
Agent-Snapshot anhand der Diagnose wieder belastbar machen bzw. Sync-Ablauf klaeren. Erst danach Diff-Ergebnis erneut bewerten und gated Delta-Upsert separat planen.
