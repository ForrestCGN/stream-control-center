# CHANGELOG Ergänzung – STEP201.6 Challenge Diagnostics

Stand: 2026-05-08

## Backend

- Challenge um Standard-/Diagnose-Endpunkte ergänzt:
  - `GET /api/challenge/config`
  - `GET /api/challenge/settings`
  - `GET /api/challenge/routes`
  - `GET /api/challenge/integration-check`
- `/api/challenge/reload` blieb unverändert bestehen.
- Integration-Check prüft Config, Messages, Runtime, Modes, Stats-Schema, Stats-Tabellen, Routen und Overlay-Datei.
- Config-/Settings-Ausgaben maskieren sensible Auth-/Token-/Secret-/Key-Felder.

## Tests

- `node -c` für `backend/modules/challenge.js` erfolgreich.
- Testtool ergänzt: `tools/STEP201_6_CHALLENGE_ENDPOINT_TEST_LOG.ps1`.

## No removals

Keine bestehende Challenge-Funktionalität entfernt.
