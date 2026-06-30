# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.67

`RDAP_0.2.68_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_CONFIRM_READONLY`

## Ziel

- Root-Frage konkret bestaetigen.
- Lokal nur lesen/pruefen, keine Testdatei anlegen.
- Agent-Scan-/Media-Root-Code lesen.
- Entscheiden, ob `audio` finaler Testroot wird oder `sounds` doch gueltig ist.
- Kein produktiver Write.
- Kein physisches Loeschen.
- Kein Auto-Delete.
- Kein Online->Agent-Trigger.
- Lokales Dashboard/Agent und Remote-Modboard sauber getrennt halten.

## Ausgangspunkt

0.2.67 ist ein Doku-/Plan-Step.

Bestaetigter lokaler Basis-Pfad:

```text
D:\Streaming\stramAssets\htdocs\assets\media
```

Bisheriger, nicht verifizierter Testpfad:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Fallback, wenn `sounds` nicht bestaetigt ist:

```text
audio/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Bestaetigt bleibt:

```text
Full-Sync-Compare vollstaendig.
Missing-Diagnose zuverlaessig.
persistentMediaMissingCandidateCount = 0.
previewPersistentCandidateCount = 0.
Gates nicht gesetzt / nicht aktiv.
```

## Read-only Pruefung fuer 0.2.68

Lokal auf dem Stream-PC nur lesen:

```powershell
cd D:\Streaming\stramAssets\htdocs\assets\media
Get-ChildItem -Directory | Select-Object Name
```

Im Repo nur lesen:

```powershell
cd D:\Git\stream-control-center
Select-String -Path .\backend\modules\remote_agent.js -Pattern "audio|sounds|media|rootKey|allowed" -Context 2,2
```

## Weiterhin verboten ohne separaten Ausfuehrungs-Go

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

Wenn 0.2.68 den gueltigen Root bestaetigt, spaeter separater Step:

```text
- Testdatei lokal anlegen
- Full-Sync/Preview read-only pruefen
- Testdatei kontrolliert in Hold-Pfad verschieben
- Full-Sync/Preview read-only pruefen
- candidateCount=1 nur fuer diese Testdatei bestaetigen
- Rueckweg pruefen
- weiterhin kein Execute
```
