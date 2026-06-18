# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – nach EVS50.2

## Sofort nach Einspielen testen

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
backend stream_events: 0.5.63 / STEP_EVS50_2_POINTS_CHECK_TESTS
Dashboard stream_events: 0.5.47 / STEP_EVS50_2_POINTS_CHECK_TESTS
```

## Backend Punkte-Check

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints | Format-List
$r.ranking.rows | Select-Object rank,userLogin,points | Format-Table -AutoSize
$r.parts | ConvertTo-Json -Depth 8
```

## Dashboard-Test

```text
Event-System → Test → Punkte-Check Sound + Satz
Event-System → Aktuelles Event → ForrestCGN in Rangliste anklicken
```

Erwartung:

```text
- Punkte-Prüfung erscheint im Testbereich.
- Sound-Punkte sind sichtbar.
- Satz-/Text-Punkte sind sichtbar.
- Ranking addiert beides.
- User-Popup zeigt den Punkteverlauf mit Zeit, Quelle und Punkten.
```

## Nächster Arbeitsblock

EVS50.3 – Satz-System härten:

- Satz-Testbereich sauberer vom Winner-Test trennen.
- Falsche Antwort, Worttreffer, Satzlösung einzeln testen.
- Doppelte Lösung prüfen.
- Text-Teilspielabschluss gegen Runtime-Parts prüfen.
- Runtime-Overlay Satzstatus verbessern.

## EVS50.3 – Points-Check Insert-Fix

- `createDashboardEventTestEvent()` schreibt jetzt alle NOT-NULL-Pflichtfelder fuer `stream_events_events`.
- Fix fuer `NOT NULL constraint failed: stream_events_events.scoring_config_json` beim `points-check`.
- Keine DB-Daten ersetzt, keine Punkte-/Rankinglogik geaendert.


## EVS50.4 – Test nach Einspielen

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.ok
$r.checks | ConvertTo-Json -Depth 6
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints | Format-List
$r.ranking.rows | Select-Object rank,userLogin,points | Format-Table -AutoSize
```

Erwartung: `soundPoints >= 20`, `phrasePoints >= 30`, `totalPoints >= 50`, `$r.ok = True`.

Naechster Block nach erfolgreichem Test: EVS50.5 Satz-System Einzeltests im Dashboard.

## EVS50.5 nächster Schritt

Nach erfolgreichem Active-Event-Fix:

1. Dashboard → Test → Punkte-Check ausführen.
2. Dashboard → Aktuelles Event prüfen.
3. User in Rangliste anklicken.
4. Wenn 50 Punkte inklusive Sound sichtbar sind: EVS50.6 Satz-Testbereich finalisieren.


## Nach EVS50.6

Nächster sinnvoller Schritt: Satz-System Testbereich finalisieren. Geplant sind Buttons und lesbare Ausgaben für Satz-Testevent, falsche Antwort, richtige Antwort, Text-Report, Runtime-Parts und Abschlussstatus.
