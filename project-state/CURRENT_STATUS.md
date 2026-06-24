# CURRENT STATUS - stream-control-center

Stand: RDAP_UI2_READONLY_COMFORT
Datum: 2026-06-24

## Aktueller Arbeitsstand

RDAP UI1 ist live abgeschlossen und der Remote-Modboard-Deploy ist per Script live getestet.

Aktuell vorbereitet:

```text
RDAP_UI2_READONLY_COMFORT
```

## Inhalt von UI2

UI2 erweitert ausschließlich die vorhandene read-only Remote-Modboard-Seite.

Geändert werden nur statische Frontend-Dateien:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Neue UI2-Funktionen

- Auto-Refresh alle 30 Sekunden
- Anzeige der letzten Aktualisierung
- Countdown bis zum nächsten Auto-Refresh
- Schnellstatus-Leiste für Service, Writes, OAuth und Agent
- Endpoint-Statuskarte mit HTTP-Status je Diagnose-Endpunkt
- bessere Fehler-/Hinweisbox bei API-Ausfällen
- manueller Refresh bleibt erhalten
- alle Fetches bleiben `GET`
- `credentials: omit` bleibt erhalten

## Bestätigte Live-Basis

```text
Remote-Modboard public read-only:
https://mods.forrestcgn.de/

Remote-Modboard API:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Server-Deploy-Wahrheit

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Produktiver Remote-Modboard-Code:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

## Weiterhin verboten

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat
