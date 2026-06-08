# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4K.2

## Fix

Statische Chat-Setup-Routen werden vor der dynamischen `:giveawayUid`-Route registriert.

## Routen

```text
GET  /api/loyalty/giveaways/commands
GET  /api/loyalty/giveaways/texts
POST /api/loyalty/giveaways/texts
```

## Nicht geändert

```text
Commands bleiben inaktiv.
Keine Twitch-Command-Ausführung.
Keine Streamer.bot-Anbindung.
!join bleibt unberührt.
```
