# Current Status

Aktueller Stand: STEP274M

## Media-Picker / Commands

STEP274L ist nach FIX1 bis FIX4 im Live-Test stabilisiert.

- Zentraler Dashboard-Media-Picker ist vorhanden.
- Commands nutzen den Picker für `sound_play` und `video_play`.
- Media-Commands speichern Media-IDs.
- Offizieller Playback-Weg ist `/api/sound/play-media?mediaId=<id>`.
- `sound_media_bridge` löst Media-Assets auf, erzeugt bei Bedarf eine Kompatibilitätskopie unter `htdocs/assets/sounds/_media_registry/` und gibt an das Sound-System weiter.
- Standard-Ausgabe für Media-Commands ist Device + Discord:

```text
target       = both
outputTarget = device
volume       = 85
```

Overlay-Ausgabe ist nur noch explizit per Override vorgesehen.

## Getestet

- `!roxxy2`
- Media-ID-Auflösung
- Cache-Kopie
- Sound-System-Queue
- Volume-Fallback
- Device/Discord-Default

## Architektur

```text
Medienverwaltung = Registry / Upload / Kategorien / Metadaten
Sound-System     = offizieller Abspielpunkt
Commands         = Media-ID -> /api/sound/play-media
```

## Nächster Schritt

STEP274N: SoundAlerts an den zentralen Media-Picker anbinden.
