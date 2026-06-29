Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Aktueller Stand: `0.2.58G - Media Index Diff Effective Change Counts`

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
- 0.2.58F klassifiziert bekannte 1h/2h modifiedAt-Offsets als Soft-Match.
- 0.2.58G trennt Strict-Counts von Effective-Counts.

Route:

```text
GET /api/remote/media/index/diff/status
```

0.2.58G Zweck:
- `changedOnAgentCount` bleibt kompatibel strict.
- `effectiveChangedOnAgentCount` zeigt nur harte Changes.
- `effectiveUnchangedCount` zaehlt echte Unchanged plus Soft-Timestamp-only Matches.
- `previews.effectiveChangedOnAgent` zeigt nur harte relevante Changes.
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
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58G.md`
2. `docs/current/RDAP_0.2.58G_MEDIA_INDEX_DIFF_EFFECTIVE_CHANGE_COUNTS.md`
3. `docs/current/RDAP_0.2.58F_MEDIA_INDEX_DIFF_MODIFIED_AT_SOFT_MATCH_POLICY.md`
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
Webserver-Test bewerten. Wenn `effectiveChangedOnAgentCount=0`, ist aktuell kein Delta-Upsert noetig. Danach gated Delta-Upsert fuer echte Hard-Changes separat planen.
