# Current Status

Aktueller Stand: STEP274L

Der zentrale Media-Picker für das Dashboard ist als wiederverwendbare Komponente vorbereitet:

- `window.MediaPicker.open({ moduleKey, allowedTypes, onSelect })` ist verfügbar.
- Picker kann neueste Uploads, Modul-Medien, allgemeine Medien und alle Medien anzeigen.
- Picker unterstützt Typfilter, Zusatzkategorie-Filter und Suche.
- Picker kann Medien hochladen.
- Picker kann neue Zusatzkategorien für das vorgegebene Modul anlegen.
- Auswahl gibt das gewählte Asset inklusive `id` als `mediaId` an das aufrufende Modul zurück.

Commands nutzt den Picker als erste Integration:

- Die bisherigen langen Media-Selects werden durch den Button `Medium auswählen` ersetzt.
- `moduleKey = commands` wird beim Picker fest vorgegeben.
- Sound-Commands erlauben `audio`.
- Video-Commands erlauben `video` und `animation`.
- Nach Auswahl setzt Commands automatisch:
  - `mediaId`
  - `targetUrl = /api/sound/play-media?mediaId=<id>`
  - `moduleKey = sound_media_bridge`
  - `actionKey = play_audio_media` oder `play_video_media`
  - `targetMethod = POST`
  - `responseMode = module`

Backend bleibt unverändert. STEP274L nutzt die in STEP274K vorbereiteten Media-APIs.
