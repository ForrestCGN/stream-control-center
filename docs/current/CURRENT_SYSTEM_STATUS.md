# Current System Status - STEP277A_FIX1

Aktueller Stand: Clip-Shoutout über Sound-System ist eingebunden, Command-Target-Fix erledigt.

## Clip-Shoutout

- Modul: `backend/modules/clip_shoutout.js`
- Route: `/api/clip-shoutout/run`
- Aliasroute: `/api/clip/shoutout`
- Status: `/api/clip-shoutout/status`
- Command: `!vso`
- Aliase: `!clipso`, `!videoso`

## Sound-System-Integration

Clip-Shoutouts werden als Sound-System-Bundle queued. Dadurch laufen Bild/Ton über das zentrale Sound-System und nicht über Streamer.bot.

## STEP277A_FIX1

Behoben:

- `!vso @user` wurde über das Command-System fälschlich als auslösender User interpretiert.
- `parseTarget()` nutzt jetzt echte Zielargumente vor Actor-Feldern.
- Erwartbare Fehler werden als HTTP 200 JSON zurückgegeben, damit das Command-System keine irreführenden `target_http_404`-Fehler protokolliert.
- `lastRun`/`lastRunAt` werden auch bei erwartbaren Fehlern gesetzt.

## Nicht geändert

- Sound-System-Queue bleibt unverändert.
- Overlay-Design bleibt unverändert.
- TTS bleibt optional und standardmäßig deaktiviert.
- Keine bestehende Funktionalität entfernt.
