# Todo Status Diagnostics Standard

## Stand

```text
CAN-42.6
```

## Ziel

`GET /api/todo/status` liefert zusätzlich einen standardisierten `diagnostics`-Block für `Admin > Diagnose`.

## Änderung

In `backend/modules/todo.js` ergänzt:

```text
buildStandardDiagnostics()
diagnostics: buildStandardDiagnostics()
```

## Bestehende Felder

Bestehende `/api/todo/status`-Felder bleiben unverändert erhalten.

## Neuer Block

```json
{
  "diagnostics": {
    "ok": true,
    "health": "ok",
    "module": "todo",
    "version": "0.1.0",
    "schemaVersion": 1,
    "schemaReady": true,
    "configSource": "database_with_json_fallback",
    "textSource": "database_variants_with_json_fallback",
    "database": {
      "ok": true,
      "adapter": "sqlite",
      "path": "...",
      "schemaVersion": 1,
      "expectedSchemaVersion": 1,
      "error": ""
    },
    "counts": {
      "targets": 4,
      "channelsConfigured": 4,
      "channelsTotal": 4,
      "missingChannels": 0,
      "userStats": 10,
      "dailyStats": 27,
      "settings": 5,
      "textVariants": 13,
      "legacyTexts": 13
    },
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
CAN-42.7 - Admin-Diagnose liest Todo diagnostics-Block bevorzugt aus /api/todo/status
```
