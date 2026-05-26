# STEP274K – Finaler Übergabestand Medienverwaltung / Sound-System / Commands

Stand: 2026-05-23

## Bestätigter Zielzustand

Die Architektur wurde gemeinsam festgelegt und bis STEP274K vorbereitet:

```text
Medienverwaltung = zentrale Registry / Verwaltung / Upload / Metadaten
Sound-System     = zentraler Abspielpunkt für Audio, Video und Animation
Commands         = speichern Media-ID und routen auf /api/sound/play-media
```

Wichtig: Die Medienverwaltung spielt nicht selbst ab. Sie verwaltet Dateien, Kategorien, IDs und Metadaten. Das Sound-System bleibt der zentrale Playback-Hub.

## Bestätigte STEPs

### STEP274B
Media-Scan/Fix:
- Typ-Erkennung verbessert.
- Upload-/Scan-Typen sauberer behandelt.
- Bestehende Legacy-Dateien werden registriert, nicht verschoben.

### STEP274C
Command-Media-Bridge:
- Commands können Medienoptionen aus der Medienverwaltung beziehen.
- Dashboard-Komponente `commands_media.js` vorbereitet.

### STEP274D
Central Media Resolver:
- Medien können zentral per Media-ID aufgelöst werden.
- `/api/media/resolve?id=<id>` eingeführt.
- Resolver liefert Pfade, Browser-Preview, Sound-System-Kompatibilität und Metadaten.

### STEP274E / E1 / E2
Sound-Media-Bridge:
- `/api/sound/play-media?mediaId=<id>` eingeführt.
- Medien werden bei Bedarf in `_media_registry` gecacht/kopiert.
- Audio/Video-Medien werden über das Sound-System abgespielt.
- MP3-Dateien mit Cover-Art werden korrekt als Audio behandelt.

### STEP274F
Command Execution Routing:
- Command-Media-Auswahl setzt automatisch:
  - `moduleKey = sound_media_bridge`
  - `targetMethod = POST`
  - `targetUrl = /api/sound/play-media?mediaId=<id>`

### STEP274G / G1
Video-Testpfad und Korrektur:
- STEP274G hatte einen separaten Video-Overlay-Testpfad eingeführt.
- Danach wurde festgestellt: Das bestehende `sound_system_overlay.html` kann bereits Audio und Video.
- G1 korrigierte die Route zurück auf das Sound-System.

### STEP274H
Sound-System als offizieller Media-Playback-Hub:
- `/api/sound/play-media` offiziell als zentraler Media-Abspielweg festgelegt.
- Audio, Video und Animation laufen zentral über das Sound-System.

### STEP274I
Deprecated-Testpfad markiert:
- `video_media_bridge.js` und `_overlay-media-player.html` wurden nicht gelöscht.
- Sie wurden nur als deprecated/Testpfad markiert.
- Offizieller Weg bleibt `/api/sound/play-media`.

### STEP274J
Praxischeck:
- `/api/commands/media-command-check?trigger=<trigger>` vorbereitet.
- Prüft gespeicherte Media-Commands gegen Media-ID, Ziel-URL und Sound-Hub-Route.

### STEP274K
Media-Kategorien + Neueste Uploads vorbereitet:
- Grobe Kategorie = `moduleKey`, wird vom aufrufenden Modul vorgegeben.
- Zusatzkategorie = `categoryKey`, kann vom User gewählt oder angelegt werden.
- Neue Upload-Zielstruktur vorbereitet:
  `htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>`
- Virtuelle Ansicht „Neueste Uploads“ vorbereitet.
- Keine bestehenden Dateien werden verschoben.

## Final bestätigter Architektur-Satz

```text
Media verwaltet, Sound spielt ab.
```

## Bestätigte Tests

### STEP274H / STEP274I / STEP274J
Bestätigt:
- `sound_media_bridge step: STEP274I/STEP274J`
- `officialPlaybackHub: True`
- `playbackEndpoint: /api/sound/play-media`
- `existingOverlay: /overlays/sound_system_overlay.html`
- Video `mediaId=266` wurde erfolgreich über `/api/sound/play-media` abgespielt.

### STEP274K Kategorie-Upsert
Bestätigt:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/category/upsert" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"moduleKey":"soundalerts","categoryKey":"test","label":"SoundAlerts / Test"}'
```

Ergebnis:
- `ok: True`
- `step: STEP274K`
- `moduleKey: soundalerts`
- `categoryKey: test`
- `relativeDir: soundalerts/test`
- `isSystem: False`

Damit ist bestätigt:
```text
Grobe Kategorie = moduleKey
Zusatzkategorie = categoryKey
Speicherpfad = htdocs/assets/media/<moduleKey>/<categoryKey>/
```

## Offizieller nächster Step

### STEP274L – Zentraler Media-Picker + Upload-Dialog

Ziel:
- Einen wiederverwendbaren Media-Picker im Dashboard bauen.
- Andere Module sollen ihn öffnen können, z. B. Alerts, Commands, VIP, Birthday, SoundAlerts.
- Das aufrufende Modul gibt `moduleKey` fest vor.
- User wählt/erstellt `categoryKey`.
- Upload läuft zentral über Medienverwaltung.
- Ergebnis wird an das aufrufende Modul zurückgegeben:
  - `mediaId`
  - `label`
  - `type`
  - `webPath`
  - `durationMs`
  - `moduleKey`
  - `categoryKey`

## Wichtig für den neuen Chat

Nicht wieder bei Sound-/Video-Architektur anfangen. Der Stand ist entschieden:

```text
Offizieller Media-Playback-Hub:
POST/GET /api/sound/play-media?mediaId=<id>

Offizielles Overlay:
htdocs/overlays/sound_system_overlay.html

Medienverwaltung:
Registry, Upload, Kategorien, Picker, Metadaten
```

`video_media_bridge.js` ist deprecated/Testpfad und nicht der offizielle Weg.

## Keine Funktionalität entfernen

Bestehende Funktionen, Dateien und Legacy-Pfade dürfen nicht vorschnell gelöscht werden. Neue Picker-/Upload-Logik soll ergänzen und bestehende Systeme sanft anbinden.
