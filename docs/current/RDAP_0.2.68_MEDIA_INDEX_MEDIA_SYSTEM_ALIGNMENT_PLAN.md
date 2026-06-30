# RDAP 0.2.68 - Media Index Media-System Alignment Plan

## Status

Doku-only / Plan-Step.

Dieser Schritt korrigiert die bisherige Testdatei-Planung fuer den Persistent-Tombstone-Test: Fuer neue Medien darf nicht blind der alte Legacy-Root `htdocs/assets/sounds` verwendet werden. Das neue Media-System nutzt `htdocs/assets/media/<module>/<category>/` und verwaltet Medien ueber die lokale Media-Registry / Media-ID-Struktur.

## Grund fuer die Korrektur

Es gibt bewusst zwei Dateiwelten nebeneinander:

```text
Legacy-Assets:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images
```

Diese enthalten alte Dateien, die weiterhin genutzt werden koennen und nicht verschoben oder geloescht werden duerfen.

```text
Neues Media-System:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Neue Uploads sollen in dieses neue Media-System laufen.

## Gelesener / bestaetigter Code-Stand

Lokales Media-System:

```text
backend/modules/media.js
```

Relevante Aussage im Code:

```text
- Keine bestehenden Assets werden verschoben oder geloescht.
- Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
- Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
- Module geben moduleKey fest vor; User waehlen/erstellen die Zusatzkategorie.
```

Aktueller Remote-Agent-Scan:

```text
backend/modules/remote_agent.js
```

Aktuell bekannte Remote-Agent-Roots:

```text
sounds -> htdocs/assets/sounds
videos -> htdocs/assets/videos
images -> htdocs/assets/images
```

Bewertung:

```text
remote_agent.js ist fuer den RDAP-Media-Index aktuell noch legacy-root-orientiert.
backend/modules/media.js ist das neuere Media-System mit Registry und assets/media/<module>/<category>.
```

## Entscheidung 0.2.68

Fuer den spaeteren Persistent-Tombstone-Test wird keine Testdatei unter `assets/sounds` geplant.

Auch `assets/media/audio` wird nicht als generischer Root geraten, weil das neue Media-System nicht nach Root-Key `audio`, sondern nach `media/<module>/<category>` arbeitet.

Stattdessen wird fuer den spaeteren Test ein eigener Modul-/Kategorie-Kontext geplant:

```text
moduleKey: rdap-test
categoryKey: persistent-tombstone
```

Geplanter relativer Testpfad fuer spaeter:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Geplanter lokaler absoluter Testpfad fuer spaeter:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Geplanter Webpfad fuer spaeter:

```text
/assets/media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

## Wichtige Konsequenz

Der spaetere candidateCount=1-Test darf erst kommen, wenn der RDAP-Remote-Agent-/Media-Index-Pfad sauber mit dem neuen Media-System abgeglichen ist.

Vor einer echten Testdatei-Aktion muss geklaert/geplant werden:

```text
- Soll remote_agent.js zusaetzlich assets/media/<module>/<category> scannen?
- Soll remote_agent.js lokale media_assets-Registry-Daten nutzen, statt nur Filesystem-Roots?
- Wie wird Legacy weiter read-only mitgefuehrt?
- Wie wird verhindert, dass alte Legacy-Dateien versehentlich als neue Tombstone-Kandidaten gelten?
- Wie wird die Media-ID / relativePath-Struktur im Remote-Index abgebildet?
```

## Sicherheitsgrenzen

0.2.68 fuehrt nichts aus.

```text
- keine Testdatei anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Migration ausfuehren
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- kein Soft-Delete
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
- kein Webserver-Deploy
```

## Ziel fuer den naechsten Schritt

Naechster sinnvoller Block:

```text
RDAP_0.2.69_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_PLAN
```

Ziel:

```text
- remote_agent.js und backend/modules/media.js gemeinsam lesen
- kleinsten sicheren Code-Plan fuer assets/media-Unterstuetzung erstellen
- Legacy-Roots weiter read-only erhalten
- neue Media-System-Dateien im Agent-/Remote-Index sichtbar machen
- noch keine Testdatei
- noch keine produktiven Writes
- noch keine Gates
- noch kein Execute
```
