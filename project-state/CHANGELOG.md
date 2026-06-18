# CHANGELOG – STEP EVS52.19

## EVS52.19 – Winner Finale Manual End

- Gewinner-Finale ist jetzt ein manueller Zustand, kein Timer-/Poll-gesteuertes Overlay mehr.
- Backend setzt `winnerFinale.active=true` beim Start/Replay und `active=false` erst beim manuellen Beenden.
- Neuer Endpoint: `POST /api/stream-events/events/:eventUid/finale/end?confirm=1`.
- Dashboard zeigt nach Finale-Start den Button `⏹ Finale beenden`.
- Winner-Overlay bleibt sichtbar, bis ein explizites Hide-/Ende-Event vom Backend kommt.
- Latest-/Polling-Checks dürfen ein laufendes Finale nicht mehr ausblenden.

Nicht geändert: Punkte, Ranking, Sound-/Satzlogik, Chatquelle, Botfilter, Datenbank-Schema.
