# CURRENT CHAT HANDOFF – EVS50.5 Points-Check Active-Event-Fix

Stand: 2026-06-18

## Problem

Der Backend-Punktecheck war ab EVS50.4 korrekt: Sound-Punkte und Satz-/Text-Punkte wurden gemeinsam gezählt.
Im Dashboard zeigte "Aktuelles Event" trotzdem teilweise einen alten aktiven Dashboard-Testlauf, weil mehrere Dashboard-Testevents aktiv bleiben konnten und `getActiveEvent()` dann nicht zuverlässig den zuletzt geprüften Lauf als Dashboard-Ziel zeigte.

## Änderung

- `stream_events` Version auf `0.5.66` erhöht.
- Build: `STEP_EVS50_5_POINTS_CHECK_ACTIVE_EVENT_FIX`.
- Neue interne Schutzfunktion:
  - `isDashboardEventTest(event)`
  - `finishActiveDashboardTestEvents(options)`
- `runEventTestPointsCheck()` beendet vor dem neuen Punktecheck nur alte aktive Dashboard-/Testevents.
- Produktive/nicht als Dashboard-Test erkannte aktive Events werden nicht beendet.
- Response von `points-check` enthält jetzt zusätzlich:
  - `event`
  - `preCleanup`
  - `activeEvent`

## Wichtig

Produktive Events werden nicht automatisch beendet. Es werden nur sichere Dashboard-Testevents erkannt über Metadata/Validation oder Testnamen wie `EVS PUNKTE CHECK` / `EVS DASHBOARD TEST`.

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.ok
$r.event | ConvertTo-Json -Depth 6
$r.preCleanup | ConvertTo-Json -Depth 6
$r.activeEvent | ConvertTo-Json -Depth 6
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints,scoreEntries,soundEntries,phraseSolves | Format-List

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.activeEvent | ConvertTo-Json -Depth 6
```

Erwartung:

- `moduleVersion` = `0.5.66`
- `moduleBuild` = `STEP_EVS50_5_POINTS_CHECK_ACTIVE_EVENT_FIX`
- Punktecheck: `ok = True`
- User: `totalPoints=50`, `soundPoints=20`, `phrasePoints=30`
- `status.activeEvent.eventUid` entspricht dem neuen `$r.eventUid`
- Dashboard → Aktuelles Event zeigt den neuen 50-Punkte-Lauf.
