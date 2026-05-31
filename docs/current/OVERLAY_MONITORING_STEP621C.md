# Overlay Monitoring - STEP621C

STEP621C trennt Overlay-Anmeldung (`bus_hello`) von echten Heartbeats (`bus_heartbeat`).

## Monitoring-Semantik

| Signal | Bedeutung |
|---|---|
| `bus_hello` | Overlay/Client wurde geladen und hat sich registriert |
| `bus_heartbeat` | Overlay/Client sendet aktiv Lebenszeichen |
| `ws_close` | Verbindung wurde geschlossen, häufig durch Ausblenden/Deaktivieren der OBS-Quelle |

## Neue Statuslogik

- `online`: echter Heartbeat ist frisch
- `registered`: Client ist angemeldet/verbunden, aber es gibt noch keinen echten Heartbeat
- `stale`: echter Heartbeat ist zu alt
- `offline`: Verbindung geschlossen oder Heartbeat zu alt
- `dead`: sehr lange kein Kontakt

## Warum wichtig?

Vorher wurde ein `bus_hello` direkt wie ein Heartbeat behandelt. Dadurch sahen Overlays funktionsfähig aus, obwohl sie eventuell nur einmal geladen wurden und keine laufenden Lebenszeichen sendeten.

Nach STEP621C sieht man pro Overlay, ob es wirklich aktiv lebt oder nur angemeldet ist.
