## 2026-05-11 - STEP238 DeathCounter Command-API Bridge

- `backend/modules/deathcounter_v2.js` erweitert.
- Neue zentrale Route `GET/POST /api/deathcounter/v2/command` ergaenzt.
- `command=dcount`, `command=rip` und `command=tode` werden serverseitig verarbeitet.
- Streamer.bot-kompatibles Antwortformat ergaenzt: `streamerbot_send` und `streamerbot_message`.
- `@`-Pflicht fuer Spielerbefehle technisch vorbereitet ueber `requireMention=1` bzw. Env-Fallback.
- Bestehende DeathCounter-Routen, JSON-State, Overlay und Zaehllogik bleiben erhalten.
- Keine DB-, Dashboard-, Overlay- oder Streamer.bot-Action-Aenderung.

---

## 2026-05-11 - STEP237 Hug/Rehug Command-Flow verifiziert

- Hug/Rehug Command-Flow per API geprueft.
- `/api/hug/command?command=hug...` funktioniert mit den Streamer.bot-relevanten Parametern.
- `/api/hug/command?command=rehug...` blockiert korrekt, wenn kein vorheriger Gegen-Hug existiert.
- `/api/hug/statscmd` und Toplisten funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug dokumentiert.
- Wichtige Ausgaberegel dokumentiert: `result.streamerbot_send` beachten, damit Streamer.bot keine Doppelposts erzeugt.
- Keine Code-, Config-, Dashboard- oder DB-Dateien geaendert.

---

# CHANGELOG - stream-control-center

Aeltere ausfuehrliche STEP-Historie bleibt in den einzelnen `project-state/STEP*.md` Dateien erhalten. Dieses Changelog ist ab STEP232 bewusst als kompakte aktuelle Arbeitschronik gehalten.
