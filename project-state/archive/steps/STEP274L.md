# STEP274L - Zentraler Media-Picker + Commands-Integration

## Ziel

Ein zentraler Dashboard-Media-Picker soll Medienauswahl und Upload wiederverwendbar machen. Erste konkrete Integration ist das Commands-Modul.

## Geändert

- `htdocs/dashboard/components/media_picker.js`
  - neue globale Komponente `window.MediaPicker`
  - Tabs/Ansichten: Neueste Uploads, Dieses Modul, Allgemein, Alle Medien
  - Typfilter, Zusatzkategorie-Filter und Suche
  - Medienauswahl mit Preview
  - Upload mit festem `moduleKey`
  - neue Zusatzkategorie per `/api/media/category/upsert`
  - Upload per `/api/media/upload`

- `htdocs/dashboard/components/media_picker.css`
  - Modal-/Picker-Design für Dashboard

- `htdocs/dashboard/index.html`
  - zentrale Picker-CSS eingebunden
  - zentrale Picker-JS vor den Dashboard-Modulen eingebunden

- `htdocs/dashboard/modules/commands_media.js`
  - lange Media-Selects durch Button `Medium auswählen` ersetzt
  - Picker-Aufruf mit `moduleKey: commands`
  - Sound: allowedTypes `audio`
  - Video: allowedTypes `video`, `animation`
  - Auswahl setzt Media-ID und Routing auf `/api/sound/play-media?mediaId=<id>`

- `htdocs/dashboard/modules/commands_media.css`
  - Styling für Commands-Picker-Button und aktuelle Auswahl

## Nicht geändert

- Kein Backend-Code geändert.
- Keine Datenbankdatei geändert.
- Keine Medien-Dateien verschoben oder gelöscht.
- Bestehende Command-Speicherlogik bleibt erhalten.
- Sound-System bleibt offizieller Abspielpunkt.

## Tests

Syntax geprüft:

```text
node --check htdocs/dashboard/components/media_picker.js
node --check htdocs/dashboard/modules/commands_media.js
```

Manuelle Live-Tests nach Entpacken:

```text
http://127.0.0.1:8080/dashboard/
```

1. Dashboard öffnen.
2. Commands-Modul öffnen.
3. Sound-Command auswählen oder anlegen.
4. Bei `Medium-ID` auf `Medium auswählen` klicken.
5. Medium auswählen.
6. Prüfen, ob gesetzt wird:
   - `moduleKey = sound_media_bridge`
   - `actionKey = play_audio_media`
   - `targetMethod = POST`
   - `targetUrl = /api/sound/play-media?mediaId=<id>`
7. Speichern.
8. Optional prüfen:

```text
/api/commands/media-command-check?trigger=<trigger>
```

## Nächster sinnvoller Schritt

STEP274M:

- Live-Test Commands + Picker
- danach Alerts oder SoundAlerts an denselben Picker anbinden
