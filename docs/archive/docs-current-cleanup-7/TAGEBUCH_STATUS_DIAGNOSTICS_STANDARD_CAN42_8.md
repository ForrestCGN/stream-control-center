# Tagebuch Status Diagnostics Standard

## Stand

```text
CAN-42.8
```

## Ziel

`GET /api/tagebuch/status` liefert zusätzlich einen standardisierten `diagnostics`-Block für `Admin > Diagnose`.

## Änderung

In `backend/modules/tagebuch.js` ergänzt:

```text
countTableRowsWhere()
buildStandardDiagnostics()
diagnostics: buildStandardDiagnostics()
```

## Bestehende Felder

Bestehende `/api/tagebuch/status`-Felder bleiben unverändert erhalten.

## Neuer Block

```json
{
  "diagnostics": {
    "ok": true,
    "health": "ok",
    "module": "tagebuch",
    "version": "0.1.0",
    "schemaVersion": 5,
    "schemaReady": true,
    "configSource": "database_with_json_fallback",
    "textSource": "database_variants_with_json_fallback",
    "database": {
      "ok": true,
      "adapter": "sqlite",
      "path": "...",
      "schemaVersion": 5,
      "expectedSchemaVersion": 5,
      "error": ""
    },
    "counts": {
      "state": 1,
      "runtimeEvents": 0,
      "userStats": 0,
      "dailyUserStats": 0,
      "settings": 0,
      "textVariants": 0,
      "legacyTexts": 0
    },
    "state": {},
    "files": {},
    "webhook": {},
    "warnings": [],
    "errors": [],
    "lastError": null
  }
}
```

## Keine produktiven Aktionen

```text
keine neue Route
keine Route entfernt
keine DB-Migration
keine Datenänderung
keine API-POSTs
keine Funktionalität entfernt
```

## Nächster Schritt

```text
CAN-42.9 - Admin-Diagnose liest Tagebuch diagnostics-Block bevorzugt
```
