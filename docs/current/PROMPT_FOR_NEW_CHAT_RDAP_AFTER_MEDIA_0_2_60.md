Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.
- Keine Mini-Steps ohne Not. Schritte so gross wie sinnvoll und so klein wie sicher noetig.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand:
`0.2.60 - Media Index Persistent Tombstone Noop Execute with Gates bestaetigt`

Zuletzt bestaetigte Code-Basis:
```text
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Vorhandene Routen:
```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter 0.2.59-Stand:
- Preview-/Statusroute fuer persistente Tombstone-Kandidaten vorhanden.
- Execute-Route vorhanden.
- Execute ist local-only.
- Execute braucht `confirmWrite:true`.
- Execute braucht `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"`.
- Execute braucht `expectedCandidateCount`.
- Execute braucht alle drei Gates:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
- Execute ist Soft-Delete-only vorbereitet.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Bestaetigte 0.2.60-Webserver-Tests:
1. POST ohne Body blockiert korrekt:
```text
reason = confirm_write_required
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
```

2. POST mit Confirm aber ohne Gates blockiert korrekt:
```text
reason = media_index_persistent_tombstone_write_gate_disabled
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
```

3. Noop-Execute mit temporaer aktivierten Gates und `expectedCandidateCount=0` bestaetigt:
```text
ok = true
reason = no_persistent_tombstone_candidates_to_soft_delete
expectedCandidateCount = 0
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
hardDeleteExecuted = false
physicalDeleteExecuted = false
readBackPerformed = true
readBackCandidateCount = 0
auditWritten = false
```

4. Gates danach wieder aus bestaetigt:
```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Aktueller Kandidatenstand:
```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```

Wichtige fachliche Entscheidung:
- TTS-generated Dateien unter `sounds/tts/generated/**` sind temporaer und werden nicht dauerhaft synchronisiert.
- TTS-generated war ein Sonderfall und wurde bereits per gated Soft-Delete bereinigt.
- Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
- Persistent Tombstone bleibt nur fuer belastbares Missing-on-Agent aus vollstaendigem Full-Sync-Compare.
- Kein Auto-Delete.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.60_MEDIA_INDEX_PERSISTENT_TOMBSTONE_NOOP_EXECUTE_WITH_GATES_CONFIRMED.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_60.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN
```

Ziel fuer 0.2.61:
- Kein produktiver Write.
- Kein kuenstliches Loeschen echter Media-Dateien ohne ausdrueckliche Freigabe.
- Sauber planen, wie ein echter persistenter Missing/Tombstone-Kandidat kontrolliert erzeugt oder simuliert wird.
- Erst Read-only Testplan mit Backup/Rollback.
- Klaeren, ob Test mit echter Test-Media-Datei, Test-DB-Zeile oder anderem sicheren Verfahren gemacht wird.
- Vor produktivem Write immer candidateCount, expectedCandidateCount, Gates, Confirm, Audit und Readback pruefen.

Nicht tun ohne ausdrueckliches neues `go`:
- keine DB-Zeile veraendern
- keine Datei loeschen
- keinen echten Tombstone-Write ausfuehren
- keine Gates aktivieren
- keinen Online->Agent-Trigger bauen
- keinen Hard-Delete bauen
- keine Upload/Edit/Delete-Funktion bauen

Wenn weitergearbeitet wird:
1. Erst GitHub/dev und Dokus lesen.
2. Dann kurze Planung mit Ziel, Dateien, Risiken, Nicht-Aenderungen, Tests.
3. Auf `go` warten.
4. Dann vollstaendige Ersatzdateien als ZIP mit echten Zielpfaden liefern.
