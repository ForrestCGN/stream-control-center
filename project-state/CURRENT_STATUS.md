# Current Status – stream-control-center

Stand: 2026-05-21

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
