# CURRENT_STATUS

Stand: 2026-06-19

## Shot-Alarm

Aktueller geprüfter Stand: **SHOT-ALARM-2C shotdone command**

Backend Shot-Alarm:

- `backend/modules/shot_alarm.js`
- Modulversion: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`

Command-System:

- `backend/modules/commands.js`
- Modulversion: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Dashboard-Fix-Stand:

- `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`

## Funktionsstand

Shot-Alarm ist als Event-Untermodul im Event-System eingebunden:

`Community → Event-System → Shot-Alarm`

Zusätzlich:

- Texte unter `Community → Event-System → Texte`
  - Textbereiche `Shot-Alarm Chat` und `Shot-Alarm Overlay`
- Config unter `Community → Event-System → Config`
  - Config-Bereich-Dropdown `Event-System` / `Shot-Alarm`
  - Event-System-Config bleibt vollständig erhalten.
  - Shot-Alarm-Config ist separat auswählbar.

## Neu in STEP 2C

`!shotdone` ist über das bestehende Command-System angebunden.

Command:

- Trigger: `!shotdone`
- Alias: `!shotgetrunken`
- Modul: `shot_alarm`
- Zielroute: `POST /api/shot-alarm/shot-done`
- ResponseMode: `module`
- Standardrechte:
  - `engelcgn`
  - `roxxyfoxxy`
  - Broadcaster
  - Mods

Wichtig:

- Das Command-System sendet keine eigene zusätzliche Antwort.
- Die Chatmeldung kommt vom Modul `shot_alarm` über dessen Textvarianten `shotDone` / `shotDoneEmpty`.

## Geprüfte Regeln

- Einzel-Sub/Resub/GiftSub: 20 %
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50
- jeder 10. einzelne Sub/Resub/GiftSub: 100 %
- 5er Bombe: 50/50
- je 10 Subs in Bombe: 1 sicherer Shot
- 100er Bombe: 10 Shots
- je 1.000 Bits: 50/50
- je 10.000 Bits: 100 %
- Ko-fi/Tipeee vorbereitet: je 10 € = 50/50, noch nicht produktiv angebunden

## Geprüfte Runtime

- Communication-Bus-Registrierung aktiv.
- 10-Sekunden-Auslosungsphase funktioniert.
- Ergebnis wird danach resolved.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- `shot-done` Route funktioniert.
- `!shotdone` wird vom Command-System erkannt und erfolgreich an `shot_alarm` weitergeleitet.
- Overlay-Statusleiste und Ergebnis-Overlay vorhanden.
- DB-Texte und DB-Config über vorhandene Helper eingebunden.

## Erfolgreich geprüfte Tests

Command-System Status:

- `ok=true`
- `moduleVersion=0.2.4`
- `moduleBuild=STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`
- `schemaOk=true`
- `busChatSubscriber.active=true`

Dry-Run:

- `!shotdone` wird korrekt erkannt.
- User `EngelCGN` wird über `allowedLogins` erlaubt.
- Zielroute ist `POST /api/shot-alarm/shot-done`.

Execute:

- `!shotdone` wird korrekt ausgeführt.
- Ergebnis: `ok=true`, `statusCode=200`, `dataOk=true`, `module=shot_alarm`.

Shot-Test:

- Testevent `10.000 Bits` erzeugt korrekt 1 sicheren Shot.
- Nach Auslosung: `shotsOpen=1`, `shotsDrunk=0`, `shotsAddedTotal=1`.
- Danach wurde `!shotdone` erfolgreich ausgeführt.

Hinweis:

- Die finale Nachprüfung der Counter direkt nach `!shotdone` sollte im Live-System noch einmal mit `GET /api/shot-alarm/status` gemacht werden.

## Wichtig

Dashboard-Config-Dropdown darf bestehende Event-System-Einstellungen nie löschen oder ersetzen. Event-System und Shot-Alarm speichern getrennt.

Keine neue parallele Command-Struktur bauen. Shot-Alarm nutzt die vorhandene Command-Verarbeitung.
