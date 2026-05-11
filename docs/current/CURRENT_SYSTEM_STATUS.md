# CURRENT_SYSTEM_STATUS - STEP246 Update

DeathCounter Game-Change ueber Twitch EventSub wurde eingebaut.

- Twitch EventSub `channel.update` wird in `backend/modules/twitch.js` verarbeitet.
- Das neue Twitch-Spiel wird per lokaler API an `/api/deathcounter/v2/game` uebergeben.
- Streamer.bot ist fuer Game-Changed-Sync nach erfolgreichem Live-Test nicht mehr noetig.
- Stream-Start-Sync bleibt sinnvoll, weil dort Session-Reset und Overlay-Spieler-Reset haengen.
- `/api/twitch/eventsub/status` zeigt den neuen Bereich `deathcounterSync`.

Keine Count-, DB-, Dashboard-, Overlay- oder DeathCounter-Modul-Migration in diesem STEP.
