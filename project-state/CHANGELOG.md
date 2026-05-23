# Changelog

## STEP274M - Media-Picker Live-Test Abschluss / Doku

- STEP274L mit FIX1 bis FIX4 als funktionierenden Stand dokumentiert.
- Live-Test `!roxxy2` als Referenz für Media-Command-Playback festgehalten.
- Festgelegt: Media-Commands laufen standardmäßig über Device + Discord.
- Festgelegt: Overlay-Ausgabe nur per explizitem Override.
- Prüfrouten dokumentiert:
  - `/api/commands/media-command-check?trigger=<trigger>`
  - `/api/sound/play-media?mediaId=<id>`
  - `/api/sound/media-bridge/status`
  - `/api/sound/status`
- Nächster Schritt auf SoundAlerts-Anbindung gesetzt.

## STEP274L-FIX4 - Sound Media Bridge Device/Discord Defaults

- Standard für `/api/sound/play-media` bei Media-Commands auf `target=both`, `outputTarget=device`, `volume=85` gesetzt.
- Overlay bleibt per explizitem Override möglich.

## STEP274L-FIX3 - Sound Media Bridge Volume-Fallback

- Fehler behoben, bei dem fehlender/leerer `volume`-Parameter als `0` interpretiert wurde.
- Media-Commands spielen dadurch nicht mehr stumm.

## STEP274L-FIX2 - Commands Media Upsert Guard

- Speichern von `sound_play`/`video_play` robust gemacht.
- Router-Felder werden aus `mediaId` abgeleitet, unabhängig von UI-Injection.

## STEP274L-FIX1 - Commands Media Routing

- Routing nach Auswahl/bei vorhandener Media-ID stabilisiert.

## STEP274L - Zentraler Media-Picker + Commands-Integration

- Zentralen Dashboard-Media-Picker ergänzt.
- Commands an Picker angebunden.
- Lange Media-Select-Liste durch Button „Medium auswählen“ ersetzt.
- Picker unterstützt Recent, Modul, Allgemein, Alle Medien, Suche, Typfilter, Kategorie und Upload.

## STEP274K - Media Module Categories + Recent Uploads

- `media_assets` sanft um `module_key` und `category_key` erweitert.
- Neue Tabelle `media_categories` vorbereitet.
- Standardkategorien für general, commands, alerts, soundalerts, birthday, vip, rewards, tts und system geseedet.
- Upload-Zielpfade auf `htdocs/assets/media/<moduleKey>/<categoryKey>/` vorbereitet.
- API `/api/media/categories` ergänzt.
- API `/api/media/category/upsert` ergänzt.
- API `/api/media/picker-options` mit `view=recent` ergänzt.
- Bestehende Medien bleiben unverändert.
