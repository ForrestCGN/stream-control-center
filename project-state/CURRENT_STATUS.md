# CURRENT_STATUS

Aktueller Stand: `0.2.70 - Media Index Remote-Agent Media-System Scan Code Plan`

## Ergebnis

0.2.70 dokumentiert den konkreten Source-Aenderungsplan fuer `backend/modules/remote_agent.js`.

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
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
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

## Entscheidung / Plan

Der spaetere RDAP-/Remote-Index-Scan soll beide Welten read-only erfassen:

```text
- neues Media-System: assets/media/<module>/<category>/...
- Legacy: assets/sounds, assets/videos, assets/images
```

Kategorien/Module muessen mittransportiert werden, damit Dashboard und Remote-Modboard nach Quelle, Modul, Kategorie und Typ sortieren/filtern koennen.

## Geplante spaetere Item-Felder

Fuer neue Media-System-Dateien:

```text
rootKey: media
source: media_dir
moduleKey
categoryKey
fullCategoryKey
type/kind
relativePath
assetRelativePath
webPath/publicPath
```

Fuer Legacy-Dateien:

```text
rootKey: sounds|videos|images
source: legacy_scan
moduleKey: legacy
categoryKey: passend oder legacy
fullCategoryKey: legacy/<...>
type/kind
relativePath
webPath/publicPath
```

## Spaeterer Testpfad

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Relativ im neuen Media-System:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Geplante Agent-Identitaet:

```text
id: media:rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
rootKey: media
source: media_dir
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
kind: audio
mediaType: audio
```

## Sicherheit

0.2.70 war Doku-only.

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
RDAP_0.2.71_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PREP
```

Ziel:

```text
Kleine Source-Aenderung in backend/modules/remote_agent.js vorbereiten/umsetzen.
```
