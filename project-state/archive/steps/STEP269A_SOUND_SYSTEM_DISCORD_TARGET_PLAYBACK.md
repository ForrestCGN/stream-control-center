# STEP269A - Sound-System Discord Target Playback

Datum: 2026-05-21

## Ziel

Discord Voice Playback wird als Ausgabeziel des bestehenden Sound-Systems ergänzt.

Das Sound-System bleibt weiterhin Master für Queue, Priorität, Bundle-Lock und Reihenfolge.
Alert-System, SoundAlerts, VIP-/Mod-Sounds und TTS sollen nicht direkt eine eigene Discord-Queue ansteuern.

## Geänderte Dateien

- `backend/modules/sound_system.js`
- `project-state/STEP269A_SOUND_SYSTEM_DISCORD_TARGET_PLAYBACK.md`

## Änderung

In `sound_system.js` wurde ergänzt:

- neuer Runtime-State `state.discord`
- neue Statistikwerte:
  - `discordStarted`
  - `discordFailed`
- neue Helper:
  - `shouldUseDiscord(item)`
  - `getDiscordBridge()`
  - `playDiscordOutput(item)`
- `activateItemAudio()` ruft beim echten Item-Start zusätzlich `playDiscordOutput(item)` auf.

Discord wird nur verwendet, wenn das Sound-System-Item als Ziel `target: "discord"` oder `target: "both"` hat.

Die Discord-Ausgabe läuft fire-and-forget über die vorhandene Bridge:

- `app.locals.discordBridge.enqueueSound(item.file)`
- Fallback: `ctx.discordBridge.enqueueSound(item.file)`

Fehler bei Discord blockieren die Sound-System-Queue nicht.

## Bewusst nicht geändert

- keine Änderung an `app.sqlite`
- keine Änderung an `config/**`
- keine Änderung am Alert-System
- keine Änderung am TTS-System
- keine Änderung an Overlay-HTML
- keine Änderung an Streamer.bot-Flows
- keine eigene neue Discord-Queue
- keine direkte Alert-zu-Discord-Verkabelung

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\sound_system.js
```

Erwartung: keine Ausgabe / Exit Code 0.

## Manueller Funktionstest

Voraussetzungen:

- Discord-Bot ist bereit.
- `DISCORD_GUILD_ID` und `DISCORD_VOICE_CHANNEL_ID` sind gesetzt.
- Discord-Bridge ist unter `/api/discord/status` ready.
- Sound-System-Target `discord` oder `both` ist in der aktiven Config/DB erlaubt.

Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=test_ping.mp3&target=both&outputTarget=device&category=test&priority=50"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/discord/queue/status"
```

Prüfen:

- Sound startet weiterhin im Stream-/Device-Ausgabeweg.
- Discord spielt denselben Sound ab oder queued ihn.
- `/api/sound/status` zeigt `discord.lastOk`, `discord.lastError`, `discordStarted` und `discordFailed`.
- Queue-Reihenfolge im Sound-System bleibt unverändert.

## Offene Punkte

- Falls `config.targets.discord.enabled` oder `config.targets.both.enabled` noch `false` ist, muss das später über die bestehende Config-/Dashboard-Logik aktiviert werden.
- Danach kann ein echter Alert-/SoundAlert-/VIP-Mod-Test mit Discord-Ausgabe folgen.
