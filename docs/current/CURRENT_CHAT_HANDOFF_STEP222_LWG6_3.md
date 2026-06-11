# Current Chat Handoff – STEP222 / LWG-6.3

Forrest wollte nach der Live-Aktivierung von Gamble die Texte verbessern und Prozent-Einsätze wie `!gamble 10%` im Node-System sauber unterstützen.

STEP222 liefert vollständige Ziel-Dateien, keine Patches:

- `backend/modules/loyalty_games.js`
- `backend/modules/loyalty_games/gamble.js`

Wichtig:

- Nach Apply `stepdone.cmd` ausführen.
- Backend neu starten.
- Danach den STEP222-Test ausführen.
- StreamElements darf während der Übergangsphase noch parallel antworten.
