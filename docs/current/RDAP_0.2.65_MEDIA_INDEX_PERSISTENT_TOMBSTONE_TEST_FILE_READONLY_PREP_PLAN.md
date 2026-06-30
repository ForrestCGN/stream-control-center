# RDAP 0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan

## Zweck

Dieser Step dokumentiert die konkrete Read-only-Vorbereitung fuer die spaetere dedizierte Test-Media-Datei.

```text
RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN
```

0.2.65 ist bewusst ein Doku-/Plan-Step.

In diesem Step werden keine Source-Dateien geaendert, keine Testdatei angelegt, keine lokale Datei verschoben oder geloescht, keine DB-Zeile veraendert, keine Gates aktiviert und kein echter Tombstone-Write gestartet.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan
```

Gewaehlte Quelle fuer den spaeteren echten `candidateCount=1`-Test:

```text
A: dedizierte Test-Media-Datei
```

Reserve bleibt:

```text
B: kontrollierte Test-DB-Zeile nur falls Variante A nicht sauber steuerbar ist.
```

## Bestaetigte Basis

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

Bestaetigter Read-only-Stand aus 0.2.63/0.2.64:

```text
fullSyncComparePrepared = true
fullSyncCompareAvailable = true
fullSyncCompareComplete = true
fullSyncCompareMissingOnAgentReliable = true
missingOnAgentReliable = true
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
persistentTombstoneCandidates = []
writesEnabled = false
```

Gate-Zustand:

```text
MEDIA_INDEX_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_DATA_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED nicht gesetzt / nicht aktiv
```

Bewertung:

```text
Nicht gesetzt ist sicher, weil nur true/1/yes/on als aktiv zaehlt.
```

## Systemtrennung

Remote-Modboard/Webserver:

```text
- Online-DB
- Diff
- Preview
- Execute-Foundation
- Gates
- Confirm
- Audit
- Readback
```

Lokales Dashboard/Agent/Stream-PC:

```text
- lokaler Media-Scan
- lokale Testdatei erst in spaeterem separatem Step
- Full-Sync-Payloads
- lokale Statusdaten
```

Weiterhin gilt:

```text
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.
- Kein Upload/Edit/Delete-Scope.
```

## Festgelegter spaeterer Testpfad

Relativer Pfad im lokalen Media-System:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Dieser Pfad ist absichtlich relativ dokumentiert.

Der absolute lokale Stream-PC-Pfad wird erst im Ausfuehrungsstep auf dem lokalen System geprueft, damit keine falsche lokale Annahme ins Repo kommt.

## Ziel des spaeteren Datei-Tests

Der spaetere Test soll kontrolliert erzeugen:

```text
previewPersistentCandidateCount = 1
persistentMediaMissingCandidateCount = 1
persistentTombstoneCandidates = [dedizierte Testdatei]
```

Das Ziel ist nur ein sicherer Kandidat fuer Preview/Read-only-Verifikation.

Ein spaeterer Tombstone-Write bleibt ein separater Freigabe-Step.

## Geplanter Ablauf fuer spaeteren separaten Ausfuehrungsstep

### Phase 1: lokale Testdatei kontrolliert anlegen

Nur nach separatem `go`:

```text
1. Lokalen Ordner fuer Testdatei pruefen/anlegen.
2. Dedizierte kleine Test-Audio-Datei mit eindeutigem Namen ablegen.
3. Lokalen Agent/Media-Scan/Full-Sync laufen lassen.
4. Auf Webserver read-only pruefen, ob die Testdatei in remote_media_index angekommen ist.
```

### Phase 2: Missing-Situation fuer genau diese Testdatei erzeugen

Nur nach separatem `go` und mit Rueckweg:

```text
1. Testdatei nicht loeschen.
2. Testdatei kontrolliert aus dem lokalen Agent-Inventar entfernen, bevorzugt durch temporaeres Verschieben in einen dokumentierten Backup-/Hold-Pfad.
3. Full-Sync erneut laufen lassen.
4. Preview read-only pruefen.
5. Erwartung: genau 1 persistenter Tombstone-Kandidat.
```

### Phase 3: Rueckweg

Vor jedem Kandidaten-Test muss der Rueckweg stehen:

```text
1. Testdatei aus Backup-/Hold-Pfad zuruecklegen.
2. Full-Sync erneut laufen lassen.
3. Preview muss wieder 0 Kandidaten zeigen.
4. Kein Execute.
```

## Backup-/Rueckweg-Prinzip

Fuer den spaeteren Datei-Test gilt:

```text
- Testdatei eindeutig benennen.
- Testdatei niemals produktiv verwenden.
- Testdatei nicht hart loeschen.
- Verschieben nur in dokumentierten lokalen Hold-/Backup-Pfad.
- Rueckverschiebung vorab festlegen.
- Nach Rueckverschiebung read-only verifizieren, dass candidateCount wieder 0 ist.
```

## Read-only Pruefbefehle fuer spaeter

Webserver intern:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .missingClassification, .reliability'
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .counts, .reliability, .preview'
```

Gate-Zustand:

```bash
systemctl show scc-remote-modboard.service -p Environment | tr ' ' '\n' | grep -E 'MEDIA_INDEX_WRITE_ENABLED|MEDIA_INDEX_DATA_WRITE_ENABLED|MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED'
```

Erwartet vor jedem Ausfuehrungsstep:

```text
Gates nicht gesetzt oder nicht aktiv.
```

## Verboten in 0.2.65

```text
- keine Testdatei anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen Execute ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
- keine Upload/Edit/Delete-Funktion
```

## Abschluss 0.2.65

Dieser Step ist abgeschlossen, wenn:

```text
- der konkrete Testpfad dokumentiert ist
- die spaetere Ablaufplanung dokumentiert ist
- Backup-/Rueckweg-Prinzip dokumentiert ist
- project-state-Dateien auf 0.2.65 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.65 vorhanden ist
- keine Source-Datei geaendert wurde
- kein Webserver-Deploy erfolgt ist
- keine Testdatei angelegt wurde
- keine Gates aktiviert wurden
- keine DB-/Dateiaktion ausgefuehrt wurde
```
