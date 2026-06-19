# NEXT_STEPS

Stand: 2026-06-19

## Aktueller Abschluss: SHOT-ALARM-2C `!shotdone`

`!shotdone` ist im bestehenden Command-System angebunden.

Stand:

- Command-System Version `0.2.4`.
- Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- Trigger `!shotdone`.
- Alias `!shotgetrunken`.
- Ziel `POST /api/shot-alarm/shot-done`.
- Engel/Roxxy/Broadcaster/Mods sind erlaubt.
- Dry-Run und Execute waren erfolgreich.

## Nächster Pflicht-Test

Nach einem Test-Shot oder echten Shot:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status" |
  Select-Object shotsOpen,shotsDrunk,shotsAddedTotal,lastError
```

Erwartung nach `!shotdone` bei vorher 1 offenem Shot:

```text
shotsOpen = 0
shotsDrunk = 1
shotsAddedTotal = 1
lastError = leer
```

Danach im echten Twitch-Chat testen:

- `!shotdone` als Engel/Roxxy.
- `!shotgetrunken` als Alias.
- Mod-Test.
- Nicht erlaubter User soll abgewiesen werden.

## Nächster empfohlener technischer Schritt: SHOT-ALARM-2D Rechte/Audit/Dashboard-Aktionen prüfen

Ziel:

- Dashboard-Aktionen des Shot-Alarms prüfen.
- Rechte-/Audit-Konzept für produktive Aktionen klären.
- Besonders gefährliche Aktionen wie Reset/Manual Trigger sauber absichern.

Vor Umsetzung prüfen:

- vorhandene Dashboard-Auth-/Audit-Helper
- `backend/modules/audit_log.js`
- `backend/modules/helpers/helper_dashboard_auth.js`
- `backend/modules/helpers/helper_dashboard_audit.js`
- bestehende Patterns aus anderen Modulen
- vorhandene Shot-Alarm-Routen mit produktiver Wirkung

Keine neue parallele Rechte-/Audit-Struktur bauen.

## Weitere nächste Schritte

1. Ko-fi/Tipeee Payment-Bus-Events ergänzen und Shot-Alarm anbinden.
2. Shot-Alarm-Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
3. Statistik-/History-Ansicht im Dashboard erweitern.
4. Persistente Counter nach Neustart planen/umsetzen.
5. Overlay in OBS testen und optisch feinjustieren.
6. Shot-Alarm Config im Dashboard weiter vollständiger machen, ohne Event-System-Config zu beeinflussen.
