# Changelog

## 2026-05-09

### STEP203.4 - Loyalty Auto Shadow Runner

- `backend/modules/loyalty.js` auf Version `0.1.3` erhöht.
- Neue Tabelle:
  - `loyalty_runner_events`
- Neue Settings:
  - `autoRunner.enabledOnBoot`
  - `autoRunner.intervalSeconds`
  - `autoRunner.runOnlyWhenLive`
  - `autoRunner.checkAutoLive`
  - `autoRunner.includeJoinedOnly`
  - `autoRunner.activeMinutes`
  - `autoRunner.maxUsersPerRun`
- Neue Routen:
  - `/api/loyalty/runner/status`
  - `/api/loyalty/runner/start`
  - `/api/loyalty/runner/stop`
  - `/api/loyalty/runner/run-once`
  - `/api/loyalty/runner/events`
- Auto Runner standardmäßig deaktiviert.
- StreamElements bleibt aktiv.
- Shadow Mode bleibt aktiv.
