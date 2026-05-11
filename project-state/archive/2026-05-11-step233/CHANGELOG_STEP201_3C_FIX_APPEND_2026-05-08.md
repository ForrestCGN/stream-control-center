# CHANGELOG Ergänzung – STEP201.3c Fix

Stand: 2026-05-08

## Backend

- Todo Integration-Check gegen interne Diagnosefehler abgesichert.
- `safeCall()` ergänzt.
- `handleIntegrationCheck()` gibt bei Fehlern JSON statt leerem 500 zurück.
- Testscript für Todo Integration-Check verbessert und ResponseBody-Logging ergänzt.

## No behavior changes

Keine Änderung an:

```text
Todo-Einträgen
Discord-Post
Stats
DB-Schema
JSON
Dashboard
bestehenden Routen
```
