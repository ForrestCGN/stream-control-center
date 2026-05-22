# CURRENT_STATUS

## STEP273B – Commands Dashboard

Das Command-System ist im Dashboard sichtbar und verwaltbar vorbereitet.

### Status

- Backend-Core: `STEP273A1`
- Dashboard-Step: `STEP273B`
- Command-API aktiv: `/api/commands/*`
- Twitch-Presence-Hook bestätigt, wenn Presence verbunden ist
- Dashboard-Modul: `commands`
- Bereich: Community

### Funktionen im Dashboard

- Status anzeigen
- Twitch-Presence anzeigen/starten/stoppen
- Commands anzeigen
- Commands bearbeiten/speichern
- Commands aktivieren/deaktivieren
- Commands löschen
- Command-Test per DryRun
- Command-Test per Execute
- Logs anzeigen

### Wichtig

Twitch-Presence muss aktiv sein, sonst empfängt Node keine echten Chatbefehle.
