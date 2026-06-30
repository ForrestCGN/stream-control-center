# RDAP 0.2.66 - Media Index Persistent Tombstone Test File Create Readonly Sync Plan

## Zweck

Dieser Step konkretisiert den lokalen Ausfuehrungsplan fuer die spaetere dedizierte Test-Media-Datei.

Es handelt sich bewusst weiterhin um einen Doku-/Plan-Step.

In diesem Step wird keine Testdatei angelegt, keine Datei verschoben oder geloescht, keine DB-Zeile veraendert, keine Gates aktiviert und kein Tombstone-Execute ausgefuehrt.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigter Stand:

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

Gate-Zustand:

```text
MEDIA_INDEX_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_DATA_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED nicht gesetzt / nicht aktiv
```

Bewertung:

```text
Nicht gesetzt ist sicher, weil nur true/1/yes/on als aktiv zaehlt.
```

## Bestaetigter lokaler Basis-Pfad

Aus Nutzer-Screenshot bestaetigt:

```text
D:\Streaming\stramAssets\htdocs\assets\media
```

Die vorhandenen Media-Unterordner liegen unter diesem Pfad, zum Beispiel:

```text
alerts
animation
audio
birthday
channelpoints
commands
general
hypetrain
image
rewards
shot_alarm
soundalerts
stream_events
system
tts
twitch_events
video
vip
vip30
```

## Festgelegter spaeterer Testpfad

Relativ im Media-System:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Lokaler absoluter Zielpfad fuer spaeter:

```text
D:\Streaming\stramAssets\htdocs\assets\media\sounds\rdap-test\rdap-persistent-tombstone-test-001.mp3
```

Hinweis:

Der Screenshot zeigt aktuell `assets\media`, aber keinen sichtbaren `sounds`-Ordner auf oberster Ebene. Deshalb muss im spaeteren Ausfuehrungs-Step zuerst geklaert werden, ob `sounds` im Media-Scan als Root/Key gueltig ist oder ob fuer den echten lokalen Pfad ein vorhandener Media-Unterordner wie `audio` genutzt werden muss.

0.2.66 legt den Zielpfad noch nicht produktiv fest, sondern dokumentiert die zu pruefende Pfadentscheidung.

## Ziel fuer den spaeteren Ausfuehrungs-Step

Der spaetere echte Read-only-Test soll pruefen:

```text
1. Dedizierte Test-Media-Datei lokal kontrolliert anlegen.
2. Lokalen Agent/Full-Sync laufen lassen.
3. Preview muss weiterhin 0 Kandidaten zeigen, solange Datei vorhanden ist.
4. Testdatei kontrolliert in einen Hold-Pfad verschieben, nicht loeschen.
5. Lokalen Agent/Full-Sync erneut laufen lassen.
6. Preview muss genau 1 persistenten Kandidaten zeigen.
7. Candidate-ID muss exakt zur Testdatei gehoeren.
8. Danach Testdatei aus Hold-Pfad zuruecklegen.
9. Lokalen Agent/Full-Sync erneut laufen lassen.
10. Preview muss wieder 0 Kandidaten zeigen.
```

Weiterhin gilt:

```text
- Kein Execute.
- Keine Gates aktivieren.
- Kein Soft-Delete.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
```

## Geplanter Hold-/Rueckweg

Fuer den spaeteren Test soll nicht geloescht werden.

Stattdessen:

```text
D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3
```

Regeln:

```text
- Hold-Pfad nur fuer Testdatei nutzen.
- Testdatei vor Verschiebung eindeutig pruefen.
- Keine Produktiv-Media verschieben.
- Nach Test Datei zurueck an den Originalpfad.
- Danach CandidateCount wieder 0 pruefen.
```

## Read-only Webserver-Pruefbefehle fuer spaeter

Diff-Status:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .missingClassification, .reliability'
```

Preview:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .counts, .reliability, .preview'
```

Gate-Zustand:

```bash
systemctl show scc-remote-modboard.service -p Environment | tr ' ' '\n' | grep -E 'MEDIA_INDEX_WRITE_ENABLED|MEDIA_INDEX_DATA_WRITE_ENABLED|MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED'
```

Erwartung fuer Gate-Zustand:

```text
keine Ausgabe oder alle drei Werte nicht true/1/yes/on
```

## Lokale Ausfuehrung erst im naechsten Step

0.2.66 fuehrt nichts lokal aus.

Der spaetere Ausfuehrungs-Step muss vor jeder lokalen Aktion explizit bestaetigen:

```text
- korrekter lokaler Basis-Pfad
- korrekter gueltiger Media-Root
- Test-Unterordner
- Testdateiname
- Dateierzeugung
- Hold-Pfad
- Rueckweg
- Full-Sync/Preview-Pruefung
```

## Weiterhin verboten in 0.2.66

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
- keine Upload/Edit/Delete-Funktion
```

## Abschluss 0.2.66

Dieser Step ist abgeschlossen, wenn:

```text
- dieser Ausfuehrungsplan im Repo liegt
- project-state-Dateien auf 0.2.66 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.66 vorhanden ist
- keine Source-Datei geaendert wurde
- keine Testdatei angelegt wurde
- keine Datei verschoben oder geloescht wurde
- kein Webserver-Deploy erfolgt ist
- keine Gates aktiviert wurden
- keine DB-/Dateiaktion ausgefuehrt wurde
```
