# Neuer Chat – Startpunkt STEP274L

## Bitte im neuen Chat so starten

Weiter mit:

```text
STEP274L – Zentraler Media-Picker + Upload-Dialog
```

## Ausgangslage

Bis STEP274K ist vorbereitet:

```text
Medienverwaltung = Registry / Upload / Kategorien / Metadaten
Sound-System     = offizieller Abspielpunkt
Commands         = Media-ID → /api/sound/play-media
```

## Wichtigste Entscheidung

Die grobe Kategorie wird vom Modul vorgegeben:

```text
moduleKey = commands / alerts / soundalerts / birthday / vip / rewards / general
```

Die Zusatzkategorie ist durch den User wählbar oder neu anlegbar:

```text
categoryKey = general / test / bits / fun / intro / outro / ...
```

Neue Uploads sollen gespeichert werden unter:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

„Neueste Uploads“ ist keine echte Datei-Kategorie, sondern eine virtuelle Ansicht:

```text
view=recent&limit=20
```

## Ziel für STEP274L

Ein zentraler Media-Picker/Upload-Dialog für das Dashboard:

```text
MediaPicker.open({
  moduleKey: 'commands',
  allowedTypes: ['audio', 'video', 'animation'],
  onSelect(asset) { ... }
})
```

Der Picker soll können:
- Neueste Uploads anzeigen.
- Dieses Modul anzeigen.
- Nach Typ filtern.
- Nach Zusatzkategorie filtern.
- Suche nach Name/Pfad/Kategorie.
- Medium auswählen.
- Neues Medium hochladen.
- Neue Zusatzkategorie anlegen.
- Nach Auswahl `mediaId` an das aufrufende Modul zurückgeben.

## Erste konkrete Integration

Commands-Modul:
- Die lange Dropdown-Liste durch Button ersetzen:
  `Medium auswählen`
- Picker öffnet mit:
  `moduleKey = commands`
- Auswahl setzt:
  - `mediaId`
  - `targetUrl = /api/sound/play-media?mediaId=<id>`
  - `moduleKey = sound_media_bridge`
  - `actionKey = play_audio_media` oder `play_video_media`
  - `targetMethod = POST`

## Danach

Nach Commands:
- Alerts an Picker anbinden.
- SoundAlerts an Picker anbinden.
- Birthday an Picker anbinden.
- VIP/Rewards später.
