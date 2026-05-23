# Current Status

Aktueller Stand: STEP274K

Die Medienverwaltung unterstützt jetzt das geplante Kategorienmodell:

- Modul-Kategorie (`moduleKey`) wird vom aufrufenden Modul vorgegeben.
- Zusatzkategorie (`categoryKey`) kann gewählt oder angelegt werden.
- Neue Uploads gehen nach `htdocs/assets/media/<moduleKey>/<categoryKey>/`.
- „Neueste Uploads“ ist als virtuelle Picker-Ansicht vorbereitet.

Sound-System bleibt offizieller Media-Playback-Hub über `/api/sound/play-media`.
