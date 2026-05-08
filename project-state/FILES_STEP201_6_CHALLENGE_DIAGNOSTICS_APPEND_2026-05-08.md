# FILES Ergänzung – STEP201.6 Challenge Diagnostics

Stand: 2026-05-08

## Challenge relevante Dateien

Backend:

- `backend/modules/challenge.js`

Config/Fallback:

- `config/challenge_system.json`
- `config/messages/challenge.json`

Overlays:

- `htdocs/overlays/_overlay-challenge_status.html`
- `htdocs/overlays/_overlay-challenge_neu.html`

Testtool:

- `tools/STEP201_6_CHALLENGE_ENDPOINT_TEST_LOG.ps1`

## Challenge Standard-Endpunkte

```text
GET      /api/challenge/status
GET      /api/challenge/config
GET      /api/challenge/settings
GET      /api/challenge/routes
GET      /api/challenge/integration-check
GET/POST /api/challenge/reload
```

## Weitere bestehende Challenge-Routen

```text
GET/POST /api/challenge
GET/POST /scripts/challenge
GET/POST /api/challenge/start
GET/POST /api/challenge/remove-next
GET/POST /api/challenge/remove
GET/POST /api/challenge/reset
GET/POST /api/challenge/stats
GET      /api/challenge/stats/top
GET      /api/challenge/stats/user
```
