# RDAP 0.2.67 - Media Index Persistent Tombstone Test File Root Verify and Create Plan

## Zweck

Dieser Step dokumentiert die sichere Klaerung des lokalen Media-Roots fuer die spaetere dedizierte Test-Media-Datei.

Es handelt sich bewusst um einen Doku-/Plan-Step.

In diesem Step werden keine Source-Dateien geaendert, keine Testdatei angelegt, keine Datei verschoben oder geloescht, keine DB-Zeile veraendert, keine Gates aktiviert und kein echter Tombstone-Write gestartet.

## Ausgangspunkt

Zuletzt bestaetigt:

```text
0.2.66 - Media Index Persistent Tombstone Test File Create Readonly Sync Plan
rdap_media_index_persistent_tombstone_execute_foundation_059.v1
RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigter lokaler Basis-Pfad aus Screenshot:

```text
D:\Streaming\stramAssets\htdocs\assets\media
```

Bisher geplanter, aber noch nicht verifizierter relativer Testpfad:

```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Der Screenshot zeigt auf oberster Ebene von `assets\media` keinen sichtbaren `sounds`-Ordner, aber vorhandene Roots wie:

```text
audio
alerts
channelpoints
commands
general
soundalerts
tts
video
vip
```

Darum darf `sounds` nicht geraten werden.

## Entscheidung fuer 0.2.67

Vor jeder lokalen Dateiaktion muss der gueltige Root fuer den Agent-Media-Scan verifiziert werden.

Kurzeste sichere Entscheidung:

```text
1. Root-Frage zuerst klaeren.
2. `sounds` nur verwenden, wenn Code/Agent-Scan oder bestehende Daten diesen Root wirklich bestaetigen.
3. Falls `sounds` nicht bestaetigt ist, wird fuer die dedizierte Test-Media-Datei ein vorhandener Root bevorzugt: `audio`.
```

## Vorgeschlagener sicherer Fallback-Root

Wenn `sounds` nicht eindeutig bestaetigt ist, wird fuer den spaeteren Test geplant:

```text
audio/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Lokaler absoluter Pfad dann:

```text
D:\Streaming\stramAssets\htdocs\assets\media\audio\rdap-test\rdap-persistent-tombstone-test-001.mp3
```

Hold-Pfad dann:

```text
D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3
```

Auch dieser Pfad wird in 0.2.67 nicht angelegt.

## Root-Verifikation fuer spaeter

Vor Ausfuehrung eines Datei-Steps soll lokal geprueft werden:

```powershell
cd D:\Streaming\stramAssets\htdocs\assets\media

Get-ChildItem -Directory | Select-Object Name
```

Und im Repo/Agent-Code soll geprueft werden, welche Roots der lokale Media-Scan wirklich sendet.

Relevante Datei fuer spaetere Code-Lektuere:

```text
backend/modules/remote_agent.js
```

Dabei nur lesen, nichts aendern.

## Spaeterer Ausfuehrungsplan, noch nicht ausfuehren

Wenn Root bestaetigt ist, kann ein separater spaeterer Step vorbereitet werden:

```text
1. Test-Unterordner unter bestaetigtem Root anlegen.
2. Eindeutige kleine MP3-Testdatei anlegen/kopieren.
3. Lokalen Agent/Full-Sync laufen lassen.
4. Webserver Preview read-only pruefen.
5. Erwartung zuerst: candidateCount bleibt 0, weil Testdatei lokal vorhanden ist.
6. Testdatei kontrolliert in Hold-Pfad verschieben.
7. Full-Sync/Preview erneut read-only pruefen.
8. Erwartung dann: candidateCount=1 nur fuer diese Testdatei.
9. Kein Execute.
10. Rueckweg pruefen: Datei aus Hold zuruecklegen und Preview wieder 0 bestaetigen.
```

Dieser Ablauf wird in 0.2.67 nur geplant.

## Systemtrennung

Remote-Modboard/Webserver:

```text
- Online-DB
- Diff
- Preview
- Execute-Foundation
- Gates
- Confirm
- Audit
- Readback
```

Lokales Dashboard/Agent/Stream-PC:

```text
- lokale Media-Datei
- lokaler Media-Scan
- Full-Sync-Payload
- lokaler Status
```

Weiterhin gilt:

```text
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.
- Kein Upload/Edit/Delete-Scope in diesem Block.
```

## Sicherheit

- Kein DB-Write in 0.2.67.
- Kein Soft-Delete in 0.2.67.
- Keine Testdatei in 0.2.67.
- Keine lokale Dateiaktion in 0.2.67.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Kein Auto-Delete.
- Keine Gates.
- Kein Execute.

## Abschluss 0.2.67

Dieser Step ist abgeschlossen, wenn:

```text
- Root-Verifikationsplan dokumentiert ist
- Fallback auf vorhandenen Root `audio` dokumentiert ist
- project-state-Dateien auf 0.2.67 aktualisiert sind
- neuer Chat-Prompt fuer 0.2.67 vorhanden ist
- keine Source-Datei geaendert wurde
- kein Webserver-Deploy erfolgt ist
- keine Testdatei angelegt wurde
- keine DB-/Dateiaktion ausgefuehrt wurde
- keine Gates aktiviert wurden
```
