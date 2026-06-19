# TEST REPORT – EVS52.26 Winner Finale Nullsafe Preview

Stand: 2026-06-19

## Getesteter Stand

```text
backend/modules/stream_events.js
moduleVersion: 0.5.92
moduleBuild: STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

## Test 1 – Statusroute

Befehl:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Ergebnis:

```text
moduleVersion : 0.5.92
moduleBuild   : STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Status: bestanden.

## Test 2 – Finale-Preview ohne vorhandenes Finale

Befehl:

```powershell
$eventUid = "evs_event_mqkyu4hp_27b0cb030fad"
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale" | ConvertTo-Json -Depth 8
```

Ergebnis:

```text
ok: true
event.name: Test
event.status: finished
winnerFinale: null
finaleStarted: false
ranking.count: 2
canStartFinale: true
dashboardCanStartFinale: true
```

Status: bestanden.

## Ranking im Test

```text
1. ForrestCGN – 40 Punkte
2. EngelCGN  – 20 Punkte
```

## Ergebnis

Der vorherige Crash ist behoben:

```text
Cannot read properties of null (reading 'startedAt')
```

Die API liefert jetzt eine gültige Preview für ein frisch beendetes Event ohne vorhandenes Finale.

## Noch nicht getestet

- Finale-Start per Dashboard/API
- Winner-Overlay-Anzeige
- Finale-Ende
- Replay derselben Auswertung
- Reveal-Video/Sound-Queue-Safety
- Random-Rotation/minRepeatDistance

## Hinweis

`finaleActivity.active:true` bei `finaleStarted:false` ist fachlich unsauber, aber aktuell nicht blockierend.
