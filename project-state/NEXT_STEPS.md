# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.64

`RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN`

## Ziel

- Konkrete Read-only-Vorbereitung fuer die dedizierte Test-Media-Datei planen.
- Lokalen Testpfad festlegen.
- Testdateiname festlegen.
- Backup-/Rueckweg fuer die Testdatei festlegen.
- Ablauf fuer Full-Sync/Preview dokumentieren.
- Kein produktiver Write.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.64 ist ein Doku-/Plan-Step.

Entscheidung:

```text
A: dedizierte Test-Media-Datei fuer spaeteren candidateCount=1-Test bevorzugt.
```

Bestaetigt bleibt:

```text
Full-Sync-Compare vollstaendig.
Missing-Diagnose zuverlaessig.
persistentMediaMissingCandidateCount = 0.
previewPersistentCandidateCount = 0.
Gates nicht gesetzt / nicht aktiv.
```

## Vorgeschlagener spaeterer Testpfad

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

## Wichtig

0.2.65 soll weiterhin nur vorbereiten, nicht ausfuehren.

Weiterhin verboten:

```text
- keine Testdatei anlegen ohne separates go
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
```

## Danach moeglich

Wenn 0.2.65 sauber vorbereitet ist, spaeter separater Step fuer kontrollierte lokale Testdatei-Anlage und read-only Full-Sync/Preview-Test.
