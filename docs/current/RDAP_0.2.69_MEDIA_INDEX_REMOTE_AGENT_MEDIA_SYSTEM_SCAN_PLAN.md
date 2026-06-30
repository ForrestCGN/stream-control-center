# RDAP 0.2.69 - Media Index Remote-Agent Media-System Scan Plan

## Zweck

Dieser Step plant die Ausrichtung des RDAP-Remote-Agent-Media-Scans auf das aktuelle lokale Media-System.

0.2.69 ist ein Doku-/Plan-Step.

Es werden keine Source-Dateien geaendert.
Es wird keine Testdatei angelegt.
Es werden keine lokalen Dateien verschoben oder geloescht.
Es gibt keinen DB-Write, keine Migration, keine Gates und keinen Tombstone-Execute.

## Ausgangspunkt

Bestaetigter Stand nach 0.2.68:

```text
Legacy-Assets bleiben gueltig und werden weiter genutzt:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images

Neues Media-System fuer neue Uploads / Media-ID:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Wichtig: Legacy-Dateien duerfen nicht verschoben, geloescht oder automatisch migriert werden.

## Relevante Code-Erkenntnis

`backend/modules/media.js` ist die lokale Media-Registry.

Dort gilt fachlich:

```text
Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
Keine bestehenden Assets werden verschoben oder geloescht.
```

Der Remote-Agent-Scan in `backend/modules/remote_agent.js` ist dagegen aktuell noch legacy-orientiert:

```text
sounds -> htdocs/assets/sounds
videos -> htdocs/assets/videos
images -> htdocs/assets/images
```

## Zielbild fuer spaetere Source-Aenderung

Der Remote-Agent-Media-Inventory-Scan soll spaeter beide Welten lesen:

```text
1. Neues Media-System:
   htdocs/assets/media/<moduleKey>/<categoryKey>/...

2. Legacy-Roots:
   htdocs/assets/sounds/...
   htdocs/assets/videos/...
   htdocs/assets/images/...
```

Dabei bleibt alles read-only.

## Dashboard-/Sortier-Anforderung

Die Kategorien sollen nicht nur als Pfadbestandteil mitlaufen, sondern fuer Dashboard und Remote-Modboard nutzbar sein.

Spaeterer Transport/Index sollte fuer neue Media-System-Dateien mindestens bereitstellen:

```text
rootKey: media
source: media_dir
moduleKey: <module>
categoryKey: <category>
fullCategoryKey: <module>/<category>
relativePath: media/<module>/<category>/<filename>
webPath: /assets/media/<module>/<category>/<filename>
kind: audio|video|image|animation|media
type/category fuer UI-Filter kompatibel halten
```

Fuer Legacy-Dateien sollte spaeter mindestens klar erkennbar sein:

```text
rootKey: sounds|videos|images
source: legacy_scan
moduleKey: legacy
categoryKey: sounds|videos|images oder legacy
fullCategoryKey: legacy/<...>
relativePath: sounds/... | videos/... | images/...
webPath: /assets/sounds/... | /assets/videos/... | /assets/images/...
```

Damit kann das Dashboard spaeter sauber sortieren und filtern nach:

```text
- Quelle: media_dir vs legacy_scan
- Modul: alerts, soundalerts, commands, rdap-test, ...
- Kategorie: general, persistent-tombstone, follow, raid, ...
- Typ/Kleid: audio/video/image/animation
- Legacy ja/nein
```

## Spaeterer RDAP-Test-Kontext

Wenn der Scan das neue Media-System beruecksichtigt, bleibt der spaetere Testkontext:

```text
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
```

Geplanter spaeterer Testpfad:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Relativer Pfad:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Dieser Pfad wird in 0.2.69 nicht angelegt.

## Sicherheit

Weiterhin verboten:

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

## Naechster Block

```text
RDAP_0.2.70_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PLAN
```

Ziel:

```text
Konkreten Source-Aenderungsplan fuer backend/modules/remote_agent.js erstellen:
- neue Scan-Roots / Scan-Strategie fuer assets/media/<module>/<category>
- Legacy-Roots behalten
- Kategorien/Module in Inventory-Items transportieren
- Dashboard-/Remote-Index-Felder kompatibel halten
- weiterhin read-only
```
