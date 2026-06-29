Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
GitHub/dev ist Wahrheit. Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten. Keine ZIPs vor `go`.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`
- Webserver Live-Pfad: `/opt/stream-control-center/remote-modboard`
- Webserver Deploy-Temp: `/opt/stream-control-center/_deploy_tmp`

Harte Trennung:
- Lokal / Stream-PC:
  - Port 8080
  - lokale Datei-/Media-Wahrheit
  - Agent/Adapter: `backend/modules/remote_agent.js` und lokale Schicht
  - keine Tests gegen 3010 lokal
- Webserver / Remote-Modboard:
  - Port 3010
  - Online-DB via `remote-modboard/backend/src/services/db.service.js`
  - nicht `backend/core/database.js`
  - nicht `backend/modules/sqlite_core.js`

Arbeitsweise:
1. Erst GitHub/dev und relevante Doku-/Code-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf explizites `go` warten.
4. Erst dann ZIP bauen.
5. ZIP mit echten Zielpfaden, kein Wrapper-Ordner.
6. Forrest spielt lokal ein mit:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
```

7. Danach lokale Checks/Syntax/git status.
8. Wenn sauber:

```powershell
.\stepdone.cmd "<Abschlussbeschreibung>"
```

9. Webserver-Deploy nur bei Remote-Modboard-Codeaenderungen, nicht bei Doku-only.

Aktueller Stand: `0.2.58H - Media Index Diff Full-Sync Effective Compare Plan`

Bestaetigter Verlauf:
- 0.2.56A: Remote-Modboard nutzt Online-DB-Read-Source korrekt.
- `remote_media_index` enthaelt 333 Medien.
- 0.2.57: Delta-Sync-/Loeschstatus-Konzept geplant.
- 0.2.58: read-only Diff-Diagnose Agent-Snapshot vs. `remote_media_index`.
- 0.2.58A: Diff-Metadatenvergleich normalisiert.
- 0.2.58B: Leerer Agent-Snapshot wird nicht als belastbarer Missing-/Loeschstatus bewertet.
- 0.2.58C: Agent-Snapshot-Diagnose in Diff-Route.
- 0.2.58D: Lokaler Agent sendet Media-Inventory initial robuster.
- 0.2.58E: modifiedAt-DB-Diagnose.
- 0.2.58F: bekannte 1h/2h modifiedAt-Offsets als Soft-Match klassifiziert.
- 0.2.58G: Strict-/Effective-Change-Counts getrennt.
- 0.2.58H: Full-Sync-/Compact-Snapshot-Verhaeltnis fuer Missing/Tombstone geplant und dokumentiert.

Zuletzt bestaetigter Webserver-Test 0.2.58G:

```text
status = diff_available_agent_snapshot_truncated
agentSnapshotDiagnostic.reason = agent_snapshot_available
mediaInventoryItems = 120
mediaInventoryTotalSeen = 333
mediaInventoryTruncated = true

agentTotal = 120
remoteDbTotal = 333
matchedCount = 120
newOnAgentCount = 0
changedOnAgentCount = 120
strictChangedOnAgentCount = 120
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
softChangedOnAgentCount = 120
softModifiedAtOnlyCount = 120
effectiveNoopChangedOnAgentCount = 120
effectiveUnchangedCount = 120
missingOnAgentCount = null
missingOnAgentReliable = false
```

Interpretation:
- Keine echten Hard-Changes.
- Aktuell kein Delta-Upsert noetig.
- 120 strict changes sind nur bekannte modifiedAt-Offsets.
- Missing/Tombstone nicht belastbar, weil Compact-Agent-Snapshot trunciert ist.
- Full-Sync sieht 332/333 Items, ist aber write-blocked/gate-geschuetzt.

0.2.58H klaert:
- `120/333` ist eine erwartete Compact-Transportbegrenzung.
- Der normale `media_inventory_sync` nutzt max. ca. 60 KB Payload und Limits `[120, 80, 40, 20]`.
- Full-Sync ist ein separater Chunk-Transport mit 50 Items pro Chunk.
- Bei deaktiviertem Write-Gate werden Full-Sync-Items nicht dauerhaft als vollstaendige Diff-Basis gespeichert.
- Missing/Tombstone darf weiterhin nicht aus dem Compact-Snapshot abgeleitet werden.
- Der naechste sinnvolle Code-Step ist ein read-only Full-Sync-Compare-Snapshot.

Sicherheit bleibt verbindlich:
- Keine DB-Writes ohne explizites Gate.
- Kein Upsert ohne eigenen Step.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger aus Webserver-Diagnose.

Bitte im neuen Chat zuerst lesen:
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58H.md`
2. `docs/current/RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN.md`
3. `docs/current/RDAP_0.2.58G_FINAL_STATUS_AFTER_EFFECTIVE_CHANGE_COUNTS.md`
4. `docs/current/RDAP_0.2.58G_MEDIA_INDEX_DIFF_EFFECTIVE_CHANGE_COUNTS.md`
5. `docs/current/RDAP_0.2.58F_MEDIA_INDEX_DIFF_MODIFIED_AT_SOFT_MATCH_POLICY.md`
6. `docs/current/RDAP_0.2.58E_MEDIA_INDEX_DIFF_MODIFIED_AT_DB_DIAGNOSTIC.md`
7. `project-state/CURRENT_STATUS.md`
8. `project-state/NEXT_STEPS.md`
9. `project-state/TODO.md`
10. `project-state/CHANGELOG.md`
11. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller Step:
`RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`

Ziel:
- Full-Sync-Chunks read-only als temporaere Vergleichsbasis puffern.
- Diff-/Diagnose-Route optional um Full-Sync-Compare-Felder erweitern.
- Missing nur dann als reliable markieren, wenn Full-Sync-Basis vollstaendig ist.
- Keine Writes.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.
