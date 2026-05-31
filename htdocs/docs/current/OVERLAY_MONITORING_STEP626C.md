# Overlay Monitoring – STEP626C

STEP626C ergänzt die Dashboard-Bewertung für Sonderfälle:

- `Rahmen` wird über `rahmen_overlay` sauber dem Bus-Client zugeordnet.
- `Overlay Birthday.html` ist als Legacy-Alias vorhanden und sendet dieselben Birthday-Heartbeats wie `_overlay-birthday.html`.
- `about:blank` und leere OBS-Browserquellen gelten als Platzhalter und erwarten keinen CGN-EventBus.
- Platzhalter werden nicht mehr als `Bus fehlt` oder `Heartbeat fehlt` bewertet.

Keine OBS-Aktionen, keine Reparaturfunktionen, keine Designänderung.
