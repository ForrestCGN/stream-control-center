# Changelog

## STEP274L - Zentraler Media-Picker + Commands-Integration

- Zentralen Dashboard-Media-Picker als `window.MediaPicker` ergänzt.
- Picker unterstützt Neueste Uploads, Modul-Ansicht, Allgemein-Ansicht und Alle-Medien-Ansicht.
- Picker unterstützt Typfilter, Zusatzkategorie-Filter und Suche.
- Picker unterstützt Upload nach `htdocs/assets/media/<moduleKey>/<categoryKey>/` über bestehende Media-API.
- Picker unterstützt das Anlegen neuer Zusatzkategorien über bestehende Media-API.
- Commands-Medienauswahl von langer Dropdown-Liste auf Button `Medium auswählen` umgestellt.
- Commands setzt nach Auswahl automatisch Media-ID und Sound-System-Route `/api/sound/play-media?mediaId=<id>`.
- Backend unverändert gelassen.

## STEP274K - Media Module Categories + Recent Uploads

- `media_assets` sanft um `module_key` und `category_key` erweitert.
- Neue Tabelle `media_categories` vorbereitet.
- Standardkategorien für general, commands, alerts, soundalerts, birthday, vip, rewards, tts und system geseedet.
- Upload-Zielpfade auf `htdocs/assets/media/<moduleKey>/<categoryKey>/` vorbereitet.
- API `/api/media/categories` ergänzt.
- API `/api/media/category/upsert` ergänzt.
- API `/api/media/picker-options` mit `view=recent` ergänzt.
- Bestehende Medien bleiben unverändert.
