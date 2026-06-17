# CHANGELOG – Event-System EVS43

## EVS43 – RuntimeGate Twitch Events Stream-State Fix

- `stream_events` RuntimeGate nutzt jetzt zentrale `twitch_events` Stream-State-Wahrheit.
- Manual Override Online wird korrekt als online akzeptiert.
- Raw `twitch_api`/`stream_status` ist nicht mehr harte Wahrheit für `stream_events`.
- `chatEvaluationActive` wird bei zentralem Online-Status korrekt `true`.
- Problem behoben: Chatantworten wurden ignoriert, obwohl Dashboard `ONLINE (Override)` zeigte.
- Bestätigter Test: Sound-Antwort erkannt, 10 Punkte gespeichert.

## Davor relevante Steps

- EVS36: Wartezeit überspringen.
- EVS36.1: Prepared Round Fix.
- EVS36.2: Antwortzeit aus Event-Einstellungen.
- EVS37: Runtime Recovery Requeue.
- EVS38: Stream Offline Pause.
- EVS39/39.1: Nächster Schnipsel Anzeige + Auto-Reload.
- EVS41: Winner Finale Foundation.
- EVS42/42.1: Winner Overlay + Extended Show.
