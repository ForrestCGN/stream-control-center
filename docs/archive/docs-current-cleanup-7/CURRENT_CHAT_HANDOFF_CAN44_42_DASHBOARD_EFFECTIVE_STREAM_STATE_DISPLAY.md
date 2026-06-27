# Current Chat Handoff CAN44.42 Dashboard Effective Stream State Display

CAN44.42 ändert nur die Dashboard-Anzeige des Live-Status-Monitors. Der bisher verwirrende Zustand, dass oben ein Manual Override aktiv ist, unten aber `Projekt-Live: OFFLINE` angezeigt wird, wurde bereinigt.

Der Projekt-Live-Hero heißt nun sinngemäß `Effektiver Stream-State` und nutzt bei aktivem Override den effektiven `twitch_events.streamState`. Die Quellen-Kacheln werden klar als `Echte Quellen` ausgewiesen.

Betroffene Dateien:

- `htdocs/dashboard/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.css`

Keine Backend-Änderungen.
