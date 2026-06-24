# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP UI2 Read-only Komfort live bestätigt

Status: Live getestet und bestätigt

Stand:

```text
RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
```

Live-URL:

```text
https://mods.forrestcgn.de/
```

Sichtbar bestätigt:

- Service online
- Auto-Refresh
- letzte Aktualisierung
- Schnellstatus
- Read-only Hinweis
- Writes disabled
- OAuth disabled
- Agent disabled

Geänderte Dateien aus UI2:

- `remote-modboard/backend/public/index.html`
- `remote-modboard/backend/public/assets/remote-modboard.css`
- `remote-modboard/backend/public/assets/remote-modboard.js`

Inhalt:

- Auto-Refresh alle 30 Sekunden
- letzte Aktualisierung sichtbar
- Countdown bis nächster Auto-Refresh
- Schnellstatus-Leiste
- Endpoint-Statuskarte
- bessere Fehlerbox bei API-Ausfall
- manueller Refresh bleibt erhalten

Keine Änderung:

- kein Login aktiviert
- kein OAuth aktiviert
- keine Cookies gesetzt
- keine Sessions erstellt
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets
