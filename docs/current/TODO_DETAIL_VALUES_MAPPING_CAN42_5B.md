# Todo Detailwerte Mapping

## Stand

```text
CAN-42.5b
```

## Ziel

`Admin > Diagnose > Todo` soll die Detailwerte aus dem alten Todo-Diagnose-Tab korrekt anzeigen.

## Korrigierte Werte

```text
User-Stats
Daily-Stats
Settings
Textvarianten
Legacy-Texte
DB
```

## Technische Ursache

Die zentrale Diagnose musste die Antwort von `GET /api/todo/integration-check` robuster auswerten. Der Backend-Check liefert die Werte unter anderem in:

```text
checks.tables.userStats.count
checks.tables.dailyStats.count
checks.settings.count
checks.texts.count
checks.texts.legacyCount
checks.database.adapter
```

Zusätzlich werden nun verschachtelte Antworten robuster erkannt:

```text
data
result
status.checks
```

## Genutzte Endpunkte

```text
GET /api/todo/status
GET /api/todo/integration-check
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
