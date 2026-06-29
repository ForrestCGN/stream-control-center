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

Aktueller RDAP-Stand: `0.2.58I - Media Full-Sync Read-only Compare Snapshot`.

Dieser Prompt ist der Handoff nach dem bestaetigten Webserver-Test von 0.2.58I.
Forrest arbeitet vor dem naechsten RDAP-Step ggf. erst am Alert-System. Fuer Alert-Arbeiten ebenfalls zuerst Masterprompt und relevante Dateien lesen.

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
- 0.2.58I: Full-Sync-Chunks werden read-only in-memory als Compare-Snapshot gepuffert und Webserver-Test bestaetigt.

0.2.58I Statusmarker:

```text
rdap_media_index_diff_full_sync_compare_snapshot_058i.v1
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

Bestaetigter Webserver-Test 0.2.58I:

```text
fullSyncCompare.prepared = true
fullSyncCompare.readOnly = true
fullSyncCompare.available = true
fullSyncCompare.complete = true
fullSyncCompare.receivedItems = 332
fullSyncCompare.totalItems = 332
fullSyncCompare.missingOnAgentReliable = true
```

Bestaetigte Full-Sync-Compare-Counts:

```text
agentTotal = 332
remoteDbTotal = 333
matchedCount = 332
newOnAgentCount = 0
changedOnAgentCount = 332
strictChangedOnAgentCount = 332
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
softChangedOnAgentCount = 332
softModifiedAtOnlyCount = 332
effectiveNoopChangedOnAgentCount = 332
missingOnAgentCount = 1
missingOnAgentReliable = true
effectiveUnchangedCount = 332
metadataCompareWarnings = 0
writesEnabled = false
```

Bestaetigter Missing-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

Einordnung:
- TTS-Sprachdateien sind laut Nutzer eigentlich temporaer.
- Der Missing-Eintrag liegt unter `sounds:tts/generated/...`.
- Der Befund ist plausibel, aber weiterhin nur Diagnose.

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
1. Masterprompt / `MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58I.md`
3. `docs/current/RDAP_0.2.58I_FINAL_STATUS_AFTER_FULL_SYNC_COMPARE_CONFIRMED.md`
4. `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
5. `docs/current/RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN.md`
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
RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION
```

Ziel:
- Missing-Eintraege read-only klassifizieren.
- TTS generated temp files separat erkennen.
- `sounds:tts/generated/...` als moeglichen temporaeren Missing-Kandidaten markieren.
- Tombstone-Kandidatur nur diagnostisch ausgeben.
- Keine Writes.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

Alert-System-Hinweis:
Wenn vor RDAP am Alert-System gearbeitet wird, erst die dazu relevanten Docs/Code-Dateien aus GitHub/dev lesen und danach planen. RDAP 0.2.58J nicht vermischen mit Alert-Arbeiten.
