Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58F - Media Index Diff ModifiedAt Soft-Match Policy`

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
- 0.2.58F klassifiziert bekannte 1h/2h modifiedAt-Offsets als Soft-Match, wenn keine weiteren harten Unterschiede vorliegen.

Route:

```text
GET /api/remote/media/index/diff/status
```

0.2.58F Zweck:
- `modified_at_changed` bleibt sichtbar.
- Bekannte 1h/2h-Timestamp-Offsets werden zusaetzlich als `soft_modified_at_offset_only` klassifiziert.
- `hardChangedOnAgentCount` trennt echte harte Changes von Soft-Timestamp-Abweichungen.
- Weiterhin read-only.

Sicherheit:
- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58F.md`
2. `docs/current/RDAP_0.2.58F_MEDIA_INDEX_DIFF_MODIFIED_AT_SOFT_MATCH_POLICY.md`
3. `docs/current/RDAP_0.2.58E_MEDIA_INDEX_DIFF_MODIFIED_AT_DB_DIAGNOSTIC.md`
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
Webserver-Test bewerten. Wenn `hardChangedOnAgentCount=0` und `softModifiedAtOnlyCount=120`, Delta-Upsert nicht aus `modifiedAt` ableiten. Danach echten gated Delta-Upsert fuer Hard-Changes separat planen.
