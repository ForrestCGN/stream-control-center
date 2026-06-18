# CURRENT CHAT HANDOFF – EVS52.16 Dashboard-Auswertungsbutton

Stand: 2026-06-18

## Ergebnis

EVS52.16 baut den Dashboard-Auswertungsbutton so um, dass `Auswertung starten` im Bereich `Event verwalten` nur sichtbar ist, wenn die Auswertung wirklich moeglich ist.

## Geaendert

- Backend `stream_events.js` auf `0.5.87 / STEP_EVS52_16_DASHBOARD_FINALE_BUTTON`.
- Dashboard `stream_events.js` auf `0.5.53 / STEP_EVS52_16_DASHBOARD_FINALE_BUTTON`.
- `GET /api/stream-events/events/:eventUid/finale` liefert `finaleEligibility`.
- Dashboard laedt die Finale-Preview fuer das ausgewaehlte Event.
- Button `Auswertung starten` ist nur sichtbar, wenn:
  - Event beendet ist,
  - Ranking vorhanden ist,
  - noch kein Winner-Finale existiert.

## Nicht geaendert

- Chatquelle
- Soundlogik
- Satzlogik
- Punktevergabe
- Bot-/Self-Filter
- Datenbankstruktur

## Tests nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.87
moduleBuild   : STEP_EVS52_16_DASHBOARD_FINALE_BUTTON
```

Dashboard:

1. Laufendes Event: kein `Auswertung starten` Button.
2. Beendetes Event ohne Ranking: kein Button.
3. Beendetes Event mit Ranking: Button sichtbar.
4. Klick startet Finale.
5. Nach gestarteter Auswertung: Button nicht mehr sichtbar.

## Naechster sinnvoller Schritt

- `!event status` pruefen/fixen.
- Danach Bot-/Ignore-Liste ins Dashboard verschieben.
