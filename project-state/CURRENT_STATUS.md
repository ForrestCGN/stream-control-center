# Current Status – stream-control-center

Stand: 2026-05-21

## STEP270A - Sound Loudness Scanner Read-only

Ein neuer read-only Backend-Scanner fuer Sound-Lautheit ist vorbereitet.

Aktueller funktionaler Stand:

- Neues Modul `backend/modules/sound_loudness_scanner.js`.
- Modul wird automatisch ueber den vorhandenen `backend/modules/*.js` Loader geladen.
- Standard-Scanbasis ist `htdocs/assets/sounds`.
- Messung erfolgt ueber `ffmpeg` + `loudnorm` im Analysemodus.
- Ergebnisse werden DB-basiert in neuen Tabellen gespeichert:
  - `sound_loudness_scans`
  - `sound_loudness_files`
- Tabellen werden nur per `CREATE TABLE IF NOT EXISTS` angelegt.
- Es werden keine Sound-Dateien veraendert.
- Es wird keine Sound-System-Queue, kein Discord-Routing und keine Alert-Bundle-Logik veraendert.

Neue API-Routen:

```text
GET  /api/sound/loudness/status
POST /api/sound/loudness/scan
GET  /api/sound/loudness/results
GET  /api/sound/loudness/file?file=relative/path.mp3
GET  /api/sound/loudness/routes
```

Nach Deploy zu testen:

```powershell
node --check backend\modules\sound_loudness_scanner.js
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 20 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

## STEP269A-C - Sound/Discord Integration STABLE

Der Sound-/Discord-Stand ist nach manuellen Tests stabil.

Bestaetigt:

```text
STEP269A - Sound-System Discord Target Playback
STEP269B - Sound-System Discord Auto Routing
STEP269C - VIP-/Mod-Sounds auf target=both
```

Aktueller funktionaler Stand:

- Sound-System ist Master fuer Queue, Prioritaeten, Bundle-Lock und Startzeitpunkt.
- Discord-Ausgabe haengt am echten Sound-System-Item-Start.
- Discord nutzt die vorhandene Bridge aus `backend/modules/discord.js`.
- `backend/modules/sound_system.js` fuehrt Discord-Playback ueber `app.locals.discordBridge.enqueueSound(...)` aus.
- `backend/modules/vip_sound_overlay.js` setzt fuer echte VIP-/Mod-Sounds nicht mehr hart `target=stream`.
- VIP-/Mod-Sounds nutzen jetzt konfigurierbares `soundSystemTarget`, Standard `both`.

Live bestaetigt:

```text
target=both + outputTarget=device + category=vip + source=vip_mod
discord.lastOk=true
discordStarted steigt
discordFailed=0
```

Nicht geaendert:

```text
app.sqlite
config/**
Streamer.bot-Flows
Overlay-HTML
alert_system.js
soundalerts_bridge.js
tts_system.js
```

Offen:

- Echter SoundAlert/Kanalpunkte-Ablauf beobachten.
- Echter Alert + Alert-TTS Ablauf beobachten.
- Normales Chat-TTS nur anfassen, wenn Discord-Ausgabe dort fehlt.
- Optional: MP3s mit eingebettetem Cover/Artwork nicht als Video behandeln, wenn nur Audio gewuenscht ist.

## STEP268C - Active Bundle Lock Direct Start Guard

- Sound-System beachtet `activeBundleLock` auch beim Direktstart.
- Kein fremder Sound darf zwischen Alert-Hauptsound und passende Alert-TTS starten.
- V5-Real-Mod-Test bestaetigt.

## STEP268B - Alert Bundle Dedupe Bypass Robust

- Alert-Bundle-Items umgehen Same-Sound-/Same-User-Dedupe.
- Gleiche Alert-Hauptsounds werden nicht mehr gedroppt.
- TTS bleibt beim passenden Alert.
