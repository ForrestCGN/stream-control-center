# NEXT STEPS - stream-control-center

Stand: 2026-05-21

## Nach STEP269A-C - Sound/Discord Live-Beobachtung

Der Sound-/Discord-Pfad ist technisch bestaetigt. Nicht weiter umbauen, solange kein neuer Fehler nachweisbar ist.

Weiter im echten Betrieb beobachten:

```text
SoundAlert/Kanalpunkte-Sound kommt im Discord an
Alert-Hauptsound kommt im Discord an
Alert-TTS bleibt beim passenden Alert und kommt ggf. im Discord an
VIP-/Mod-Sounds kommen weiter im Discord an
Normales Chat-TTS nur pruefen, falls Discord-Ausgabe dafuer gewuenscht ist
```

Wenn ein Sound nicht im Discord ankommt, zuerst Diagnose sammeln:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s.current | ConvertTo-Json -Depth 20
$s.queue | ConvertTo-Json -Depth 20
$s.discord | ConvertTo-Json -Depth 20
$s.stats | ConvertTo-Json -Depth 20
$s.config.discordRouting | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/discord/queue/status" | ConvertTo-Json -Depth 20
```

Besonders pruefen:

```text
item.target
item.outputTarget
item.category
item.source
item.lifecycle.discordRouted
discord.lastOk
discord.lastError
stats.discordStarted
stats.discordFailed
```

Nicht sofort anfassen:

```text
app.sqlite
config/**
Streamer.bot-Flows
Overlay-HTML
Alert-Bundle-Lock
Sound-System Queue-/Prioritaetslogik
```

## Optionaler spaeterer Mini-Fix

MP3-Dateien mit eingebettetem Cover/Artwork koennen als `mediaType=video` erkannt werden.

Beispiel-Befund:

```text
opa01.mp3 -> mediaType=video, outputTarget=overlay
```

Das ist fuer Discord aktuell nicht kritisch, kann aber spaeter bereinigt werden, wenn reine MP3s grundsaetzlich als Audio fuer Device-Ausgabe behandelt werden sollen.
