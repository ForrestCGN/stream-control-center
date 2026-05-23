# Changelog

## STEP274K - Media Module Categories + Recent Uploads

- `media_assets` sanft um `module_key` und `category_key` erweitert.
- Neue Tabelle `media_categories` vorbereitet.
- Standardkategorien für general, commands, alerts, soundalerts, birthday, vip, rewards, tts und system geseedet.
- Upload-Zielpfade auf `htdocs/assets/media/<moduleKey>/<categoryKey>/` vorbereitet.
- API `/api/media/categories` ergänzt.
- API `/api/media/category/upsert` ergänzt.
- API `/api/media/picker-options` mit `view=recent` ergänzt.
- Bestehende Medien bleiben unverändert.
