# CURRENT STATUS - stream-control-center

Stand: RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
Datum: 2026-06-24

## Aktueller bestätigter Arbeitsstand

```text
RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
```

RDAP UI2 ist live unter `https://mods.forrestcgn.de/` sichtbar bestätigt.

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

## UI2 live sichtbar bestätigt

Im Browser/Screenshot bestätigt:

```text
Service online
Auto-Refresh sichtbar
letzte Aktualisierung sichtbar
Schnellstatus sichtbar
Read-only Hinweis sichtbar
Writes disabled
OAuth disabled
Agent disabled
```

## UI2 Inhalt

Geändert wurden nur statische Remote-Modboard-Frontenddateien:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

Neue UI2-Funktionen:

- Auto-Refresh alle 30 Sekunden
- Anzeige der letzten Aktualisierung
- Countdown bis zum nächsten Auto-Refresh
- Schnellstatus-Leiste für Service, Writes, OAuth und Agent
- Endpoint-Statuskarte
- bessere Fehler-/Hinweisbox bei API-Ausfällen
- manueller Refresh bleibt erhalten
- alle Fetches bleiben `GET`
- `credentials: omit` bleibt erhalten

## Server-Deploy bestätigt

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

Deploy-Wahrheit:

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Produktiver Remote-Modboard-Code:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
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

## Nächster sinnvoller Fokus

```text
RDAP_UI3_READONLY_DETAILS_OR_FILTERS
```

Alternativ separat planen:

```text
RDAP_AUTH_LOGIN_OAUTH_PLAN
```

Aber Login/OAuth nicht nebenbei aktivieren.
