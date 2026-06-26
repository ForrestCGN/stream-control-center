# CHANGELOG

## 2026-06-26 - RDAP92_FIX1_CONFIG_EXPORT_RESTORE

```text
- Fix fuer RDAP92 Live-Fehler vorbereitet.
- Ursache: isDatabaseConfigured wurde von db-health.service.js importiert, war aber nach RDAP92 nicht mehr aus config.service.js exportiert.
- config.service.js exportiert wieder loadConfig, buildPublicConfigSummary und isDatabaseConfigured.
- Keine Runtime-Aenderung.
- Keine Agent-Actions.
- Kein Heartbeat.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```
