Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:

* Masterprompt lesen und anwenden.
* GitHub/dev ist Wahrheit.
* Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
* Keine ZIPs vor `go`.
* Keine Funktionalitaet entfernen.
* Keine Mini-Steps ohne Not. Schritte so gross wie sinnvoll und so klein wie sicher noetig.

Repository:

* GitHub: `ForrestCGN/stream-control-center`
* Branch: `dev`
* Lokales Repo: `D:\Git\stream-control-center`
* Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
* Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
* Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand:

```text
0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan
```

Wichtig: 0.2.61 ist ein Doku-/Plan-Step.

Es wurden keine Source-Dateien geaendert, keine DB-Zeilen veraendert, keine Dateien geloescht, keine Gates aktiviert und kein echter Tombstone-Write ausgefuehrt.

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

Bestaetigter 0.2.60-Stand:

* Execute-Route vorhanden.
* Execute ist local-only.
* Execute braucht `confirmWrite:true`.
* Execute braucht `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"`.
* Execute braucht `expectedCandidateCount`.
* Execute braucht alle drei Gates:
  * `MEDIA_INDEX_WRITE_ENABLED=true`
  * `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  * `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
* Noop-Execute mit temporaer aktivierten Gates und `expectedCandidateCount=0` wurde bestaetigt.
* Gates wurden danach wieder deaktiviert.
* Kein DB-Write im Noop.
* Kein Soft-Delete im Noop.
* Kein Hard-Delete.
* Kein physisches Loeschen.
* Kein Online->Agent-Trigger.

Aktueller Kandidatenstand nach 0.2.60:

```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```

Bestaetigter finaler Gate-Zustand:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Wichtige fachliche Entscheidung:

* TTS-generated Dateien unter `sounds/tts/generated/**` sind temporaer und werden nicht dauerhaft synchronisiert.
* TTS-generated war ein Sonderfall und wurde bereits per gated Soft-Delete bereinigt.
* Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
* Persistent Tombstone bleibt nur fuer belastbares Missing-on-Agent aus vollstaendigem Full-Sync-Compare.
* Kein Auto-Delete.
* Kein Hard-Delete.
* Kein physisches Loeschen.
* Kein Online->Agent-Trigger.

Systemtrennung:

* Remote-Modboard/Webserver ist zustaendig fuer Online-DB, Diff, Preview, Execute-Foundation, Gates, Confirm, Audit und Readback.
* Lokales Dashboard/Agent/Stream-PC ist zustaendig fuer lokale Media-Scans, Full-Sync-Payloads und lokale Statusdaten.
* Kein Online->Agent-Trigger.
* Kein Remote-Ausloesen lokaler Dateiaktionen.
* Kein Loeschen lokaler Dateien vom Modboard aus.
* Kein Upload/Edit/Delete-Scope in diesem Block.

0.2.61-Testplan:

* Variante A: echte dedizierte Test-Media-Datei spaeter separat freigeben.
* Variante B: kontrollierte Test-DB-Zeile nur spaeter mit Backup/Rollback und ausdruecklicher Freigabe.
* Variante C: reine Simulation/Read-only-Diagnose ohne DB-/Datei-Write.
* Empfehlung: Variante A ist fachlich am saubersten, Variante C am sichersten, Variante B nur wenn DB-Testdaten ausdruecklich gewollt sind.

Bitte im neuen Chat zuerst lesen:

1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_61.md`
9. relevante Source-Dateien aus GitHub/dev:
   * `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   * `remote-modboard/backend/src/services/agent-runtime.service.js`
   * `remote-modboard/backend/src/services/db.service.js`
   * `remote-modboard/backend/src/services/admin-confirm-write.service.js`

Naechster sinnvoller RDAP-Block:

```text
RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION
```

Ziel fuer 0.2.62:

* Entscheiden, ob echter Kandidat ueber Test-Media-Datei, Test-DB-Zeile oder weiterhin nur Simulation geprueft wird.
* Vor jeder Aktion Backup/Rollback konkretisieren.
* Keine produktiven Writes ohne separaten Freigabe-Step.
* Keine Gates aktivieren, bevor der konkrete Test eindeutig geplant und freigegeben ist.
* Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

Nicht tun ohne ausdrueckliches neues `go`:

* keine DB-Zeile veraendern
* keine Datei loeschen
* keinen echten Tombstone-Write ausfuehren
* keine Gates aktivieren
* keinen Online->Agent-Trigger bauen
* keinen Hard-Delete bauen
* keine Upload/Edit/Delete-Funktion bauen
* keine lokale Dashboard-Steuerung fuer Remote-Writes bauen

Wenn weitergearbeitet wird:

1. Erst GitHub/dev und Dokus lesen.
2. Dann kurze Planung mit Ziel, Dateien, Risiken, Nicht-Aenderungen, Tests.
3. Auf `go` warten.
4. Dann vollstaendige Ersatzdateien als ZIP mit echten Zielpfaden liefern.
