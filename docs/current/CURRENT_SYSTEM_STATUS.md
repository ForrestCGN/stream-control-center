# Current System Status

Stand: STEP274L

## Media / Sound Architektur

- Medienverwaltung ist zentrale Registry für Dateien, Media-IDs und Metadaten.
- Sound-System bleibt offizieller zentraler Abspielpunkt über `/api/sound/play-media`.
- Audio, Video und Animationen werden über das bestehende `sound_system_overlay.html` abgespielt.

## Media-Kategorien

Neue Uploads werden strukturiert abgelegt:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

Regeln:

- `moduleKey` wird vom aufrufenden Modul fest vorgegeben.
- `categoryKey` ist die vom User wählbare/anlegbare Zusatzkategorie.
- „Neueste Uploads“ ist nur eine virtuelle Ansicht über `created_at`, kein Dateiverzeichnis.

## Zentraler Media-Picker

STEP274L ergänzt einen wiederverwendbaren Dashboard-Picker:

```js
MediaPicker.open({
  moduleKey: 'commands',
  allowedTypes: ['audio', 'video', 'animation'],
  onSelect(asset) {}
});
```

Der Picker kann:

- neueste Uploads anzeigen
- Medien des aufrufenden Moduls anzeigen
- allgemeine Medien anzeigen
- alle Medien anzeigen
- nach Typ filtern
- nach Zusatzkategorie filtern
- nach Name/Pfad/Kategorie suchen
- Medium auswählen
- neues Medium hochladen
- neue Zusatzkategorie anlegen

## Erste Integration: Commands

Commands nutzt den zentralen Picker statt langer Dropdown-Liste.

Nach Auswahl eines Mediums setzt Commands:

- `mediaId`
- `targetUrl = /api/sound/play-media?mediaId=<id>`
- `moduleKey = sound_media_bridge`
- `actionKey = play_audio_media` oder `play_video_media`
- `targetMethod = POST`
- `responseMode = module`

## Nächster Schritt

STEP274M: Live-Test von Commands + Picker, danach Alerts oder SoundAlerts an denselben Picker anbinden.
