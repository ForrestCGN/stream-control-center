# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.62

`RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK`

## Ziel

- Variante C read-only auf dem Webserver pruefen und dokumentieren.
- Diff-Status gezielt auslesen.
- Persistent Tombstone Preview gezielt auslesen.
- CandidateCount bestaetigen.
- Gate-Zustand bestaetigen.
- Kein produktiver Write.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.62 ist ein Doku-/Decision-Step.

Entscheidung:

```text
Variante C zuerst: reine Simulation / Read-only-Diagnose
```

Bestaetigt bleibt:

```text
Execute-Route vorhanden.
Confirm-Block funktioniert.
Gate-Block funktioniert.
Noop mit Gates und expectedCandidateCount=0 funktioniert.
Gates danach wieder aus.
Aktuell keine persistenten Tombstone-Kandidaten.
```

## Read-only Checks fuer 0.2.63

Webserver intern:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .missingClassification, .reliability'
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .counts, .reliability, .preview'
```

Gate-Zustand:

```bash
systemctl show scc-remote-modboard.service -p Environment | tr ' ' '\n' | grep -E 'MEDIA_INDEX_WRITE_ENABLED|MEDIA_INDEX_DATA_WRITE_ENABLED|MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED'
```

Erwartet:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
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
```

## Danach moeglich

Wenn 0.2.63 sauber dokumentiert ist, separat entscheiden:

```text
A: dedizierte Test-Media-Datei fuer echten candidateCount=1-Test
B: kontrollierte Test-DB-Zeile fuer echten candidateCount=1-Test
```
