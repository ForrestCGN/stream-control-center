# RDAP 0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan

## Zweck

Dieser Step dokumentiert einen sicheren Testplan fuer den naechsten RDAP-Block:

```text
RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN
```

Es handelt sich bewusst um einen Read-only-/Plan-Step.

In diesem Step werden keine produktiven Writes ausgefuehrt, keine DB-Zeilen veraendert, keine Dateien geloescht, keine Gates aktiviert und kein echter Tombstone-Write gestartet.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.60 - Media Index Persistent Tombstone Noop Execute with Gates bestaetigt
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Vorhandene Routen:

```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter Kandidatenstand:

```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```

Bestaetigter finaler Gate-Zustand nach 0.2.60:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

## Grundentscheidung

TTS-generated Dateien unter `sounds/tts/generated/**` sind temporaer und werden nicht dauerhaft synchronisiert.

TTS-generated war ein Sonderfall und wurde bereits per gated Soft-Delete bereinigt.

Normale persistente Media-Dateien duerfen nicht blind geloescht oder tombstoned werden.

Persistent Tombstone bleibt nur fuer belastbares Missing-on-Agent aus vollstaendigem Full-Sync-Compare erlaubt.

## Systemtrennung

### Remote-Modboard / Webserver

Remote-Modboard ist die Online-/Server-Seite.

Zustaendig fuer:

```text
- remote_media_index
- Diff-Status
- Persistent Tombstone Preview
- Persistent Tombstone Execute-Foundation
- Gates
- Confirm
- Audit
- Readback
```

Interne URL:

```text
http://127.0.0.1:3010
```

Live-URL:

```text
https://mods.forrestcgn.de/
```

### Lokales Dashboard / Agent / Stream-PC

Der lokale Stream-PC und das lokale Dashboard bleiben die kontrollierte lokale Quelle fuer Media-Inventories und Full-Sync-Compare.

Zustaendig fuer:

```text
- lokaler Media-Scan
- lokaler Agent
- Full-Sync Payload zum Webserver
- lokaler Dashboard-Status
```

Lokale URL:

```text
http://127.0.0.1:8080
```

Wichtig:

```text
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.
- Kein Upload/Edit/Delete-Scope in diesem Block.
```

## Ziel fuer einen echten Kandidaten-Test

Ein echter persistent missing Candidate darf nur kontrolliert entstehen.

Der Test muss beweisen:

```text
- Full-Sync-Compare ist vollstaendig.
- Der Agent meldet die Test-Datei bewusst nicht mehr.
- Die Online-DB enthaelt genau einen erwarteten persistenten Media-Eintrag.
- Die Preview zeigt genau diesen Kandidaten.
- expectedCandidateCount passt exakt.
- Vor einem spaeteren Write existiert ein Backup/Rollback-Konzept.
- Nach einem spaeteren Write waere Readback/Audit pruefbar.
```

In 0.2.61 wird das nur geplant, nicht ausgefuehrt.

## Testvarianten

### Variante A: Echte dedizierte Test-Media-Datei

Bevorzugte Variante fuer spaeter, weil sie fachlich am naechsten an der echten Nutzung liegt.

Prinzip:

```text
1. Dedizierte Test-Datei in einem normalen persistenten Media-Bereich anlegen.
2. Full-Sync mit Datei laufen lassen, sodass sie in remote_media_index existiert.
3. Datei kontrolliert aus dem lokalen Agent-Inventar entfernen oder ausblenden.
4. Full-Sync-Compare erneut vollstaendig laufen lassen.
5. Preview muss genau 1 persistenten Tombstone-Kandidaten zeigen.
```

Sicherheitsbedingungen:

```text
- Nur eindeutig benannte Test-Datei, keine echte Produktiv-Media.
- Vorher Backup der Datei.
- Vorher DB-Readback der konkreten ID.
- Keine echte Datei loeschen, solange nicht separat erlaubt.
- Falls Datei temporaer verschoben wird: Zielpfad dokumentieren und Rueckverschiebung pruefen.
- Keine Gates aktivieren.
- Kein Execute in diesem Plan-Step.
```

Beispiel fuer einen spaeteren sicheren Testnamen:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Diese Datei existiert in diesem Step nicht automatisch und wird durch diesen Step nicht angelegt.

Bewertung:

```text
Vorteil: realistischer Test.
Risiko: lokale Datei-/Inventory-Aenderung noetig.
Freigabe erforderlich: ja, separat.
```

### Variante B: Kontrollierte Test-DB-Zeile

Nur spaeter und nur mit ausdruecklicher Freigabe.

Prinzip:

```text
1. Vorher MariaDB-Backup erstellen und pruefen.
2. Eine klar erkennbare Test-Zeile in remote_media_index eintragen.
3. Full-Sync-Compare vollstaendig laufen lassen, ohne diese ID im Agent-Snapshot.
4. Preview muss genau diese Test-Zeile als persistent missing zeigen.
5. Kein Execute ohne separaten Freigabe-Step.
```

Sicherheitsbedingungen:

```text
- Kein INSERT/UPDATE in 0.2.61.
- Test-ID muss eindeutig sein.
- Vorher Backup mit mysqldump.
- Nach Test Rollback/DELETE der Test-Zeile nur nach Freigabe.
- Audit/Readback spaeter getrennt pruefen.
```

Bewertung:

```text
Vorteil: lokale echte Media-Datei muss nicht angefasst werden.
Risiko: DB-Write fuer Testdaten.
Freigabe erforderlich: ja, separat.
```

### Variante C: Reine Simulation ohne DB-/Datei-Write

Sicherste Variante, wenn ausreichend.

Prinzip:

```text
1. Bestehende Preview-/Diff-Logik read-only pruefen.
2. Full-Sync-Compare-Status, DB-Total und CandidateCount dokumentieren.
3. Kein Kandidat wird kuenstlich erzeugt.
4. Es wird nur bestaetigt, dass 0.2.59/0.2.60 korrekt blockiert und bei 0 Kandidaten Noop bleibt.
```

Sicherheitsbedingungen:

```text
- Keine Dateiaktion.
- Kein DB-Write.
- Keine Gates.
- Kein Execute ausser bereits bestaetigter Noop-Logik mit expectedCandidateCount=0.
```

Bewertung:

```text
Vorteil: maximal sicher.
Nachteil: prueft keinen echten Kandidaten mit candidateCount=1.
Freigabe erforderlich: nein, solange nur read-only.
```

## Empfohlene naechste Entscheidung

Fuer den naechsten echten Test sollte zuerst entschieden werden:

```text
Variante A: echte dedizierte Test-Media-Datei
oder
Variante B: kontrollierte Test-DB-Zeile
oder
Variante C: weiterhin nur Read-only-Simulation
```

Empfehlung:

```text
Variante A ist fachlich am saubersten, aber nur mit ausdruecklicher Freigabe fuer eine dedizierte Testdatei.
Variante C bleibt die sicherste Sofortvariante.
Variante B nur nutzen, wenn eine DB-Testzeile gewollt ist und Backup/Rollback vorher bestaetigt wurde.
```

## Pflichtchecks vor jedem spaeteren Write-Test

Vor einem echten Tombstone-Write muss zwingend vorliegen:

```text
- aktueller Preview-Output
- persistentMediaMissingCandidateCount
- previewPersistentCandidateCount
- candidateIds / konkrete Test-ID
- expectedCandidateCount exakt gleich CandidateCount
- confirmWrite:true
- confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"
- local-only Request
- MEDIA_INDEX_WRITE_ENABLED=true
- MEDIA_INDEX_DATA_WRITE_ENABLED=true
- MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true
- Backup/Rollback bestaetigt
- Audit-Readback geplant
- Readback nach Execute geplant
```

## Was weiterhin verboten bleibt

```text
- kein Hard-Delete
- kein physisches Loeschen
- kein Auto-Delete
- kein Blind-Sync
- kein Online->Agent-Trigger
- keine Upload/Edit/Delete-Funktion
- keine produktive DB-Aenderung ohne separaten Freigabe-Step
- keine lokale Datei loeschen ohne ausdrueckliche Freigabe
```

## Read-only Pruefbefehle fuer aktuellen Stand

Webserver intern:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .missingClassification, .reliability'
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .counts, .reliability, .preview'
```

Gate-Zustand nur maskiert/gezielt pruefen:

```bash
systemctl show scc-remote-modboard.service -p Environment | tr ' ' '\n' | grep -E 'MEDIA_INDEX_WRITE_ENABLED|MEDIA_INDEX_DATA_WRITE_ENABLED|MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED'
```

Erwartet nach 0.2.60:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

## Abschluss 0.2.61

Dieser Step ist abgeschlossen, wenn:

```text
- dieser Testplan im Repo liegt
- project-state-Dateien auf 0.2.61 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.61 vorhanden ist
- keine Source-Datei geaendert wurde
- kein Webserver-Deploy erfolgt ist
- keine Gates aktiviert wurden
- keine DB-/Dateiaktion ausgefuehrt wurde
```
