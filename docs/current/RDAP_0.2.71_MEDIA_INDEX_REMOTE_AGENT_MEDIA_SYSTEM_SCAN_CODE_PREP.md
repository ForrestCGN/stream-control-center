# RDAP 0.2.71 - Media Index Remote-Agent Media-System Scan Code Prep

## Ziel

0.2.71 bereitet die Source-Struktur fuer den spaeteren Remote-Agent-Media-System-Scan vor.

Dieser Step ist bewusst klein und risikoarm:

- Neues helper-Modul fuer Media-Inventory-Root-/Kategorie-Metadaten.
- Keine Aenderung an bestehender Scan-Ausfuehrung in `backend/modules/remote_agent.js`.
- Keine bestehenden Dateien verschieben oder loeschen.
- Keine Testdatei anlegen.
- Kein DB-Write.
- Keine Gates.
- Kein Tombstone-Execute.

## Source-Aenderung

Neu:

```text
backend/modules/helpers/helper_media_inventory_roots.js
```

Der Helper beschreibt side-effect-free:

```text
Neues Media-System:
assets/media/<module>/<category>/...

Legacy:
assets/sounds
assets/videos
assets/images
```

## Warum nur Helper und noch kein Wiring?

`backend/modules/remote_agent.js` ist ein grosser Laufzeit-Agent. 0.2.71 fuehrt deshalb zuerst eine isolierte, syntax-pruefbare und nebenwirkungsfreie Hilfsstruktur ein.

Das eigentliche Wiring in `remote_agent.js` folgt separat, damit der produktive lokale Agent-Scan klein und kontrolliert geaendert werden kann.

## Geplante spaetere Item-Felder

Fuer Media-System-Dateien:

```text
rootKey: media
source: media_dir
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
relativePath
webPath/publicPath
kind/mediaType
```

Fuer Legacy-Dateien:

```text
rootKey: sounds|videos|images
source: legacy_scan
moduleKey: legacy
categoryKey
fullCategoryKey: legacy/<category>
assetRelativePath
relativePath
webPath/publicPath
kind/mediaType
```

## Geplanter spaeterer Testpfad

Noch nicht anlegen:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Relativ:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Geplante Identitaet:

```text
id: media:rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
rootKey: media
source: media_dir
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
kind/mediaType: audio
```

## Sicherheit

```text
keine Aenderung an remote_agent.js Runtime-Wiring
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Execute
kein Webserver-Deploy
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center
node --check .\backend\modules\helpers\helper_media_inventory_roots.js
git status
```
