# RDAP 0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan

## Zweck

Dieser Step dokumentiert die naechste sichere Entscheidung nach 0.2.63:

```text
RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN
```

Ziel ist nur die Entscheidung, welche Quelle fuer einen spaeteren echten `candidateCount=1`-Test vorbereitet werden soll.

Dieser Step ist bewusst Doku-only.

In diesem Step werden keine Source-Dateien geaendert, keine Test-Media-Datei angelegt, keine Dateien verschoben oder geloescht, keine DB-Zeilen veraendert, keine Gates aktiviert und kein Tombstone-Execute gestartet.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.63 - Media Index Persistent Tombstone Readonly Simulation Check bestaetigt
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigter Read-only-Stand:

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

Gate-Check nach 0.2.63:

```text
MEDIA_INDEX_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_DATA_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED nicht gesetzt / nicht aktiv
```

Bewertung:

```text
Nicht gesetzt ist sicher, weil nur true/1/yes/on als aktiv zaehlt.
```

## Entscheidung 0.2.64

Fuer den spaeteren echten `candidateCount=1`-Test wird Variante A als bevorzugte Quelle festgelegt:

```text
A: dedizierte Test-Media-Datei
```

Nicht gewaehlt fuer den naechsten echten Test:

```text
B: kontrollierte Test-DB-Zeile
```

## Warum Variante A

Variante A ist fachlich naeher an der echten Nutzung:

```text
- Eine echte Media-Datei durchlaeuft den lokalen Agent-/Dashboard-Media-Scan.
- Der Webserver sieht spaeter einen normalen remote_media_index-Eintrag.
- Ein Missing-Kandidat entsteht nur, wenn die dedizierte Testdatei kontrolliert nicht mehr im vollstaendigen Agent-Full-Sync vorkommt.
- Preview und Tombstone-Kandidat pruefen damit den realistischen End-to-End-Fall.
```

Variante B bleibt Reserve:

```text
- Nur falls Variante A technisch nicht sauber steuerbar ist.
- Nur mit MariaDB-Backup/Rollback.
- Nur mit separatem Freigabe-Step.
```

## Systemtrennung

Remote-Modboard / Webserver:

```text
- Online-DB
- Diff-Status
- Persistent Tombstone Preview
- Execute-Foundation
- Gates
- Confirm
- Audit
- Readback
```

Lokales Dashboard / Agent / Stream-PC:

```text
- lokale Media-Scans
- Full-Sync-Payloads
- lokale Test-Media-Datei als spaetere kontrollierte Datenquelle
```

Weiterhin gilt:

```text
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.
- Kein Upload/Edit/Delete-Scope in diesem Block.
```

## Spaeterer Testdatei-Plan, noch nicht ausfuehren

Fuer einen spaeteren separaten Step wird eine eindeutig benannte Testdatei vorgesehen.

Vorgeschlagener relativer Testpfad:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Wichtig:

```text
- Diese Datei wird in 0.2.64 nicht angelegt.
- Der Ordner wird in 0.2.64 nicht angelegt.
- Es wird keine lokale Datei verschoben oder geloescht.
- Es wird kein DB-Eintrag erzeugt.
- Es wird kein Full-Sync erzwungen.
```

## Bedingungen fuer spaeteren echten candidateCount=1-Test

Vor einem spaeteren echten Test muessen separat geplant und freigegeben werden:

```text
1. Dedizierte Test-Media-Datei lokal anlegen oder vorhandene harmlose Testdatei nutzen.
2. Lokalen Agent-Full-Sync mit Testdatei laufen lassen.
3. Webserver-DB-Readback fuer genau diese Test-ID pruefen.
4. Testdatei kontrolliert aus dem lokalen Agent-Inventar entfernen oder ausblenden.
5. Full-Sync-Compare erneut vollstaendig laufen lassen.
6. Preview muss exakt candidateCount=1 und genau die Test-ID zeigen.
7. Gates bleiben weiterhin aus, solange nur Preview geprueft wird.
8. Execute bleibt bis zu einem separaten Write-Freigabe-Step verboten.
```

## Sicherheitsgrenzen

In 0.2.64 verboten:

```text
- keine Test-Media-Datei anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile einfuegen
- keine DB-Zeile aktualisieren
- keine DB-Zeile loeschen
- keine Gates aktivieren
- keinen Execute ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- keine Upload/Edit/Delete-Funktion
```

## Abschluss 0.2.64

Dieser Step ist abgeschlossen, wenn:

```text
- diese Entscheidung im Repo dokumentiert ist
- project-state-Dateien auf 0.2.64 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.64 vorhanden ist
- keine Source-Datei geaendert wurde
- kein Webserver-Deploy erfolgt ist
- keine Gates aktiviert wurden
- keine DB-/Dateiaktion ausgefuehrt wurde
```

## Naechster sinnvoller RDAP-Block

```text
RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN
```

Ziel: konkrete Read-only-Vorbereitung fuer die dedizierte Test-Media-Datei planen, inklusive lokalem Pfad, Dateiname, Backup/Rueckweg und Webserver-Preview-Ablauf. Noch kein Execute.
