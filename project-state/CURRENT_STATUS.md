# CURRENT_STATUS

Aktueller Stand: `0.2.68 - Media Index Media-System Alignment Plan`

## Ergebnis

0.2.68 korrigiert die bisherige Testdatei-Planung: Der spaetere Persistent-Tombstone-Test darf nicht auf dem alten Legacy-Root `assets/sounds` geplant werden, obwohl dieser Ordner existiert und weiterhin genutzt wird.

## Systemverstaendnis

Es gibt bewusst zwei Dateiwelten:

```text
Legacy-Assets:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images
```

Diese duerfen weiter existieren und weiter genutzt werden.

```text
Neues Media-System:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Neue Uploads sollen dort liegen und ueber Media-ID / Media-Registry genutzt werden.

## Gelesene relevante Dateien

```text
backend/modules/media.js
backend/modules/remote_agent.js
```

## Relevante Feststellung

`backend/modules/media.js` beschreibt das neue Media-System:

```text
Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
Keine bestehenden Assets werden verschoben oder geloescht.
```

`backend/modules/remote_agent.js` scannt aktuell noch legacy-orientiert:

```text
sounds -> htdocs/assets/sounds
videos -> htdocs/assets/videos
images -> htdocs/assets/images
```

## Entscheidung

Keine neue RDAP-Testdatei unter `assets/sounds` planen.

Kein blindes `assets/media/audio` als Root verwenden.

Geplanter spaeterer Testpfad im neuen Media-System:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Absolut:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

## Sicherheit

0.2.68 war Doku-only.

```text
keine Source-Aenderung
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Execute
kein Webserver-Deploy
```

## Naechster Block

```text
RDAP_0.2.69_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_PLAN
```

Ziel:

```text
Remote-Agent-/Remote-Index-Scan auf das neue Media-System ausrichten, Legacy aber weiter read-only mitfuehren.
```
