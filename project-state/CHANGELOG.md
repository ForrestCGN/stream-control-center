# CHANGELOG

## 2026-06-27 - RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI

```text
- Bestehende Admin-/Verbindungen-Seite frontend-only erweitert.
- Geaendert:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Neue Read-only-Anzeige:
  Agent-Version/Protokoll,
  Heartbeat-Seq/Alter,
  Stale-/Offline-Schwellen,
  Runtime-Gates,
  erweiterte Transportdetails,
  Heartbeat-Speicherung/DB-Write/Heartbeat-Actions,
  einklappbare technische Diagnose,
  Warnings ohne Rohpayloads.
- Backend-Route nicht geaendert.
- Agent-Status-Service nicht geaendert.
- Keine DB-Migration.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine produktiven Writes.
- Naechster Step:
  RDAP108B_STREAM_PC_CONNECTION_READONLY_UI_LIVE_CONFIRM.
```

## 2026-06-27 - RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN

```text
- Stream-PC-Verbindungsdetails als sicherer Read-only-Plan erstellt.
- Bestehende Ziel-UI bestaetigt:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Bestehende Datenquelle bestaetigt:
  GET /api/remote/agent/status
- Keine Codeaenderung.
- Keine UI-Aenderung.
- Keine Backend-Route.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
```
