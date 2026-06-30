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
`0.2.63 - Media Index Persistent Tombstone Readonly Simulation Check bestaetigt`

Zuletzt bestaetigte Code-Basis:

```text
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigte Routen:

```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

0.2.62-Entscheidung:

```text
Variante C zuerst: reine Simulation / Read-only-Diagnose
```

0.2.63-Webserver-Read-only-Check bestaetigt:

Diff-Status:

```text
agentTotal = 120
remoteDbTotal = 332
matchedCount = 120
newOnAgentCount = 0
changedOnAgentCount = 120
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
softChangedOnAgentCount = 120
missingOnAgentReliable = true
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
readOnly = true
writesEnabled = false
```

Reliability:

```text
fullSyncComparePrepared = true
fullSyncCompareAvailable = true
fullSyncCompareComplete = true
fullSyncCompareMissingOnAgentReliable = true
agentSnapshotTruncated = true
databaseSnapshotTruncated = false
missingOnAgentReliable = true
note = Full-Sync-Compare-Snapshot ist vollstaendig; Missing-Diagnose ist trotz gekuerztem Compact-Agent-Snapshot read-only belastbar.
```

Preview:

```text
persistentMediaMissingCandidateCount = 0
ttsGeneratedTempCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
previewPersistentCandidateCount = 0
persistentTombstoneCandidates = []
```

Gate-Check:

```text
systemctl show ... | grep MEDIA_INDEX...
=> keine Ausgabe
```

Bewertung:

```text
Die drei Gate-Variablen sind aktuell nicht gesetzt bzw. nicht aktiv.
Nicht gesetzt ist sicher, weil der Code nur true/1/yes/on als aktiv wertet.
```

Wichtige fachliche Entscheidung:
- TTS-generated Dateien unter `sounds/tts/generated/**` sind temporaer und werden nicht dauerhaft synchronisiert.
- TTS-generated war ein Sonderfall und wurde bereits per gated Soft-Delete bereinigt.
- Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
- Persistent Tombstone bleibt nur fuer belastbares Missing-on-Agent aus vollstaendigem Full-Sync-Compare.
- Variante C ist bestaetigt, prueft aber keinen echten `candidateCount=1`-Fall.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK_CONFIRMED.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_63.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
   - `backend/modules/remote_agent.js` nur wenn lokale Testdatei/Agent-Testdaten geplant werden

Naechster sinnvoller RDAP-Block:

```text
RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN
```

Ziel fuer 0.2.64:
- Entscheiden, ob ein echter `candidateCount=1`-Test vorbereitet wird.
- Bevorzugt: dedizierte Test-Media-Datei, keine echte Produktiv-Media.
- Alternative: kontrollierte Test-DB-Zeile nur mit Backup/Rollback und ausdruecklicher Freigabe.
- Kein produktiver Write in 0.2.64 ohne separaten Freigabe-Step.
- Kein physisches Loeschen.
- Keine Gates aktivieren.
- Kein Execute ausfuehren.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

Nicht tun ohne ausdrueckliches neues `go`:
- keine DB-Zeile veraendern
- keine Datei loeschen
- keine Testdatei anlegen oder verschieben
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
