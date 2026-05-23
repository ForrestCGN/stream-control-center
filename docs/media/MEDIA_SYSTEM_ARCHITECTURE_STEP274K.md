# Medien-System Architektur – Stand STEP274K

## Rollen

### Medienverwaltung
Die Medienverwaltung ist die zentrale Registry.

Sie ist zuständig für:
- Upload
- Dateipfade
- Media-IDs
- Typen
- Dauer/Breite/Höhe
- Metadaten
- Kategorien
- Suche/Filter
- Picker-Optionen

Sie spielt keine Medien direkt ab.

### Sound-System
Das Sound-System ist der zentrale Abspielpunkt.

Es ist zuständig für:
- Queue
- Audio-Ausgabe
- Video/Animation über bestehendes Overlay
- Lautstärke
- Prioritäten
- Output-Ziel
- zukünftige Sound-/Media-Regeln

Offizieller Abspiel-Endpunkt:

```text
/api/sound/play-media?mediaId=<id>
```

Offizielles Overlay:

```text
/overlays/sound_system_overlay.html
```

### Commands / Alerts / Module
Module speichern nur Media-IDs oder referenzieren Medien.

Sie sollten keine eigenen Upload-Systeme mehr bauen, sondern den zentralen Media-Picker/Upload-Dialog verwenden.

## Kategorie-Modell

```text
moduleKey   = grobe Kategorie, vom Modul fest vorgegeben
categoryKey = Zusatzkategorie, vom User wählbar/anlegbar
```

Beispiele:

```text
commands/fun
alerts/bits
soundalerts/test
birthday/general
vip/general
```

Dateipfad:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

## Virtuelle Ansichten

„Neueste Uploads“ ist keine echte Speicher-Kategorie.

Es ist eine dynamische Ansicht über `uploadedAt/createdAt/updatedAt`:

```text
/api/media/picker-options?view=recent&limit=20
```

## Altpfade

Legacy-Dateien bleiben registriert und werden nicht verschoben.

Deprecated:
- `/api/video/*`
- `_overlay-media-player.html`

Offiziell:
- `/api/sound/play-media`
- `sound_system_overlay.html`
