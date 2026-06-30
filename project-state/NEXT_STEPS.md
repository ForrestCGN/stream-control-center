# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.65

`RDAP_0.2.66_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_CREATE_READONLY_SYNC_PLAN`

## Ziel

- Konkreten lokalen Ausfuehrungsplan fuer die dedizierte Test-Media-Datei erstellen.
- Lokalen absoluten Pfad pruefen lassen, nicht raten.
- Testdateiname bleibt eindeutig.
- Hold-/Backup-/Rueckweg festlegen.
- Ablauf fuer lokale Anlage, Full-Sync und Preview dokumentieren.
- Kein produktiver Write.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.65 ist ein Doku-/Vorbereitungs-Step.

Festgelegt:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Bestaetigt bleibt:

```text
Full-Sync-Compare vollstaendig.
Missing-Diagnose zuverlaessig.
persistentMediaMissingCandidateCount = 0.
previewPersistentCandidateCount = 0.
Gates nicht gesetzt / nicht aktiv.
```

## Wichtig fuer 0.2.66

0.2.66 soll den lokalen Ausfuehrungsplan konkretisieren.

Weiterhin verboten ohne separaten Ausfuehrungs-Go:

```text
- keine Testdatei anlegen
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

Wenn 0.2.66 sauber vorbereitet ist, spaeter separater Step:

```text
- Testdatei lokal anlegen
- Full-Sync/Preview read-only pruefen
- Testdatei kontrolliert in Hold-Pfad verschieben
- Full-Sync/Preview read-only pruefen
- candidateCount=1 nur fuer diese Testdatei bestaetigen
- Rueckweg pruefen
- weiterhin kein Execute
```
