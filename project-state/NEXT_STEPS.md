# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.63

`RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN`

## Ziel

- Entscheiden, ob ein echter `candidateCount=1`-Test vorbereitet wird.
- Bevorzugt: dedizierte Test-Media-Datei.
- Alternative: kontrollierte Test-DB-Zeile.
- Kein produktiver Write ohne separaten Freigabe-Step.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Backup/Rollback vor jedem echten Test konkretisieren.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.63 hat Variante C read-only bestaetigt:

```text
Diff-Status lesbar.
Preview lesbar.
Full-Sync-Compare vollstaendig.
Missing-Diagnose belastbar.
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
persistentTombstoneCandidates = []
Gates nicht gesetzt / nicht aktiv.
```

## Offener Punkt

Variante C prueft keinen echten `candidateCount=1`-Fall.

Dafuer muss separat entschieden werden:

```text
A: dedizierte Test-Media-Datei
B: kontrollierte Test-DB-Zeile
```

## Empfehlung

```text
Variante A bevorzugen.
```

Begruendung:

```text
Eine dedizierte Test-Media-Datei ist fachlich realistischer als eine kuenstliche DB-Zeile.
Sie muss aber eindeutig als Testdatei erkennbar sein und darf keine Produktiv-Media ersetzen.
```

## Weiterhin verboten

```text
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
- keine Upload/Edit/Delete-Funktion
- keine DB-/Dateiaenderung ohne separaten Freigabe-Step
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- keine lokale Datei loeschen oder verschieben ohne ausdrueckliche Freigabe
```
