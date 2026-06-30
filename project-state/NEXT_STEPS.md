# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.60

`RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN`

## Ziel

- Sicher planen, wie ein echter persistenter Missing/Tombstone-Kandidat kontrolliert erzeugt oder simuliert wird.
- Kein produktiver Write in diesem Plan-Step.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Backup/Rollback-Konzept vor jedem echten Test.
- Erst read-only klaeren, welche Testmethode sicher ist.

## Ausgangspunkt

0.2.60 ist bestaetigt:

```text
Execute-Route vorhanden.
Confirm-Block funktioniert.
Gate-Block funktioniert.
Noop mit Gates und expectedCandidateCount=0 funktioniert.
Gates danach wieder aus.
```

## Wichtig

Produktiver Tombstone-Write fuer persistente Media-Dateien erst, wenn:

```text
- echte Kandidaten bewusst und sicher erzeugt oder bestaetigt sind
- Preview candidateCount stimmt
- expectedCandidateCount exakt passt
- Gates bewusst gesetzt werden
- Confirm-Text passt
- Audit/Readback geprueft wird
- Backup/Rollback geklaert ist
```

Weiterhin verboten:

```text
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
```
