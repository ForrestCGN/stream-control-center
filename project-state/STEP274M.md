# STEP274M - Media-Picker Live-Test Abschluss / Doku

Stand: STEP274M

## Ziel

STEP274M dokumentiert den funktionierenden Endstand nach STEP274L und den Hotfixes FIX1 bis FIX4.

Es wurden in STEP274M keine neuen Runtime-Funktionen ergänzt. Der Schritt ist ein Abschluss-/Dokuschritt, damit der aktuelle Stand für den nächsten Chat und weitere Module eindeutig ist.

## Finaler Funktionsstand

### Zentraler Media-Picker

- Dashboard besitzt einen wiederverwendbaren `window.MediaPicker`.
- Picker wird aktuell zuerst vom Commands-Modul genutzt.
- Picker öffnet mit festem `moduleKey`, z. B. `commands`.
- `categoryKey` ist vom User wählbar/anlegbar.
- Neue Uploads werden unter folgendem Schema gespeichert:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

- „Neueste Uploads“ ist eine virtuelle Ansicht über `view=recent&limit=20`, kein echter Ordner.

### Commands

Media-Commands speichern weiterhin eine Media-ID, nicht direkt einen Dateipfad.

Für `sound_play` / `video_play` wird beim Speichern robust gesetzt:

```text
moduleKey    = sound_media_bridge
targetMethod = POST
targetUrl    = /api/sound/play-media?mediaId=<id>
responseMode = module
```

Je nach Medium:

```text
audio              -> actionKey = play_audio_media
video / animation  -> actionKey = play_video_media
```

### Offizieller Playback-Weg

Der offizielle Weg für Media-Commands ist:

```text
Command -> /api/sound/play-media?mediaId=<id> -> sound_media_bridge -> sound_system
```

Die Medienverwaltung bleibt Registry für Dateien/IDs/Metadaten.  
Das Sound-System bleibt offizieller Playback-/Queue-/Output-Hub.

## Hotfixes, die zum finalen Stand gehören

### FIX1 - Commands Media Routing

Problem:
- Bereits vorhandene Media-ID wurde beim Öffnen/Speichern nicht zuverlässig wieder auf Router-Felder übertragen.

Ergebnis:
- UI-Routing wurde stabilisiert.

### FIX2 - Commands Media Upsert Guard

Problem:
- Die Speicherung durfte sich nicht auf nachträglich injizierte UI-Felder verlassen.

Ergebnis:
- Beim Speichern eines Media-Commands werden Router-Felder aus `mediaId` robust gesetzt.

### FIX3 - Sound Media Bridge Volume-Fallback

Problem:
- Fehlender/leerer `volume`-Parameter wurde als `0` interpretiert.
- Sound spielte technisch, war aber stumm.

Ergebnis:
- Media-Bridge nutzt bei fehlender Volume-Angabe einen sinnvollen Fallback.

### FIX4 - Device/Discord Defaults

Problem:
- `/api/sound/play-media` fiel ohne explizite Parameter auf Overlay-Ausgabe zurück.
- Gewünschter Standard ist Device + Discord.

Ergebnis:
- Standard für Media-Commands:

```text
target       = both
outputTarget = device
volume       = 85
```

Overlay-Ausgabe bleibt explizit möglich, z. B.:

```text
/api/sound/play-media?mediaId=1311&target=stream&outputTarget=overlay
```

## Erfolgreicher Live-Test

Getesteter Command:

```text
!roxxy2
```

Ergebnis:
- Command ist korrekt geroutet.
- Media-ID wird aufgelöst.
- Datei existiert.
- Cache-Kopie wird unter `htdocs/assets/sounds/_media_registry/` erzeugt.
- Sound wird über Sound-System abgespielt.
- Nach FIX4 passt der Standard für Device/Discord.

## Wichtige Prüfrouten

Command prüfen:

```text
/api/commands/media-command-check?trigger=<trigger>
```

Media direkt abspielen:

```text
/api/sound/play-media?mediaId=<id>
```

Media-Bridge-Status:

```text
/api/sound/media-bridge/status
```

Sound-System-Status:

```text
/api/sound/status
```

## Keine Änderung in STEP274M

- Keine SQLite-Datei verändert.
- Keine Medien-Dateien verschoben.
- Keine bestehende Command-Funktion entfernt.
- Keine Sound-System-Prioritätslogik verändert.
- Keine Alert-/SoundAlert-Anbindung umgesetzt.

## Nächster sinnvoller Schritt

STEP274N:

- SoundAlerts an den zentralen Media-Picker anbinden.

Danach:

- Alerts an Media-Picker anbinden.
- Birthday / VIP / Rewards später anbinden.
- Media-Kategorien im Dashboard komfortabler verwaltbar machen.
