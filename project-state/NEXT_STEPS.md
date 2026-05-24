# NEXT_STEPS

## Nach STEP278H

1. Backend nach Deploy starten und prüfen:
   - `GET /api/communication/status`
   - WebSocket hello senden
   - danach `GET /api/communication/status`
2. Danach STEP278I planen: kleiner HTML-Testclient für Bus-Registration.
3. Danach erst Master-Overlay-Testclient anbinden.
4. Erst später Alert-/Sound-Migration planen.
5. Keine produktive Modul-Integration aktivieren, bevor WS-Registration sauber geprüft ist.

## Nach STEP278G

1. Backend nach Deploy starten und prüfen:
   - `GET /api/communication/status`
   - `GET /api/communication/test?message=Hallo`
   - `GET /api/communication/status`
   - optional `GET /api/communication/ack?eventId=...&clientId=test_client&status=received`
   - `GET /api/communication/issue?key=test&message=Demo`
2. Danach STEP278H planen: Bus WebSocket Client Registration/Hello API oder Dashboard-Vorbereitung.
3. Erst später Alert-/Sound-Migration planen.
4. Keine produktive Modul-Integration aktivieren, bevor Bus-Status/API geprüft ist.

## Nach STEP278F

1. Backend nach Deploy starten und prüfen, dass bestehende Module unverändert laden.
2. Optionalen Bus-Smoke-Test später über eigenes Testmodul/API planen.
3. Danach STEP278G planen: Communication Bus Status/API oder Dashboard-Vorbereitung.
4. Erst später Alert-/Sound-Migration planen.
5. Audit für Bus bleibt deaktiviert, bis bewusst aktiviert/getestet.

## Nach STEP278E

1. Backend nach Deploy starten und prüfen:
   - `GET /api/audit/status`
   - `GET /api/audit/test?message=Hallo`
   - `GET /api/audit/recent?limit=10`
2. Danach STEP278F planen: Communication Bus nutzt Security Context + Audit optional.
3. Danach Dashboard-Systemlog planen.
4. DB-Migration für dauerhafte Logs erst separat planen.
5. Keine produktive Modul-Integration aktivieren, bevor Status/API geprüft ist.

## Nach STEP278D

1. Backend nach Deploy starten und prüfen, dass bestehende Module unverändert laden.
2. Danach STEP278E planen: Audit API Status/Recent ohne produktive Pflichtintegration.
3. Danach STEP278F planen: Communication Bus nutzt Security Context + Audit optional.
4. Erst später Dashboard-Systemlog und DB-Migration planen.
5. Keine produktive DB-Schreibpflicht aktivieren, bevor Schema und Dashboard sauber geplant sind.

## Nach STEP278C

1. Backend nach Deploy starten und prüfen, dass bestehende Module unverändert laden.
2. Danach STEP278D planen: Audit Log Helper mit Retention und secretsicherer Maskierung.
3. Erst danach Bus-/API-/Dashboard-Integration planen.
4. Keine produktive Zugriffssperre aktivieren, bevor Dashboard-/API-Rollen final geplant sind.

## Nach STEP278B

1. Backend nach Deploy starten und prüfen, dass bestehende Module unverändert laden.
2. Danach STEP278C planen: `helper_security_context.js`.
3. Danach STEP278D planen: `helper_audit.js` mit dashboardfähigen Logs und Retention.
4. Erst danach SoundSystem-/Alert-Migration planen.

## Nach STEP277A_FIX10

1. `/api/clip-shoutout/clips?target=urlug` prüfen.
2. Clip-Anzahl, Dauer und Repeat-Guard-Preview bewerten.
3. Danach `!vso @urlug` im Chat testen.
