# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.17

## Direkt testen

1. OBS-Quelle normal laden:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Erwartung: unsichtbar.

2. Preview bewusst testen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?preview=1
```

Erwartung: Demo-Finale sichtbar.

3. Event beenden und Dashboard-Auswertungsbutton testen.

4. Echte Auswertung starten und prüfen, ob das Overlay sichtbar wird.

## Danach

- `!event status` reparieren.
- Bot-/Ignore-Liste dashboardfähig machen.
- Finale-/Winner-Overlay visuell feinjustieren.
