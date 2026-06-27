# Admin-Diagnose liest Tagebuch diagnostics-Block

## Stand

```text
CAN-42.9
```

## Ziel

`Admin > Diagnose > Tagebuch` liest bevorzugt den standardisierten Block:

```text
GET /api/tagebuch/status -> diagnostics
```

## Änderung

Die zentrale Diagnose nutzt Tagebuch `status.diagnostics` bevorzugt für:

```text
Health/Ampel
Version
Schema-Version
Config-Quelle
Textquelle
LastError
Counts
DB
State
Webhook
```

Fallbacks auf `integration-check` bleiben vorerst erhalten, damit die Anzeige robust bleibt.

## Erwartete Tagebuch-Werte

```text
diagnostics.ok = true
diagnostics.health = ok
diagnostics.counts.state = 1
diagnostics.counts.runtimeEvents = 265
diagnostics.counts.userStats = 11
diagnostics.counts.dailyUserStats = 42
diagnostics.counts.settings = 20
diagnostics.counts.textVariants = 17
diagnostics.counts.legacyTexts = 17
diagnostics.database.adapter = sqlite
diagnostics.webhook.hasWebhookUrl = true
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
