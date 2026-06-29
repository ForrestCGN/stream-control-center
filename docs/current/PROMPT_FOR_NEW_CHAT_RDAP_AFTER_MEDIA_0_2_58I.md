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

Aktueller Stand: `0.2.58I - Media Full-Sync Read-only Compare Snapshot`

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
- 0.2.58I: Full-Sync-Chunks werden read-only in-memory als Compare-Snapshot gepuffert.

0.2.58I Statusmarker:

```text
rdap_media_index_diff_full_sync_compare_snapshot_058i.v1
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

0.2.58I ergaenzt:
- `agent-runtime.service.js` puffert Full-Sync-Chunks in-memory als read-only Compare-Snapshot.
- `media-index-diff.routes.js` liefert zusaetzlich `fullSyncCompare`.
- Compact-Diff-Felder bleiben kompatibel erhalten.
- Missing wird im Full-Sync-Compare nur reliable, wenn Full-Sync vollstaendig und DB nicht trunciert ist.

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
1. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58I.md`
2. `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
3. `docs/current/RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN.md`
4. `docs/current/RDAP_0.2.58G_FINAL_STATUS_AFTER_EFFECTIVE_CHANGE_COUNTS.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller Step nach Test/Deploy:
- Full-Sync-Compare-Werte auswerten.
- DB-Read-Source UI final sichtpruefen.
- Gated Delta-Upsert fuer echte Hard-Changes separat planen.
- Tombstone/Delete nur mit eigenem Gate/Confirm/Audit/Lock planen.
