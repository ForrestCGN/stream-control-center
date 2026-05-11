# STEP201.6 Challenge Diagnostics Endpoints

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-/Diagnose-STEP  
Status: vorbereitet

## Zweck

Challenge hatte im STEP201.6-Check nur 2/6 Standard-Endpunkte:

```text
OK:
- GET  /api/challenge/status
- POST /api/challenge/reload

Fehlend:
- GET /api/challenge/config
- GET /api/challenge/settings
- GET /api/challenge/routes
- GET /api/challenge/integration-check
```

Dieser STEP ergänzt nur die fehlenden Diagnose-/Standard-Endpunkte.

## Betroffene Datei

```text
backend/modules/challenge.js
```

Zusätzlich als Testhilfe:

```text
tools/STEP201_6_CHALLENGE_ENDPOINT_TEST_LOG.ps1
```

## Ergänzte Routen

```text
GET /api/challenge/config
GET /api/challenge/settings
GET /api/challenge/routes
GET /api/challenge/integration-check
```

## Unverändert

```text
GET/POST /api/challenge
GET/POST /scripts/challenge
GET/POST /api/challenge/start
GET/POST /api/challenge/status
GET/POST /api/challenge/remove-next
GET/POST /api/challenge/remove
GET/POST /api/challenge/reset
GET/POST /api/challenge/reload
GET/POST /api/challenge/stats
GET      /api/challenge/stats/top
GET      /api/challenge/stats/user
```

## Wichtige Schutzmaßnahmen

- Keine Challenge-Start-/Queue-/Reset-/Timer-Logik geändert.
- Keine Overlay-WebSocket-Payloads geändert.
- Keine Stats-Schreiblogik geändert.
- Keine SQLite-Tabellen neu gebaut oder ersetzt.
- Keine Config-/Message-Dateien geändert.
- `/api/challenge/reload` blieb inhaltlich unverändert.
- `/api/challenge/config` maskiert sensible Keys wie Auth-/Token-/Secret-Werte.

## Integration-Check

`GET /api/challenge/integration-check` prüft nicht-destruktiv:

- `config/challenge_system.json`
- `config/messages/challenge.json`
- Runtime-Config
- Challenge-Modes
- Stats-Status
- Stats-Schema
- Tabellen:
  - `challenge_user_mode_stats`
  - `challenge_runtime_events`
- Routenliste
- Overlay-Datei `htdocs/overlays/_overlay-challenge_status.html`

## Tests

Lokal vor ZIP-Erstellung:

```text
node -c challenge_STEP201_6.js
Syntax OK
```

Nach Entpacken/Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .	ools\STEP201_6_CHALLENGE_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/challenge/status             OK
/api/challenge/config             OK
/api/challenge/settings           OK
/api/challenge/routes             OK
/api/challenge/integration-check  OK
/api/challenge/reload             OK
```

## Bewusst offen

- Kein Dashboard-Modul für Challenges gebaut.
- Keine DB-Portierung auf `backend/core/database.js` in diesem STEP.
- Keine Migration der Challenge-Texte auf globale `module_text_variants`.
- Keine UX-/Overlay-Anpassung.
