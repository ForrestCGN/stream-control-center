# RDAP 0.2.70 - Media Index Remote-Agent Media-System Scan Code Plan

## Status

Doku-/Plan-Step.

Es werden in diesem Step keine Source-Dateien geaendert.

## Ausgangspunkt

Der lokale Stream-PC hat zwei bewusst parallele Asset-Welten:

```text
Legacy-Assets:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images
```

Diese Ordner enthalten weiterhin genutzte Altdateien und muessen read-only erhalten bleiben.

```text
Neues Media-System:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Neue Uploads sollen dort liegen und ueber Media-ID / Media-Registry genutzt werden.

## Relevante Code-Basis

Gelesen und fachlich beruecksichtigt:

```text
backend/modules/media.js
backend/modules/remote_agent.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
```

### Neues Media-System in backend/modules/media.js

`backend/modules/media.js` beschreibt:

```text
- Zentrale Medien-Registry fuer Audio, Video, Bilder und Animationen.
- Keine bestehenden Assets werden verschoben oder geloescht.
- Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
- Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
```

Die Upload-Kontexte werden ueber `moduleKey` und `categoryKey` gebildet. Daraus entsteht relativ:

```text
media/<moduleKey>/<categoryKey>/...
```

Beispiele fuer spaetere neue Media-System-Pfade:

```text
media/general/general/<datei>
media/alerts/follow/<datei>
media/soundalerts/general/<datei>
media/rdap-test/persistent-tombstone/<datei>
```

### Aktueller Remote-Agent-Scan in backend/modules/remote_agent.js

`backend/modules/remote_agent.js` scannt aktuell noch legacy-orientiert:

```text
rootKey sounds -> htdocs/assets/sounds
rootKey videos -> htdocs/assets/videos
rootKey images -> htdocs/assets/images
```

Das ist fuer Altdateien korrekt, reicht aber nicht fuer neue Media-ID-Dateien unter `assets/media/<module>/<category>`.

## Ziel fuer spaetere Source-Aenderung

Der Remote-Agent-Media-Scan soll kuenftig beide Welten read-only erfassen:

```text
1. Neues Media-System:
   htdocs/assets/media/<module>/<category>/...

2. Legacy:
   htdocs/assets/sounds
   htdocs/assets/videos
   htdocs/assets/images
