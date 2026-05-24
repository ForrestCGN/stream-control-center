# NEXT STEPS – nach STEP302

## STEP303 – Sound Dashboard Readonly Refresh Test dokumentieren

Ziel:

- Dashboard öffnen.
- Sound-System -> Bus-Monitor öffnen.
- Button **Status neu laden** drücken.
- Prüfen, dass der Status aktualisiert wird.
- Prüfen, dass keine steuernde Sound-Reload-Aktion ausgelöst wird.

## Danach möglich

- SoundBus Event-Korrelation im Dashboard planen.
- SoundBus Debug View optional verbessern.
- Doppelte `sound.finished`-Darstellung später gezielt glätten, falls sie im Monitoring stört.

## Wichtig

- Keine Funktionalität entfernen.
- SoundBus bleibt Event-/Status-Schicht.
- Steueraktionen weiter über Backend-APIs.
- Monitoring bleibt lesend, solange keine Admin-Aktion explizit geplant ist.
