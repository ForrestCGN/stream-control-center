# NEXT STEPS – nach STEP303

## STEP304 – Sound Dashboard Bus-Monitor Auto Refresh Live-Test dokumentieren

Ziel:

- Prüfen, ob der Bus-Monitor automatisch aktualisiert.
- Prüfen, ob der Button `Status neu laden` weiterhin rein lesend bleibt.
- Sicherstellen, dass kein `POST /api/sound/reload` über den Bus-Monitor ausgelöst wird.

## Testvorschlag

1. Dashboard öffnen.
2. `System -> Sound-System -> Bus-Monitor` öffnen.
3. Zeitstempel der letzten Aktualisierung beobachten.
4. `test_ping` auslösen.
5. Prüfen, ob `emitted`/`lastAction` automatisch aktualisiert.

## Wichtig

- Keine Funktionalität entfernen.
- SoundBus bleibt Event-/Status-Schicht.
- Steueraktionen weiter über Backend-APIs.
- Bus-Monitor bleibt lesend.