```

Dabei duerfen keine bestehenden Dateien verschoben, geloescht oder umbenannt werden.

## Geplante Item-Felder fuer Dashboard/Remote-Modboard

Jedes Inventory-Item soll spaeter sortier- und filterbare Metadaten enthalten.

### Fuer neue Media-System-Dateien

```text
rootKey: media
source: media_dir
moduleKey: <module>
categoryKey: <category>
fullCategoryKey: <module>/<category>
kind: audio|video|image|media
mediaType: audio|video|image|animation|media
relativePath: media/<module>/<category>/<file>
webPath: /assets/media/<module>/<category>/<file>
publicPath: /assets/media/<module>/<category>/<file>
```

### Fuer Legacy-Dateien

```text
rootKey: sounds|videos|images
source: legacy_scan
moduleKey: legacy
categoryKey: sounds|videos|images oder erkannte Unterkategorie
fullCategoryKey: legacy/<categoryKey>
kind: audio|video|image|media
mediaType: audio|video|image|animation|media
relativePath: <relative path unter Legacy-Root>
webPath: /assets/<legacy-root>/<relativePath>
publicPath: /assets/<legacy-root>/<relativePath>
```

## Vorgeschlagene Source-Aenderung fuer spaeter

Noch nicht in diesem Step ausfuehren.

### 1. MEDIA_ROOTS erweitern

Aktuelle Roots bleiben erhalten. Neu kommt ein Root fuer das Media-System hinzu:

```js
const MEDIA_ROOTS = Object.freeze([
  { key: 'media', label: 'Media-System', localPathHint: 'htdocs/assets/media', publicBasePath: '/assets/media', source: 'media_dir', types: ['audio', 'video', 'image', 'animation'] },
  { key: 'sounds', label: 'Sounds', localPathHint: 'htdocs/assets/sounds', publicBasePath: '/assets/sounds', source: 'legacy_scan', types: ['audio', 'video'] },
  { key: 'videos', label: 'Videos', localPathHint: 'htdocs/assets/videos', publicBasePath: '/assets/videos', source: 'legacy_scan', types: ['video'] },
  { key: 'images', label: 'Bilder', localPathHint: 'htdocs/assets/images', publicBasePath: '/assets/images', source: 'legacy_scan', types: ['image'] }
]);
```

Wichtig: Reihenfolge mit `media` zuerst ist fuer neue Dateien sinnvoll, darf aber keine Legacy-Duplikate erzeugen. Falls gleiche Datei aus zwei Welten sichtbar waere, muss der Scan deduplizieren oder durch relative Pfade eindeutig bleiben.

### 2. safeMediaRootKey erweitern

Spaeter erlauben:

```text
media
sounds
videos
images
```

### 3. Item-Metadaten ableiten

Neue Hilfsfunktion planen:

```text
buildMediaItemContext(root, relativePath, kind)
```

Sie soll fuer `root.key === 'media'` aus dem relativen Pfad ableiten:

```text
media/<module>/<category>/<file>
moduleKey = erster Pfadteil unter media-root
categoryKey = zweiter Pfadteil unter media-root
fullCategoryKey = moduleKey/categoryKey
source = media_dir
```

Da `relativePath` im Agent-Walk root-relativ ist, bedeutet das unter dem `media`-Root:

```text
<module>/<category>/<file>
```

Das Inventory-Item sollte aber fuer Remote/DB/Dashboard eindeutig auch den Webpfad und optional den globalen Asset-Pfad tragen:

```text
assetRelativePath = media/<module>/<category>/<file>
relativePath = <module>/<category>/<file>   // root-relativ, bestehende Kompatibilitaet
webPath = /assets/media/<module>/<category>/<file>
```

Alternative, falls remote_media_index bereits rootKey + relativePath verwendet:

```text
id = media:<module>/<category>/<file>
rootKey = media
relativePath = <module>/<category>/<file>
assetRelativePath = media/<module>/<category>/<file>
```

### 4. Existing legacy behavior erhalten

Legacy-Items muessen weiterhin kompatibel bleiben:

```text
id = sounds:<relativePath>
rootKey = sounds
relativePath = <relativePath unter assets/sounds>
publicPath = /assets/sounds/<relativePath>
source = legacy_scan
moduleKey = legacy
categoryKey = sounds oder erkannte Unterkategorie
```

### 5. Exclusion-Regeln pruefen

Aktuelle TTS-Generated-Regel betrifft:

```text
rootKey: sounds
relativePathPrefix: tts/generated/
```

Diese Regel bleibt fuer Legacy bestehen.

Falls es im neuen Media-System spaeter TTS-temp-Dateien gibt, muss eine eigene Regel ergaenzt werden, z. B.:

```text
rootKey: media
relativePathPrefix: tts/generated/
```

oder konkreter:

```text
rootKey: media
relativePathPrefix: tts/<category>/generated/
```

Das darf nicht geraten werden. Erst Quelle/aktuellen TTS-Ablagepfad pruefen.

## Spaeterer RDAP-Testpfad

Die spaetere dedizierte Testdatei soll im neuen Media-System liegen:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Remote-/Agent-Identitaet nach geplanter neuer Logik:

```text
rootKey: media
source: media_dir
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
relativePath: rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
assetRelativePath: media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
webPath: /assets/media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
id: media:rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
kind: audio
mediaType: audio
```

## Sicherheitsgrenzen

Dieser Step fuehrt nichts aus.

```text
keine Source-Aenderung
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Execute
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
kein Webserver-Deploy
```

## Naechster Block

```text
RDAP_0.2.71_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PREP
```

Ziel:

```text
Kleine Source-Aenderung in backend/modules/remote_agent.js vorbereiten/umsetzen:
- media-Root read-only aufnehmen
- Item-Felder fuer source/moduleKey/categoryKey/fullCategoryKey/assetRelativePath/webPath ergaenzen
- Legacy-Verhalten erhalten
- keine Testdatei
- keine DB-Gates/kein Execute
```
