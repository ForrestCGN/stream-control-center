# CURRENT CHAT HANDOFF – EVS52.26 Winner Finale Nullsafe Preview

Stand: 2026-06-19

## Kontext

Im Event-System war ein fertiges Testevent vorhanden:

```text
evs_event_mqkyu4hp_27b0cb030fad  Test  finished
```

Dashboard zeigte Ranking, aber kein Button für:

```text
Auswertung starten
Finale starten
Auswertung erneut abspielen
```

API-Calls auf Finale-Preview und Finale-Start crashten mit:

```text
Cannot read properties of null (reading 'startedAt')
```

## Ursache

In `backend/modules/stream_events.js` wurde bei einem frisch beendeten Event ohne vorhandenes Finale intern `existing = null` gesetzt.

Danach wurde `winnerFinaleActivitySummary(existing, metadata)` aufgerufen.

Die Funktion griff auf `finale.startedAt` zu, obwohl `finale` `null` war.

## Fix

STEP:

```text
STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Geändert:

```text
backend/modules/stream_events.js
```

Modulstand:

```text
moduleVersion: 0.5.92
moduleBuild: STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Fixinhalt:

- `winnerFinaleActivitySummary()` ist null-safe.
- `safeFinale` und `safeMetadata` werden verwendet.
- Keine DB-Änderung.
- Keine Dashboard-Änderung.
- Keine Overlay-Änderung.
- Keine Sound-System-Änderung.

## Bestätigter Test

Statusroute:

```text
moduleVersion : 0.5.92
moduleBuild   : STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Finale-Preview:

```text
ok: true
event.status: finished
winnerFinale: null
finaleStarted: false
ranking.count: 2
canStartFinale: true
dashboardCanStartFinale: true
```

Ranking:

```text
ForrestCGN 40 Punkte
EngelCGN 20 Punkte
```

## Aktuelle Auffälligkeit

Die Preview enthält weiterhin:

```text
finaleActivity.active: true
finaleStarted: false
```

Das ist logisch unsauber, blockiert aber den Start aktuell nicht. Nicht vor dem Stream ohne Not anfassen.

## Nächste Schritte

1. Dashboard neu laden.
2. `Auswertung starten` prüfen.
3. Finale starten.
4. Winner-Overlay prüfen.
5. Finale manuell beenden.
6. Replay prüfen.
7. Danach Reveal-Video/Sound-Queue-Safety prüfen.
8. Danach Soundrotation/Zufall prüfen.
