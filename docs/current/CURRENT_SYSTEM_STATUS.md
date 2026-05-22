# CURRENT_SYSTEM_STATUS

## STEP273A1 – Command-System Core Fix

Stand: 2026-05-22

Der neue Command-System-Core wurde nach dem ersten Live-Test repariert.

### Bestaetigter Kontext

- STEP273A wurde live geladen.
- `/api/commands/status` war erreichbar.
- `/api/commands/list` zeigte Seed-Commands.
- `/api/commands/execute?message=!dcount%20show&user=forrestcgn&role=mod` fuehrte den Deathcounter-Befehl aus.
- Deathcounter-Overlay wurde sichtbar.
- `/api/commands/logs` lieferte Logs.

### Fix in STEP273A1

- Rekursionsrisiko in der Schema-/Seed-Logik entfernt.
- `lastError=Maximum call stack size exceeded` behoben.
- `/api/commands/history` als Alias fuer `/api/commands/logs` ergaenzt.
- Log-Resultate werden kompakt gespeichert, um grosse oder zyklische Payloads zu vermeiden.

### Aktuelle Command-Routen

- `GET /api/commands/status`
- `GET /api/commands/list`
- `POST /api/commands/upsert`
- `POST /api/commands/delete`
- `GET/POST /api/commands/test`
- `GET/POST /api/commands/execute`
- `GET /api/commands/logs`
- `GET /api/commands/history`

### Offene Punkte

- Echter Twitch-Chat-Hook muss nach STEP273A1 nochmals live getestet werden.
- Dashboard-Modul fuer Commands folgt in STEP273B.
