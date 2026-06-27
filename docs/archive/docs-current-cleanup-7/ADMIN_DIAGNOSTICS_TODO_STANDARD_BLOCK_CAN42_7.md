# Admin-Diagnose liest Todo diagnostics-Block

## Stand

```text
CAN-42.7
```

## Ziel

`Admin > Diagnose > Todo` liest bevorzugt den standardisierten Block:

```text
GET /api/todo/status -> diagnostics
```

## Änderung

Die zentrale Diagnose nutzt Todo `status.diagnostics` bevorzugt für:

```text
Health/Ampel
Version
Schema-Version
Config-Quelle
Textquelle
LastError
Counts
DB
```

Fallbacks auf `integration-check` bleiben vorerst erhalten, damit die Anzeige robust bleibt.

## Erwartete Todo-Werte

```text
diagnostics.ok = true
diagnostics.health = ok
diagnostics.counts.userStats = 10
diagnostics.counts.dailyStats = 27
diagnostics.counts.settings = 5
diagnostics.counts.textVariants = 13
diagnostics.counts.legacyTexts = 13
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
