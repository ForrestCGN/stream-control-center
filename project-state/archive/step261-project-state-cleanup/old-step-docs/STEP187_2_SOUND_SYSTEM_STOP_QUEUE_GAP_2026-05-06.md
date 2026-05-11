# STEP187.2 - Sound-System Stop/Queue Gap

Stand: 2026-05-06

## Zweck

Dieser STEP stabilisiert den Stop-Ablauf im Sound-System, wenn ein Overlay-Video laeuft und bereits weitere Sounds in der Queue stehen.

## Ausgangslage

STEP187.1 hat das Overlay so erweitert, dass es bei Backend-State `current = null` lokal laufende Audio-/Video-Ausgabe beendet.

Im Live-Test wurde aber sichtbar:

- `POST /api/sound/stop` setzt Backend-State korrekt auf `current = null`.
- Das Overlay-Video stoppt kurz danach.
- Wenn bereits ein weiterer Sound in der Queue steht, startet der naechste Sound zu schnell.
- Ergebnis: Der neue Sound kann kurz ueber das noch nicht beendete Overlay-Video laufen.

## Ursache

In `backend/modules/sound_system.js` startete `stopCurrent()` den naechsten Queue-Eintrag bisher sofort:

```js
setTimeout(() => startNextIfPossible("after_stop"), 0);
```

Das ist fuer reine Device-Sounds ok, aber fuer Overlay-Videos zu schnell, weil OBS/Browser den Player asynchron beendet.

## Aenderung

`stopCurrent()` prueft nun, ob der gestoppte Sound ein Overlay-Ziel nutzt.

- Wenn ja: naechster Queue-Eintrag startet erst nach `config.overlay.gapBetweenSoundsMs`, mindestens aber nach 250 ms.
- Wenn nein: bisheriges Verhalten bleibt praktisch unveraendert, Start nach 0 ms.

Damit bekommt das Overlay Zeit, den laufenden Video-/Audio-Player sauber zu stoppen, bevor der naechste Queue-Eintrag startet.

## Betroffene Dateien

- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html` aus STEP187.1 bleibt im ZIP enthalten, damit der Overlay-Safety-Fix beim Entpacken nicht verloren geht.

## Nicht geaendert

- Keine Datenbank-Aenderung.
- Keine Config-Aenderung.
- Keine Secrets.
- Keine Entfernung bestehender Funktionen.
- Video-Dateien bleiben bewusst Overlay-only.
- Audio-Dateien folgen weiterhin `outputTarget` (`device`, `overlay`, `both`).

## Testempfehlung

1. Langes Overlay-Video starten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=soundalerts/video/3cgn.mp4&category=test&priority=100&volume=70" | ConvertTo-Json -Depth 20
```

2. Waehrend das Video laeuft, Device-Sound in Queue legen:

```powershell
$body = @{
  file = "airhorn.mp3"
  category = "test"
  priority = 100
  outputTarget = "device"
  volume = 70
} | ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 20
```

3. Video stoppen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/stop" -Method POST | ConvertTo-Json -Depth 20
```

Erwartung:

- Video stoppt ohne OBS-Cache-Reload.
- Der naechste Queue-Sound startet erst nach kurzer Pause.
- Kein deutliches Uebereinanderlaufen mehr.

## Bewusst offen

- `generated_beep` mit `outputTarget=device` funktioniert noch nicht, weil der Device-Helper eine echte Datei erwartet und `generated/beep.wav` nur als API-URL existiert.
- Optional spaeter: Overlay koennte nach lokalem Stop ein eigenes Client-Event melden, damit `client.lastEvent` aussagekraeftiger wird.
