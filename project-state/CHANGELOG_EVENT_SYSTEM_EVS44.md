# CHANGELOG – Event-System EVS44

## EVS43 – RuntimeGate Stream-State Fix

- RuntimeGate von raw Twitch/API-Quelle auf zentralen `twitch_events` Stream-State umgestellt.
- Manual Override Online wird akzeptiert.
- Chat-Antworten werden wieder verarbeitet.
- Sound-Schnipsel `Full House` wurde korrekt gelöst und mit 10 Punkten gespeichert.

## EVS44 – Stream Offline Auto-Wait + Button Guard

- Offline-State führt nicht mehr zu klebendem manuellem Pausemodus.
- Event bleibt active und geht in `stream_offline_waiting`.
- Laufende Runde wird bei Offline weiter sicher requeued.
- Bei Online-Rückkehr soll automatisch normale Wartezeit geplant werden.
- Dashboard-Button `Wartezeit überspringen` wird nur noch bei sinnvollem Zustand angezeigt.

## Overlay EVS42.x

- Mehrere Winner-Overlay-Varianten ausprobiert.
- EVS42.5/42.6 nicht final zufriedenstellend.
- Entscheidung: nächster Chat soll Winner-Overlay sauber/fresh weiterbauen.
