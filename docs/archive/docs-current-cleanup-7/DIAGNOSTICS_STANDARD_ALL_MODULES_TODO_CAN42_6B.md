# Diagnose-Standard für alle Module - ToDo

## Stand

```text
CAN-42.6b
```

## Neue verbindliche ToDo-Regel

Alle Module sollen nach und nach geprüft und an den zentralen Diagnose-Standard angeglichen werden.

Ziel:

```text
Jedes Modul liefert einen standardisierten diagnostics-Block.
Admin > Diagnose zeigt diese Werte einheitlich an.
Modul-Seiten bleiben Bedienseiten.
Alte Diagnosekarten/-Extensions in Modul-Seiten werden entfernt/deaktiviert, sobald die zentrale Diagnose die Informationen abbildet.
Keine Funktionalität entfernen.
```

## Standardblock

```json
{
  "diagnostics": {
    "ok": true,
    "health": "ok",
    "module": "module_key",
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
    "counts": {},
    "warnings": [],
    "errors": [],
    "lastError": null
  }
}
```

## Todo Referenz

Todo ist die erste Referenzumsetzung.

`GET /api/todo/status` liefert jetzt erfolgreich:

```text
diagnostics.ok = true
diagnostics.health = ok
diagnostics.schemaVersion = 1
diagnostics.schemaReady = true
diagnostics.configSource = database_with_json_fallback
diagnostics.textSource = database_variants_with_json_fallback
diagnostics.database.adapter = sqlite
diagnostics.counts.targets = 4
diagnostics.counts.channelsConfigured = 4
diagnostics.counts.channelsTotal = 4
diagnostics.counts.missingChannels = 0
diagnostics.counts.userStats = 10
diagnostics.counts.dailyStats = 27
diagnostics.counts.settings = 5
diagnostics.counts.textVariants = 13
diagnostics.counts.legacyTexts = 13
diagnostics.warnings = []
diagnostics.errors = []
diagnostics.lastError = null
```

## Vorgehen pro Modul

1. Statusroute prüfen.
2. Bestehende Statusfelder nicht entfernen.
3. `diagnostics` ergänzen.
4. Admin > Diagnose bevorzugt den `diagnostics`-Block lesen lassen.
5. Alte Modul-Diagnosekarte/-Extension aus der Modul-Seite deaktivieren.
6. Sichttest.
7. Dokumentieren.

## Kandidaten

```text
tagebuch
commands
hug
message_rotator
overlay_monitor
bus_diagnostics
vip
alerts
sound_system
media
```

## Sicherheitsregeln

```text
Keine Funktionalität entfernen.
Keine DB neu bauen oder überschreiben.
Keine produktiven Aktionen auslösen.
Keine Diagnose-POSTs.
Keine bestehenden Routen brechen.
```
