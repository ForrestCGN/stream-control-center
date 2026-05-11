# STEP044.6 - TTS Overlay Avatar, DisplayName und Position Fix

Stand: 2026-05-04

## Zweck

Kleiner Layout-/Frontend-Fix fuer das normale Chat-TTS-Overlay nach Umstellung auf Sound-System-Visual-State.

Keine Backend-Logik geaendert.

## Geaendert

Datei:

- `htdocs/overlays/_overlay-tts.html`

Anpassungen:

- Avatar-Kreis statt Mikrofon-Orb.
- Avatar wird aus `visual.avatarUrl` gelesen, wenn vorhanden.
- Fallback-Aufloesung ueber `/userinfo?login=<login>` wie beim VIP-Prinzip, damit Avatar und Twitch-Anzeigename nachgeladen werden koennen.
- Wenn kein Avatar verfuegbar ist, werden Initialen angezeigt.
- Anzeigename wird bevorzugt aus `visual.displayName`, danach aus Userinfo, dann Login genommen.
- Standardposition hoeher gesetzt: `bottom=110` statt `bottom=74`.
- Bottom-Position berechnet nun die Kartenmitte mit halber Card-Hoehe, damit die Card nicht am unteren Rand klebt.

## OBS URL Empfehlung

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&bottom=110&scale=1&poll=1
```

Debug bei Bedarf:

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&bottom=110&scale=1&poll=1&debug=1
```

## Test

- Backend muss nicht neu gestartet werden, wenn nur die Overlay-Datei getauscht wurde.
- OBS Browserquelle Cache aktualisieren.
- Quelle deaktivieren/aktivieren.
- Normalen `!tts` Test ausloesen.

Erwartung:

- Ton ueber Sound-System.
- Overlay zeigt Twitch-Anzeigename.
- Overlay zeigt Avatar oder Initialen-Fallback.
- Card sitzt sichtbar hoeher und nicht direkt am unteren Rand.
