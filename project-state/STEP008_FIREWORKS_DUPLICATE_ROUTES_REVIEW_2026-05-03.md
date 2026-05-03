# STEP008 - Fireworks-Doppelroute geprüft

Stand: 2026-05-03

## Ziel

Prüfung der in der Backend-Analyse markierten Fireworks-Doppelroute.

## Befund

Die Fireworks-Routen sind aktuell doppelt registriert:

In backend/server.js:

- GET /api/fireworks
- GET /api/fireworks/stop
- GET /api/fireworks/clear

In backend/modules/fireworks_api.js:

- GET /api/fireworks
- GET /api/fireworks/stop
- GET /api/fireworks/clear

Da server.js vor dem Modul-Loader registriert wird, wird sehr wahrscheinlich der server.js-Handler zuerst ausgeführt. Das Modul fireworks_api.js ist dadurch für diese Routen praktisch überdeckt oder zumindest nicht eindeutig allein zuständig.

## Entscheidung

Keine Codeänderung in STEP008.

Grund:
Das Fireworks-System soll später ohnehin neu aufgebaut werden. Deshalb wird die Doppelroute jetzt nur dokumentiert und nicht kurzfristig umgebaut.

## Wichtig

- Keine Funktionalität entfernt.
- Keine Route geändert.
- Kein Deploy nötig.
- Fireworks bleibt für den aktuellen Stand unverändert.

## Offener Punkt für später

Beim späteren Fireworks-Neuaufbau:

1. Fireworks-Logik vollständig in ein eigenes Modul verschieben.
2. server.js von Fireworks-Spezialrouten befreien.
3. Einheitliche Route unter /api/fireworks/* definieren.
4. WebSocket-Broadcast einheitlich über ctx.broadcastWS oder zentralen Helper nutzen.
5. Dashboard/Overlay/Streamer.bot-Aufrufe danach gezielt testen.
