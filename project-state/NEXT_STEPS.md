# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.61

`RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION`

## Ziel

- Entscheiden, wie ein echter persistenter Missing/Tombstone-Kandidat sicher getestet wird.
- Kein produktiver Write ohne separaten Freigabe-Step.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Backup/Rollback vor jedem echten Test konkretisieren.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.61 ist ein Doku-/Plan-Step.

Bestaetigt bleibt:

```text
Execute-Route vorhanden.
Confirm-Block funktioniert.
Gate-Block funktioniert.
Noop mit Gates und expectedCandidateCount=0 funktioniert.
Gates danach wieder aus.
Aktuell keine persistenten Tombstone-Kandidaten.
```

## Testmethoden zur Entscheidung

### Variante A: Echte dedizierte Test-Media-Datei

- Fachlich am saubersten.
- Braucht ausdrueckliche Freigabe.
- Testdatei muss eindeutig benannt sein.
- Keine echte Produktiv-Media verwenden.
- Keine lokale Datei loeschen ohne Freigabe.
- Backup/Rueckverschiebung vorher klaeren.

### Variante B: Kontrollierte Test-DB-Zeile

- Nur mit ausdruecklicher Freigabe.
- Vorher MariaDB-Backup.
- Test-ID eindeutig.
- Rollback vorher festlegen.
- Kein produktiver Tombstone-Write im selben Step.

### Variante C: Reine Simulation/Read-only-Diagnose

- Sicherste Variante.
- Keine Dateiaktion.
- Kein DB-Write.
- Keine Gates.
- Prueft keinen echten candidateCount=1-Fall.

## Pflicht vor spaeterem Tombstone-Write

```text
- aktuelle Preview
- candidateCount
- expectedCandidateCount exakt passend
- konkrete Candidate-ID(s)
- local-only Request
- confirmWrite:true
- confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"
- MEDIA_INDEX_WRITE_ENABLED=true
- MEDIA_INDEX_DATA_WRITE_ENABLED=true
- MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true
- Backup/Rollback bestaetigt
- Audit/Readback geplant
```

## Weiterhin verboten

```text
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
- keine Upload/Edit/Delete-Funktion
- keine DB-/Dateiaenderung ohne separaten Freigabe-Step
```
