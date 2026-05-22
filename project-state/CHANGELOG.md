# CHANGELOG

## STEP273A1 – Command-System Core Fix

- Rekursionsrisiko in `backend/modules/commands.js` behoben.
- Schema-/Seed-Ablauf abgesichert.
- `lastError` wird nach erfolgreicher Ausfuehrung geleert.
- Log-Resultate werden kompakt gespeichert.
- `/api/commands/history` als Alias fuer `/api/commands/logs` ergaenzt.

## STEP273A – Command-System Core

- Command-System Core eingefuehrt.
- DB-Tabellen `command_definitions` und `command_execution_log` erstellt.
- Seed-Commands fuer Deathcounter angelegt.
- API-Routen unter `/api/commands/*` bereitgestellt.
- Hook fuer Twitch-PRIVMSG ueber `twitch_presence.js` vorbereitet.
