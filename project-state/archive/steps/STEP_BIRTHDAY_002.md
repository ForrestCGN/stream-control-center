# STEP_BIRTHDAY_002 – Birthday Registrierung + kleine Auto-Gratulation

Stand: 2026-05-22

## Ziel

Neues Birthday-Modul als erster stabiler Backend-STEP:

- Chat-Command über das zentrale Command-System: `!birthday`
- User können ihren Geburtstag selbst registrieren
- Kleine automatische Chat-Gratulation, wenn ein registrierter User an seinem Geburtstag normal im Chat schreibt
- Optionaler Tagebuch-Systemeintrag bei automatischer Gratulation
- Noch keine große Show, kein Overlay, kein Video, kein Song

## Betroffene Dateien

Neu:

- `backend/modules/birthday.js`
- `config/birthday.json`
- `project-state/STEP_BIRTHDAY_002.md`

Geändert / zu aktualisieren:

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Command-Verhalten

Der Command läuft über das bestehende Command-System. Das Birthday-Modul legt beim Start eine Command-Definition in `command_definitions` an, falls `birthday` noch nicht existiert.

- Trigger: `!birthday`
- Alias: `!bday`
- Ziel: `POST /api/birthday/command`
- Permission: `everyone`
- User-Cooldown: 5000 ms
- Global-Cooldown: 1000 ms

Unterbefehle:

```text
!birthday set 22.05
!birthday set 22.05.1980
!birthday show
!birthday delete
!birthday today
!bday set 22.05
```

## Automatische Gratulation

Die automatische Gratulation ist bewusst kein Command, weil der User dabei nur normal im Chat schreibt.

Ablauf:

1. Twitch-Presence empfängt eine normale Chatnachricht.
2. Das bestehende Command-System verarbeitet mögliche Commands weiter wie bisher.
3. Das Birthday-Modul prüft danach die Chataktivität.
4. Wenn der User registriert ist und heute Geburtstag hat, wird einmal pro lokalem Datum gratuliert.
5. Optional wird ein Tagebuch-Systemeintrag geschrieben.

Wichtig:

- Command-Nachrichten werden für Auto-Gratulation übersprungen.
- Standardmäßig wird nur gratuliert, wenn der Tagebuch-State einen aktiven Stream meldet.
- Es wird kein Overlay, kein Sound und kein Video automatisch gestartet.

## Datenbank

Neue Tabellen werden nur sanft per Migration angelegt:

- `birthday_users`
- `birthday_greetings_log`
- `birthday_settings`

Keine bestehende SQLite-Datenbank wird überschrieben oder ersetzt.

## Textvarianten

Modul-Key für Textvarianten:

```text
birthday
```

Wichtige Textkeys:

- `usage`
- `register_success`
- `register_updated`
- `show_own_birthday`
- `show_missing`
- `delete_success`
- `delete_missing`
- `invalid_date`
- `registration_disabled`
- `birthday_greeting_chat`
- `birthday_diary_entry`
- `today_none`
- `today_list`
- `already_greeted`
- `command_disabled`

## API-Routen

- `GET /api/birthday/status`
- `POST /api/birthday/command`
- `GET /api/birthday/today`
- `POST /api/birthday/reload`

## Bewusst nicht enthalten

- Kein Dashboard-Modul
- Kein Overlay
- Kein Video
- Kein Song
- Keine Medienverwaltung-Anbindung
- Keine Sound-/Alert-/TTS-Queue-Änderung
- Kein großer Show-Command

## Minimaltests

Nach Entpacken, Commit und Deploy:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\birthday.js
node --check backend\modules\commands.js
```

Nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/list"
```

Command-Test über API:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/test" -Method POST -ContentType "application/json" -Body '{"message":"!birthday set 22.05","userLogin":"testuser","displayName":"TestUser"}'
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday show","userLogin":"testuser","displayName":"TestUser"}'
```

Live im Twitch-Chat:

```text
!birthday set 22.05
!birthday show
!birthday delete
```

## Nächster sinnvoller STEP

`STEP_BIRTHDAY_003`:

- Dashboard-Modul für Birthday-Verwaltung
- Registrierte Geburtstage anzeigen/bearbeiten
- Settings im Dashboard bearbeiten
- Textvarianten im Dashboard anbinden

Später:

`STEP_BIRTHDAY_004`:

- Manuelle Show über `!birthday party username`
- Video, Overlay, Song und Party-Animation
- Medienauswahl über zentrale Medienverwaltung
