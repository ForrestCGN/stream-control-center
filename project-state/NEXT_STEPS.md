# NEXT_STEPS

## Nach STEP278J

1. Backend nach Deploy starten und Server-Log prüfen:
   - `[communication_bus] v0.3.0 / STEP278H ...`
   - `[audit_log] v0.2.0 / STEP278E ...`
2. Danach STEP278K planen: kleiner WebSocket-Testclient oder Master-Overlay-Testclient.
3. Alle zukünftigen Module nach `docs/backend/MODULE_VERSIONING_STANDARD.md` versionieren und mit Version/Build loggen.

## Nach STEP278I

1. Backend nach Deploy starten und prüfen:
   - `GET /api/communication/status`
   - `GET /api/audit/status`
2. Prüfen, ob `moduleVersion` und `moduleBuild` sichtbar sind.
3. Danach STEP278J planen: Versioned Startup Logs.
4. Alle zukünftigen Module nach `docs/backend/MODULE_VERSIONING_STANDARD.md` versionieren.
