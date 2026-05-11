# CURRENT_STATUS Ergänzung – STEP201.6 Challenge Diagnostics

Stand: 2026-05-08

## STEP201.6 – Challenge Diagnose-Endpunkte

Challenge wurde um fehlende Diagnose-/Standard-Endpunkte ergänzt.

Backend:

- `backend/modules/challenge.js`

Neue Routen:

```text
GET /api/challenge/config
GET /api/challenge/settings
GET /api/challenge/routes
GET /api/challenge/integration-check
```

Bereits vorhandene Route bleibt unverändert:

```text
GET/POST /api/challenge/reload
```

Nicht geändert:

- Start-/Queue-/Reset-/Timer-Logik
- Overlay-WebSocket-Payloads
- Stats-Schreiblogik
- SQLite-Schema außer bestehender idempotenter Stats-Schema-Prüfung
- Config-/Message-Dateien

Testtool:

```text
tools/STEP201_6_CHALLENGE_ENDPOINT_TEST_LOG.ps1
```
