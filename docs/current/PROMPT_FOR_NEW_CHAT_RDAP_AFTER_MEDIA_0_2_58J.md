Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden: `MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt` bzw. der im Chat/Projekt bereitgestellte Masterprompt.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.

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
1. Erst Masterprompt, GitHub/dev und relevante Doku-/Code-Dateien lesen.
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

Aktueller RDAP-Stand: `0.2.58J - Media Index TTS Temp Missing Read-only Classification`.

Statusmarker:

```text
rdap_media_index_diff_tts_temp_missing_classification_058j.v1
RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION
```

0.2.58J baut auf dem bestaetigten Full-Sync-Compare aus 0.2.58I auf.

Bestaetigter 0.2.58I-Befund:

```text
fullSyncCompare.prepared = true
fullSyncCompare.readOnly = true
fullSyncCompare.available = true
fullSyncCompare.complete = true
fullSyncCompare.receivedItems = 332
fullSyncCompare.totalItems = 332
fullSyncCompare.missingOnAgentReliable = true
agentTotal = 332
remoteDbTotal = 333
missingOnAgentCount = 1
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
writesEnabled = false
```

Bestaetigter Missing-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

0.2.58J ergaenzt read-only:

```text
missingClassification
previews.ttsTempMissingCandidates
previews.tombstoneCandidatesDiagnostic
counts.ttsTempMissingCandidateCount
counts.tombstoneCandidateDiagnosticCount
```

Die gleichen Felder gibt es auch im `fullSyncCompare`-Block.

TTS-temp-Regel:

```text
rootKey = sounds
relativePath beginnt mit tts/generated/
extension ist Audio (.mp3/.wav/.ogg/.m4a)
```

Sicherheit bleibt verbindlich:
- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger aus Webserver-Diagnose.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt / `MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58J.md`
3. `docs/current/RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION.md`
4. `docs/current/RDAP_0.2.58I_FINAL_STATUS_AFTER_FULL_SYNC_COMPARE_CONFIRMED.md`
5. `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
6. `project-state/CURRENT_STATUS.md`
7. `project-state/NEXT_STEPS.md`
8. `project-state/TODO.md`
9. `project-state/CHANGELOG.md`
10. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Step:

```text
RDAP_0.2.58K_MEDIA_INDEX_TOMBSTONE_GATE_PLAN_READONLY
```

Ziel:
- Tombstone-/Loeschstatus nur planen.
- Gate/Confirm/Audit/Lock/Readback-Anforderungen dokumentieren.
- Weiterhin keine Writes, kein Upsert, kein Tombstone/Delete, kein Online->Agent-Trigger.
