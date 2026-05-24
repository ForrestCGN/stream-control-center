# NEXT_STEPS

## Nach STEP278I

1. Backend nach Deploy starten und prüfen:
   - `GET /api/communication/status`
   - `GET /api/audit/status`
2. Prüfen, ob `moduleVersion` und `moduleBuild` sichtbar sind.
3. Danach STEP278J planen: kleiner WebSocket-Testclient oder Master-Overlay-Testclient.
4. Alle zukünftigen Module nach `docs/backend/MODULE_VERSIONING_STANDARD.md` versionieren.

## Nach STEP278H

1. Backend nach Deploy starten und prüfen:
   - `GET /api/communication/status`
   - WebSocket hello senden
   - danach `GET /api/communication/status`
2. Danach STEP278I planen: Module Version Metadata.
3. Danach erst Master-Overlay-Testclient anbinden.
4. Erst später Alert-/Sound-Migration planen.
5. Keine produktive Modul-Integration aktivieren, bevor WS-Registration sauber geprüft ist.
