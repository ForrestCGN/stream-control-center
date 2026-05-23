# Current System Status

Stand: STEP274K

## Media / Sound Architektur

- Medienverwaltung ist zentrale Registry für Dateien, Media-IDs und Metadaten.
- Sound-System bleibt offizieller zentraler Abspielpunkt über `/api/sound/play-media`.
- Audio, Video und Animationen werden über das bestehende `sound_system_overlay.html` abgespielt.

## Media-Kategorien

Neue Uploads werden künftig strukturiert abgelegt:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

Regeln:

- `moduleKey` wird vom aufrufenden Modul fest vorgegeben.
- `categoryKey` ist die vom User wählbare/anlegbare Zusatzkategorie.
- „Neueste Uploads“ ist nur eine virtuelle Ansicht über `created_at`, kein Dateiverzeichnis.

## Nächster Schritt

STEP274L: Zentralen Media-Picker / Upload-Dialog im Dashboard bauen.
