# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.66

`RDAP_0.2.67_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_VERIFY_AND_CREATE_PLAN`

## Ziel

- Lokalen gueltigen Media-Root fuer die Testdatei pruefen.
- Nicht raten, ob `sounds` wirklich gueltig ist.
- Falls `sounds` nicht gueltig ist, vorhandenen Root wie `audio` fuer die Testdatei planen.
- Danach erst lokalen Ausfuehrungsplan fuer Testdatei-Anlage, Full-Sync und Preview vorbereiten.
- Kein produktiver Write.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.66 ist ein Doku-/Vorbereitungs-Step.

Bestaetigter lokaler Basis-Pfad:

```text
D:\Streaming\stramAssets\htdocs\assets\media
```

Geplanter, aber noch zu verifizierender relativer Testpfad:

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

## Wichtig fuer 0.2.67

0.2.67 soll die Root-Frage klaeren, bevor echte lokale Dateiaktionen geplant oder ausgefuehrt werden.

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

Wenn 0.2.67 den gueltigen Root bestaetigt, spaeter separater Step:

```text
- Testdatei lokal anlegen
- Full-Sync/Preview read-only pruefen
- Testdatei kontrolliert in Hold-Pfad verschieben
- Full-Sync/Preview read-only pruefen
- candidateCount=1 nur fuer diese Testdatei bestaetigen
- Rueckweg pruefen
- weiterhin kein Execute
```
