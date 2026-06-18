# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – nach EVS50.1

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
backend stream_events: 0.5.62 / STEP_EVS50_1_POINT_HISTORY_DETAIL
Dashboard stream_events: 0.5.46 / STEP_EVS50_1_CURRENT_EVENT_USER_POINTS_MODAL
```

## Dashboard-Test

```text
Event-System → Aktuelles Event → User in Rangliste anklicken
```

Erwartung:

```text
- Detailfenster öffnet sich.
- Gesamtpunkte sichtbar.
- Sound-Punkte sichtbar.
- Satz-/Text-Punkte sichtbar.
- Punkte-Verlauf zeigt Zeitpunkt, Grund/Quelle und Punkte.
```

## Nächster Arbeitsblock

EVS50.2 – Satz-System-Testbereich:

- Satz-Testevent im Dashboard erstellen.
- Falsche Satzantwort simulieren.
- Teiltreffer/Worttreffer simulieren.
- Richtige Satzantwort simulieren.
- Punktevergabe prüfen.
- Ranking prüfen.
- Text-Report prüfen.
- Runtime-Parts prüfen.
- Abschluss Text-Teilspiel prüfen.
- Kombination Sound + Text prüfen: Gesamt-Event erst fertig, wenn beide Teilspiele abgeschlossen sind.
