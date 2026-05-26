# Changelog – STEP274B bis STEP274K

## Zusammenfassung

Die zentrale Medienverwaltung wurde mit dem Sound-System und dem Command-System verbunden.

## Ergebnis

```text
Media-ID → /api/sound/play-media → Sound-System → sound_system_overlay.html
```

## Wichtigste Änderungen

- Media-Typ-Erkennung korrigiert.
- Zentrale Media-Registry/Resolver eingeführt.
- Sound-Media-Bridge eingeführt.
- Command-Media-Bridge eingeführt.
- Sound-System als offizieller Media-Playback-Hub festgelegt.
- Separater Video-Testpfad als deprecated markiert.
- Media-Kategorien vorbereitet:
  - `moduleKey`
  - `categoryKey`
- Virtuelle Ansicht „Neueste Uploads“ vorbereitet.
- Upload-Zielstruktur für neue Uploads vorbereitet:
  `htdocs/assets/media/<moduleKey>/<categoryKey>/`

## Getestet

- Video `mediaId=266` wird über Sound-System abgespielt.
- Kategorie `soundalerts/test` lässt sich anlegen/aktualisieren.
