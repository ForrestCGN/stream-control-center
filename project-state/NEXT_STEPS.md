# NEXT_STEPS

Stand: 2026-06-19

## Aktueller Abschluss: SHOT-ALARM-2D Dashboard Audit Safety

STEP 2D ist technisch bestätigt.

Stand:

- Shot-Alarm Version `0.2.2`.
- Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- Audit-Route aktiv: `GET /api/shot-alarm/dashboard-audit`.
- Safety-Block im Status aktiv.
- Confirm-Schutz für kritische Aktionen aktiv.
- Audit loggt erlaubte und verweigerte Aktionen.

Bestätigte Tests:

- `/api/shot-alarm/status` zeigt Version `0.2.2` und Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- `/api/shot-alarm/dashboard-audit?limit=10` liefert Einträge.
- `POST /api/shot-alarm/resolve-pending` ohne `confirmWrite` wird mit `confirm_write_required` blockiert.
- `POST /api/shot-alarm/resolve-pending` mit `confirmWrite:true` wird erlaubt und auditiert.

## Nächster empfohlener technischer Schritt: SHOT-ALARM-2E Ko-fi/Tipeee Payment-Bus

Ziel:

- Vorhandene Ko-fi-/Tipeee-Module prüfen.
- Ko-fi/Tipeee-Testevents nicht nur als Alert, sondern zusätzlich als Payment-Bus-Event bereitstellen.
- Shot-Alarm soll echte Payment-Events über den vorhandenen Communication Bus empfangen können.

Vor Umsetzung prüfen:

- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`
- `backend/modules/communication_bus.js`
- vorhandene Alert-Provider-Logik
- vorhandene Event-/Payload-Strukturen
- vorhandene Test-Routen/Webhook-Routen

Wichtig:

- Ko-fi/Tipeee sind aktuell Alert-Provider, nicht Payment-Bus-Provider.
- Nicht direkt Speziallogik in `shot_alarm.js` einbauen, wenn Ko-fi/Tipeee sauber als Publisher auf den Bus senden können.
- Bus-Events sollten zu den vorhandenen Shot-Alarm-Subscriptions passen:
  - `payment.kofi:received`
  - `payment.tipeee:received`

## Kleiner Cleanup-Punkt vor oder während 2E

Audit-Action-Namen vereinheitlichen:

- Ist gemischt gesehen:
  - `shot_alarm.resolve_pending`
  - `shot_alarm.resolve-pending`
- Ziel:
  - `shot_alarm.resolve_pending`

Das ist funktional nicht kritisch, aber für spätere Dashboard-Filter sauberer.

## Weitere nächste Schritte

1. Shot-Alarm-Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
2. Statistik-/History-Ansicht im Dashboard erweitern.
3. Persistente Counter nach Neustart planen/umsetzen.
4. Overlay in OBS testen und optisch feinjustieren.
5. Shot-Alarm Config im Dashboard weiter vollständiger machen, ohne Event-System-Config zu beeinflussen.
6. Echten Twitch-Chat-Test mit `!shotdone` / `!shotgetrunken` durchführen.
7. Rechte in der Praxis prüfen: Engel/Roxxy, Broadcaster, Mod, nicht erlaubter User.
