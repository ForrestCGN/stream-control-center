# RDAP 0.2.62 - Media Index Persistent Tombstone Test Method Decision

## Zweck

Dieser Step dokumentiert die Testmethoden-Entscheidung nach `0.2.61`.

Gewaehlte kuerzeste sichere Variante:

```text
Variante C: reine Simulation / Read-only-Diagnose zuerst
```

Dieser Step ist bewusst Doku-only.

Es werden keine Source-Dateien geaendert, keine produktiven Writes ausgefuehrt, keine DB-Zeilen veraendert, keine Dateien geloescht, keine Gates aktiviert und kein echter Tombstone-Write gestartet.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Vorhandene Routen:

```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter Kandidatenstand:

```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```

Bestaetigter Gate-Zustand nach 0.2.60:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

## Entscheidung

Fuer den naechsten kleinsten sicheren Schritt wird keine echte Test-Media-Datei angelegt und keine Test-DB-Zeile geschrieben.

Stattdessen wird zuerst nur read-only bestaetigt:

```text
- Diff-Status ist erreichbar.
- Persistent Tombstone Preview ist erreichbar.
- Full-Sync-Compare-/Reliability-Felder sind sichtbar.
- CandidateCount bleibt nachvollziehbar.
- Gates bleiben aus.
- Execute wird nicht fuer echte Kandidaten ausgefuehrt.
```

## Warum Variante C zuerst

Variante C ist die kuerzeste sichere Variante, weil sie:

```text
- keine Dateiaktion braucht
- keinen DB-Write braucht
- keine Gates braucht
- keinen Tombstone-Write braucht
- keinen Webserver-Deploy braucht
- keinen Node-Neustart braucht
- Modboard/Webserver und lokales Dashboard/Agent sauber getrennt laesst
```

Nachteil bleibt bewusst dokumentiert:

```text
Variante C prueft keinen echten candidateCount=1-Fall.
```

## Was nicht gemacht wird

```text
- keine DB-Zeile veraendern
- keine Test-DB-Zeile anlegen
- keine lokale Media-Datei anlegen
- keine lokale Media-Datei verschieben
- keine lokale Media-Datei loeschen
- keinen echten Tombstone-Write ausfuehren
- keine Gates aktivieren
- keinen Online->Agent-Trigger bauen
- keinen Hard-Delete bauen
- keine Upload/Edit/Delete-Funktion bauen
```

## Systemtrennung

### Remote-Modboard / Webserver

Bleibt zustaendig fuer:

```text
- Online-DB / remote_media_index
- Diff-Status
- Persistent Tombstone Preview
- Execute-Foundation
- Gates
- Confirm
- Audit
- Readback
```

Interne URL:

```text
http://127.0.0.1:3010
```

Live-URL:

```text
https://mods.forrestcgn.de/
```

### Lokales Dashboard / Agent / Stream-PC

Bleibt zustaendig fuer:

```text
- lokale Media-Scans
- lokale Full-Sync-Payloads
- lokale Statusdaten
- Dashboard unter http://127.0.0.1:8080
```

Weiterhin gilt:

```text
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.
- Kein Upload/Edit/Delete-Scope in diesem Block.
```

## Read-only Pruefbefehle fuer Variante C

Webserver intern:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .missingClassification, .reliability'
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .counts, .reliability, .preview'
```

Gate-Zustand gezielt pruefen:

```bash
systemctl show scc-remote-modboard.service -p Environment | tr ' ' '\n' | grep -E 'MEDIA_INDEX_WRITE_ENABLED|MEDIA_INDEX_DATA_WRITE_ENABLED|MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED'
```

Erwartet:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Optional lokale Sicht nur read-only:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | Select-Object ok,modules,wsClients
```

Kein lokaler Datei-Test, kein Agent-Trigger, keine lokale Media-Aenderung.

## Danach moegliche Folgeschritte

Wenn Variante C bestaetigt ist, gibt es zwei sinnvolle Wege:

```text
A: dedizierte Test-Media-Datei separat freigeben und planen
B: kontrollierte Test-DB-Zeile separat freigeben und planen
```

Empfehlung fuer echten candidateCount=1-Test bleibt:

```text
Variante A mit eindeutig benannter Test-Media-Datei, aber erst nach separater Freigabe.
```

## Abschluss 0.2.62

Dieser Step ist abgeschlossen, wenn:

```text
- diese Entscheidung im Repo liegt
- project-state-Dateien auf 0.2.62 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.62 vorhanden ist
- keine Source-Datei geaendert wurde
- kein Webserver-Deploy erfolgt ist
- keine Gates aktiviert wurden
- keine DB-/Dateiaktion ausgefuehrt wurde
```
