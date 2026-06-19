# CURRENT_STATUS

Stand: 2026-06-19

## Shot-Alarm

Aktueller geprüfter Stand: **SHOT-ALARM-2D Dashboard Audit Safety**

Backend Shot-Alarm:

- `backend/modules/shot_alarm.js`
- Modulversion: `0.2.2`
- Build: `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`

Command-System:

- `backend/modules/commands.js`
- Modulversion: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Dashboard-Fix-Stand:

- `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`
- `SHOT-ALARM-2D Dashboard Audit Safety`

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

## Neu in STEP 2D

Dashboard-/API-Safety wurde ergänzt, ohne die bestehenden Dashboard-Flows zu ersetzen.

Neue Route:

- `GET /api/shot-alarm/dashboard-audit`

Status erweitert um:

- `safety`
- `audit`

Schreibende Aktionen werden auditiert:

- Config speichern
- Texte speichern/löschen
- Test auslösen
- manueller Trigger
- offene Auslosungen auflösen
- Shot getrunken
- Pending flush
- Runtime reset

Kritische Aktionen brauchen `confirmWrite:true`:

- `manual-trigger`
- `resolve-pending`
- `flush-pending`
- `reset-state`

Dashboard sendet die Bestätigung bei kritischen Aktionen.

## Geprüfte Regeln

- Einzel-Sub/Resub/GiftSub: 20 %
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50
- jeder 10. einzelne Sub/Resub/GiftSub: 100 %
- 5er Bombe: 50/50
- je 10 Subs in Bombe: 1 sicherer Shot
- 100er Bombe: 10 Shots
- je 1.000 Bits: 50/50
- je 10.000 Bits: 100 %
- Ko-fi/Tipeee vorbereitet: je 10 € = 50/50, noch nicht produktiv über Payment-Bus angebunden

## Geprüfte Runtime / Tests

- Communication-Bus-Registrierung aktiv.
- 10-Sekunden-Auslosungsphase funktioniert.
- Ergebnis wird danach resolved.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- `shot-done` Route funktioniert.
- `!shotdone` wurde trocken und per Execute getestet.
- Testevent `10.000 Bits` erzeugte 1 sicheren Shot.
- Nach `!shotdone` wurde der Command erfolgreich an `shot_alarm` weitergeleitet.
- STEP 2D Statusroute zeigt `moduleVersion=0.2.2` und Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- `/api/shot-alarm/dashboard-audit` funktioniert.
- Confirm-Schutz greift ohne `confirmWrite` mit `confirm_write_required`.
- Mit `confirmWrite:true` läuft `resolve-pending` sauber durch.
- Audit loggt erlaubte und verweigerte Aktionen.

## Wichtig

Dashboard-Config-Dropdown darf bestehende Event-System-Einstellungen nie löschen oder ersetzen. Event-System und Shot-Alarm speichern getrennt.

Offener kleiner Cleanup-Punkt:

- Audit-Action-Namen vereinheitlichen: aktuell gibt es in den Tests einmal `shot_alarm.resolve_pending` und einmal `shot_alarm.resolve-pending`. Ziel: einheitlich `shot_alarm.resolve_pending`.
