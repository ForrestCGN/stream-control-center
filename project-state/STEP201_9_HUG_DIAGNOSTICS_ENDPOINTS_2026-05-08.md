# STEP201.9 – Hug/Rehug Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Das bestehende Hug/Rehug-Fachmodul wird auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix bleibt:

```text
/api/hug
```

Folgende Prefixe werden bewusst nicht als Alias ergänzt:

```text
/api/rehug
/api/hug-system
/api/hugs
```

## Betroffene Datei

```text
backend/modules/hug.js
```

## Ergänzte Endpunkte

```text
GET  /api/hug/config
GET  /api/hug/settings
GET  /api/hug/routes
GET  /api/hug/integration-check
POST /api/hug/reload
```

`GET /api/hug/status` bestand bereits und bleibt unverändert die bestehende Dashboard-Statusroute.

## Wichtige Reload-Entscheidung

`GET /api/hug/reload` bleibt als bestehender Command-/Legacy-Reload erhalten und kann weiterhin die bestehende Ausgabe-Logik nutzen.

Der neue STEP201-Standardreload ist bewusst:

```text
POST /api/hug/reload
```

und lädt nur Cache/Runtime neu. Er triggert keine Chat-Ausgabe.

## Nicht geändert

```text
Hug-/Rehug-Command-Logik
Textpaar-Kopplung
Dashboard-Editor
DB-Tabellen
Stats
Toplisten
bestehender GET /api/hug/reload
Chat-Ausgabe
```

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_9_HUG_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/hug = 6/6 grün
/api/rehug = expected_404
/api/hug-system = expected_404
/api/hugs = expected_404
```
