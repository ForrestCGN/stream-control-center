# STEP201.3e Fix – Message Rotator Array-Routen

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-Fix  
Status: vorbereitet

## Ausgangslage

Repo und Live enthalten die neuen Message-Rotator-Routen, aber die neuen Endpunkte antworten mit 404.

Geprüfte Stellen:

```text
buildMessageRotatorRoutes vorhanden
/api/message-rotator/routes im Repo vorhanden
/api/message-rotator/routes im Live-Ordner vorhanden
```

## Ursache

Die neuen Routen wurden als Array registriert:

```js
routes.registerGet(app, ['/message-rotator/routes', '/api/message-rotator/routes'], routesHandler);
```

Der vorhandene `routes.registerGet`-Helper unterstützt in diesem Modul offenbar keine Array-Pfade sauber. Dadurch landet die Route nicht als echte Express-Route.

## Änderung

Array-Registrierungen wurden in einzelne `registerGet`-Aufrufe aufgeteilt:

```js
routes.registerGet(app, '/message-rotator/routes', routesHandler);
routes.registerGet(app, '/api/message-rotator/routes', routesHandler);
```

Betroffene Endpunkte:

```text
/message-rotator/config
/api/message-rotator/config
/message-rotator/settings
/api/message-rotator/settings
/message-rotator/routes
/api/message-rotator/routes
/message-rotator/integration-check
/api/message-rotator/integration-check
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Rotator-Auswahl-Logik
keine Chat-Tick-Logik
keine Send-/Manual-/Next-Logik
keine Live-Status-Logik
keine Start-/Stop-Logik
keine bestehende Route entfernt
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\message_rotator.js
.\stepdone.cmd "message-rotator: fix array route registration"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3e_fix_test_message_rotator_routes_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
