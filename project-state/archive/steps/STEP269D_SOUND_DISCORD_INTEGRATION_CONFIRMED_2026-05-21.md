# STEP269D - Sound/Discord Integration dokumentiert

Stand: 2026-05-21

## Ergebnis

Die Discord-Ausgabe fuer das Sound-System ist funktional bestaetigt.

Bestaetigte Teilsteps:

```text
STEP269A - Sound-System Discord Target Playback
STEP269B - Sound-System Discord Auto Routing
STEP269C - VIP-/Mod-Sounds auf Sound-System target=both umgestellt
```

## Funktional bestaetigt

- Discord-Client ist online.
- Discord-Voice-Channel wird genutzt.
- Sound-System kann Sounds ueber die bestehende Discord-Bridge abspielen.
- `target=both` spielt ueber Stream/Device und Discord.
- Automatisches Routing funktioniert fuer passende Kategorien/Quellen.
- Test mit `category=vip` ohne explizites `target` wurde automatisch auf `target=both` gesetzt.
- Echter VIP-/Mod-Ablauf wurde korrigiert, weil `vip_sound_overlay.js` vorher hart `target: "stream"` gesetzt hatte.
- Nach STEP269C kommen echte VIP-/Mod-Sounds im Discord an.

## Tests / Befunde

### STEP269A

Nach Live-Deploy waren im Sound-System-Status neue Felder sichtbar:

```text
discord
stats.discordStarted
stats.discordFailed
```

Damit war bestaetigt, dass die STEP269A-Datei live geladen wurde.

### STEP269B

Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&category=vip&priority=60"
```

Befund:

```text
item.target = both
discord.lastOk = true
discordStarted steigt
```

### Device-Pfad

Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=nichtfluchen.mp3&target=both&outputTarget=device&category=vip&source=vip_mod&priority=60"
```

Befund:

```text
mediaType = audio
outputTarget = device
target = both
source = vip_mod
discord.lastOk = true
deviceStarted steigt
discordStarted steigt
discordFailed = 0
```

Damit ist bestaetigt: Device-Ausgabe verhindert Discord-Ausgabe nicht.

### VIP-/Mod-Ablauf

Ursache fuer den zuerst fehlenden echten VIP-/Mod-Sound im Discord:

```text
backend/modules/vip_sound_overlay.js setzte target hart auf "stream".
```

STEP269C hat das auf ein konfigurierbares Setting umgestellt:

```text
soundSystemTarget = both
```

## Geaenderte Dateien in STEP269A-C

```text
backend/modules/sound_system.js
backend/modules/vip_sound_overlay.js
project-state/STEP269A_SOUND_SYSTEM_DISCORD_TARGET_PLAYBACK.md
project-state/STEP269B_SOUND_SYSTEM_DISCORD_AUTO_ROUTING.md
project-state/STEP269C_VIP_SOUND_SYSTEM_TARGET_BOTH.md
```

## Bewusst nicht geaendert

```text
app.sqlite
config/**
Streamer.bot-Flows
Overlay-HTML
alert_system.js
soundalerts_bridge.js
tts_system.js
```

## Aktueller Status

```text
Sound-System + Discord-Ausgabe: STABLE nach manuellem Test
VIP-/Mod-Sounds in Discord: bestaetigt
Device-Ausgabe + Discord: bestaetigt
Auto-Routing fuer Kategorien/Quellen: bestaetigt
```

## Offene Punkte

- Echter SoundAlert/Kanalpunkte-Sound im Live-Ablauf weiter beobachten.
- Echter Alert mit Hauptsound + Alert-TTS im Live-Ablauf weiter beobachten.
- Normales Chat-TTS nur dann weiter anfassen, wenn es nicht wie gewuenscht im Discord landet.
- Optionaler Mini-Fix: MP3s mit eingebettetem Cover/Artwork werden teilweise als `mediaType=video` erkannt. Das ist fuer Discord aktuell nicht kritisch, kann aber spaeter fuer Device-/Overlay-Auswahl bereinigt werden.
