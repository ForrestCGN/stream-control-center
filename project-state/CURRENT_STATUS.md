# CURRENT_STATUS

Stand: 2026-06-19

## Projektbereich

`stream-control-center` / `Community → Event-System → Stream-Events`

Aktueller geprüfter Notfallstand:

- Backend `stream_events`: **0.5.92**
- Build: **STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW**
- Dashboard `stream_events`: zuletzt sichtbarer Stand **STEP_EVS52_21U_DASHBOARD_INITIAL_LOAD_FIX**
- Ergebnis: Finale-Preview crasht bei frisch beendetem Event ohne vorhandenes Finale nicht mehr.

## Heute bestätigter Fix

Der Fehler bei der Finale-/Auswertungs-Preview wurde behoben:

```text
Cannot read properties of null (reading 'startedAt')
```

Ursache:

- `buildWinnerFinalePreview()` hat bei einem frisch beendeten Event ohne vorhandenes `winnerFinale` intern `null` weitergegeben.
- `winnerFinaleActivitySummary()` griff danach auf `finale.startedAt` zu.
- Dadurch crashten sowohl `GET /api/stream-events/events/:eventUid/finale` als auch `POST /api/stream-events/events/:eventUid/finale/start?confirm=1` vor der eigentlichen Finale-Erstellung.
- Das Dashboard bekam keine Preview und konnte deshalb den Button `Auswertung starten` nicht anzeigen.

Fix:

- `winnerFinaleActivitySummary()` ist jetzt null-safe.
- Es wird ein sicheres `safeFinale` / `safeMetadata` verwendet.
- Keine DB-Änderung.
- Keine Dashboard-Änderung.
- Keine Sound-/Reveal-/Random-Rotation-Änderung.

## Verifizierter Teststand

PowerShell-Test nach Einspielen und StepDone:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Ergebnis:

```text
moduleVersion : 0.5.92
moduleBuild   : STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Finale-Preview-Test:

```powershell
$eventUid = "evs_event_mqkyu4hp_27b0cb030fad"
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale" | ConvertTo-Json -Depth 8
```

Wichtiges Ergebnis:

```text
ok: true
status: finished
winnerFinale: null
finaleStarted: false
ranking.count: 2
canStartFinale: true
dashboardCanStartFinale: true
```

Ranking im Testevent:

```text
1. ForrestCGN – 40 Punkte
2. EngelCGN  – 20 Punkte
```

## Auffälligkeit, aber aktuell nicht blockierend

Die Preview liefert aktuell noch:

```text
finaleStarted: false
finaleActivity.active: true
```

Das ist logisch unsauber, weil noch kein Finale existiert. Es blockiert den Start aktuell nicht, da `dashboardCanStartFinale:true` korrekt gesetzt wird.

Nicht vor dem Stream ohne Not anfassen, solange Finale-Start und Overlay funktionieren.

## Aktuelle Priorität

1. Finale/Auswertung im Dashboard oder per API starten und Overlay prüfen.
2. Danach Reveal-Video/Sound-Queue-Safety prüfen.
3. Danach Soundrotation/Zufall prüfen.

## Relevante Eventliste aus dem Notfallstand

```text
evs_event_mqhxfvw4_cf75ed388602  1 Jahr Twitch                                      ready
evs_event_mqkyu4hp_27b0cb030fad  Test                                               finished
evs_event_mqjhfk4z_9c1726434672  Kopie von Kopie von 1 Jahr Twitch111 Text & SOund  ready
evs_event_mqhyhva5_70359b296692  Kopie von 1 Jahr Twitch                            ready
evs_event_mqgeg3ff_667da5873515  Test (Nur Sound)                                   ready
```

## Nicht geändert in EVS52.26

- keine Datenbank
- kein Dashboard
- keine Overlays
- kein Sound-System
- keine Ranking-Logik
- kein Replay-Flow
- keine Reveal-Video-Queue-Logik
- keine Random-Rotation

## Wichtig für die weitere Arbeit

Nicht zurück auf EVS52.19/EVS52.21 rollen, solange kein zwingender Grund besteht. Der aktuelle Backendstand enthält spätere Sound-Reveal-/Random-Fixes aus EVS52.25 und wurde nur minimal null-safe gemacht.
