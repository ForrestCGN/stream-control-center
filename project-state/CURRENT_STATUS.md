# CURRENT_STATUS

Stand: 2026-06-19

## Shot-Alarm

Aktueller geprüfter Stand: **SHOT-ALARM-2E Ko-fi/Tipeee Payment-Bus Integration + History-ID-Fix + End-to-End-Test**

Backend Shot-Alarm:

- `backend/modules/shot_alarm.js`
- Modulversion: `0.2.3`
- Build: `STEP_SHOT_ALARM_2E_PAYMENT_HISTORY_ID_FIX`

Command-System:

- `backend/modules/commands.js`
- Modulversion: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Payment-/Alert-Provider:

- `backend/modules/kofi.js`
  - Modulversion: `0.1.1`
  - veröffentlicht `payment.kofi.received` auf den Communication Bus
- `backend/modules/tipeee.js`
  - Modulversion: `0.1.1`
  - veröffentlicht `payment.tipeee.received` auf den Communication Bus

Dashboard-Fix-/Safety-Stand:

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

## STEP 2C – Command `!shotdone`

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

## STEP 2D – Dashboard Audit Safety

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

## STEP 2E – Ko-fi/Tipeee Payment-Bus

Ko-fi und Tipeee veröffentlichen Test-/Webhook-Payments zusätzlich zum Alert-Flow auf den Communication Bus.

Events:

- `payment.kofi.received`
- `payment.tipeee.received`

Shot-Alarm hat diese Events bereits abonniert und verarbeitet sie nach den vorhandenen Payment-Regeln.

Payment-Regeln:

- Ko-fi: je volle 10 € = 50/50
- Tipeee: je volle 10 € = 50/50

Wichtig:

- Ko-fi/Tipeee sprechen Shot-Alarm nicht direkt an.
- Die Anbindung läuft sauber über den vorhandenen Communication Bus.
- Alert-Forwarding bleibt erhalten.

## STEP 2E History-ID-Fix

Beim ersten Payment-Bus-Test wurde gefunden:

- `history_persist_failed: UNIQUE constraint failed: shot_alarm_history.id`

Ursache:

- Draw-Start und Draw-Result konnten dieselbe Draw-ID als History-Primary-Key verwenden.

Fix in `shot_alarm` 0.2.3:

- History-Einträge bekommen eigene eindeutige `historyId` / `storageId`.
- ursprüngliche Draw-ID bleibt als `id/sourceId/drawId` im Payload erhalten.
- Shot-Regeln und Dashboard wurden dabei nicht geändert.

## Geprüfte Regeln

- Einzel-Sub/Resub/GiftSub: 20 %
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50
- jeder 10. einzelne Sub/Resub/GiftSub: 100 %
- 5er Bombe: 50/50
- je 10 Subs in Bombe: 1 sicherer Shot
- 100er Bombe: 10 Shots
- je 1.000 Bits: 50/50
- je 10.000 Bits: 100 %
- Ko-fi/Tipeee: je 10 € = 50/50

## Geprüfte Runtime / Tests

- Communication-Bus-Registrierung aktiv.
- 10-Sekunden-Auslosungsphase funktioniert.
- Ergebnis wird danach resolved.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- `shot-done` Route funktioniert.
- `!shotdone` wurde trocken und per Execute getestet.
- STEP 2D Statusroute zeigt `moduleVersion=0.2.2` und Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- `/api/shot-alarm/dashboard-audit` funktioniert.
- Confirm-Schutz greift ohne `confirmWrite` mit `confirm_write_required`.
- Mit `confirmWrite:true` läuft `resolve-pending` sauber durch.
- Audit loggt erlaubte und verweigerte Aktionen.
- Ko-fi-Testevent: `paymentBus.ok=true`, `subscriberDeliveredCount=1`.
- Tipeee-Testevent: `paymentBus.ok=true`, `subscriberDeliveredCount=1`.
- Shot-Alarm verarbeitet Payment-Bus-Events.
- History-ID-Fix bestätigt: `lastError` leer, `lastWarning` leer.
- End-to-End-Test bestätigt:
  - Payment-Testevent erzeugte offenen Shot
  - `!shotdone` reduzierte `shotsOpen` von 1 auf 0
  - `shotsDrunk` wurde von 0 auf 1 erhöht
  - `shotsAddedTotal` blieb 1

## Wichtig

Dashboard-Config-Dropdown darf bestehende Event-System-Einstellungen nie löschen oder ersetzen. Event-System und Shot-Alarm speichern getrennt.

Offener kleiner Cleanup-Punkt:

- Audit-Action-Namen vereinheitlichen: aktuell gab es im Test einmal `shot_alarm.resolve_pending` und einmal `shot_alarm.resolve-pending`. Ziel: einheitlich `shot_alarm.resolve_pending`.
