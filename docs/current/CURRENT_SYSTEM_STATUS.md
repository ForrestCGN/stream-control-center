# CURRENT_SYSTEM_STATUS

## STEP273B – Commands Dashboard

Stand: 2026-05-22

Das zentrale Command-System ist nach STEP273A1 live bestätigt und wird mit STEP273B im Dashboard sichtbar gemacht.

### Aktueller bestätigter Stand

- Command-Core läuft unter `/api/commands/*`.
- `STEP273A1` ist aktiv.
- `schemaOk=true`.
- `lastError` ist leer.
- `/api/commands/execute` funktioniert.
- `/api/commands/logs` und `/api/commands/history` funktionieren.
- Echte Twitch-Chat-Befehle laufen über `twitch_presence.js` in `commands.js`, wenn Twitch-Presence aktiv und verbunden ist.
- `!dcount show` wurde erfolgreich über Twitch-Chat bis zum Deathcounter geroutet.

### STEP273B

Dashboard-Modul `Commands` ergänzt:

- Status-Übersicht
- Twitch-Presence-Status mit Start/Stop
- Command-Liste mit Bearbeitung
- Aktiv/Inaktiv-Schalter
- Rechte-Level
- Cooldowns
- Ziel-URL/Modul/Action
- Testcenter mit DryRun und Execute
- Log-Ansicht

### Wichtige Regel

Das Command-System verarbeitet echte Twitch-Chatnachrichten nur, wenn `/api/twitch/presence/status` mindestens `desiredActive=true`, `connected=true`, `authenticated=true` und `joined=true` zeigt.

### Offene Punkte

- Streamer.bot-Commands noch nicht entfernen.
- Dashboard-UX nach Screenshot/Praxistest ggf. verfeinern.
- Weitere Module erst nach und nach migrieren.
