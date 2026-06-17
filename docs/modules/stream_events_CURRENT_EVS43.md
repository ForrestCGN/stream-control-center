# Modul-Doku – stream_events aktueller Stand EVS43

Stand: 2026-06-17
Modul: `backend/modules/stream_events.js`

## Versionen / Builds

Aktuell bestätigter Backendstand nach EVS43:

```text
stream_events v0.5.60
Build: STEP_EVENT_RUNTIME_GATE_TWITCH_EVENTS_STREAM_STATE_1
```

Dashboard-Stände aus vorherigen Steps:

```text
stream_events Dashboard v0.5.40 / EVS39.1 Auto-Reload
Winner Overlay EVS42/EVS42.1 separat in htdocs/overlays/stream_events/event_winner_overlay.html
```

## EventSound Runtime

Bestätigte Funktionen:

- Sound-Schnipsel starten über Sound-System.
- PreRoll/Countdown läuft über Runtime Overlay / Sound-System-Gate.
- Antwortfenster startet nach Sound-Ende.
- Antwortzeit wird aus Event-Einstellungen genutzt.
- Richtige Antwort speichert Score-Eintrag in `stream_events_score_entries`.
- Gelöste Runde bekommt `status/result=solved`.
- Unresolved-Runden bleiben je nach Policy in Rotation.
- Eventpunkte sind eventgebunden.

## Recovery

- Node-/Rechner-Neustart während Sound/Antwortfenster:
  - aktive Runde wird `interrupted` / `interrupted_requeued`
  - keine Punkte
  - Schnipsel zurück in Rotation
  - Event bleibt aktiv
  - Wartezeit wird neu geplant

## Stream-Offline-Pause

- Event kann bei Stream-Offline pausiert werden.
- Laufende Runde wird nach Variante B zurück in Rotation gelegt.
- Fortsetzen ist manuell.
- Dashboard-Buttons für Pause/Fortsetzen sind TODO.

## RuntimeGate nach EVS43

RuntimeGate muss zentrale Stream-Wahrheit nutzen:

- Quelle: `twitch_events` Stream-State
- Manual Override zählt als online
- raw `twitch_api`/`stream_status` nur Fallback

Bestätigter Status nach EVS43:

```text
runtimeGate.active = True
chatEvaluationActive = True
source = manual_override
effectiveSource = twitch_events_stream_state
manualOverrideActive = True
```

## Winner/Finale

EVS41:

- Event kann manuell auf `finished` gesetzt werden.
- Finale darf nur bei `finished` starten.
- Top 3 / Ranking / Gleichstand werden vorbereitet.
- Gleichstand auf Platz 1 kann ausgelost werden.

EVS42/EVS42.1:

- Winner-Overlay existiert.
- Demo-Modi:
  - `?demo=single`
  - `?demo=tie`
  - `&speed=fast|normal|slow`
- Extended Show zeigt Top10→Top4, dann Top3 und Gewinner-Finale.

## Offene technische TODOs

- Echte Winner-Finale-Auslösung mit Live-Daten testen.
- `!event` Command-Anbindung ans bestehende Commands-/ChatOutput-System umsetzen.
- Dashboard-Buttons für Finished/Finale/Pause/Fortsetzen final prüfen.
- Winner-Overlay Timing/Design nach Sichttest weiter feinjustieren.
- Stream-Offline-Pause während aktiver Runde am Freitag live testen.
