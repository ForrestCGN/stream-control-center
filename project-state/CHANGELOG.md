# CHANGELOG

## 2026-06-27 - RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN

```text
- Stream-PC-Verbindungsdetails als sicherer Read-only-Plan erstellt.
- Bestehende Ziel-UI bestaetigt:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Bestehende Datenquelle bestaetigt:
  GET /api/remote/agent/status
- Bestehender Service bestaetigt:
  remote-modboard/backend/src/services/agent-status.service.js
- Sichere zusaetzliche Felder fuer RDAP108 kategorisiert.
- Diagnosefelder als vorsichtig/einklappbar eingeordnet.
- Nicht anzuzeigende Secret-/Payload-/Systemfelder dokumentiert.
- Ziel-UI fuer RDAP108 geplant:
  Verbindung, Runtime-Gates, Transport, Sicherheit, einklappbare Diagnose.
- CURRENT_STREAM_PC_AGENT_STATE.md aktualisiert.
- ROADMAP und project-state auf RDAP108 als naechsten Step aktualisiert.
- Keine Codeaenderung.
- Keine UI-Aenderung.
- Keine Backend-Route.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine produktiven Writes.
- Kein Webserver-Deploy noetig.
```

## 2026-06-27 - RDAP106_DOCS_CURRENT_STATE_REBUILD

```text
- Zentrale Current-State-Doku neu aufgebaut.
- START_HERE_FOR_NEW_CHAT.md auf RDAP106 aktualisiert.
- PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md von altem RDAP76B-Stand auf aktuellen RDAP106-Stand gehoben.
- REMOTE_MODBOARD_ROADMAP_CURRENT.md von altem RDAP76B-Stand auf aktuellen RDAP106-Stand gehoben.
- Neue aktuelle State-Dateien erstellt:
  docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
  docs/current/CURRENT_DASHBOARD_STATE.md
  docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
  docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
- Neuer Next-Chat-Prompt erstellt:
  docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP106.md
- project-state Dateien auf knappen aktuellen Stand gebracht.
- Historische RDAP/CAN/DASHUI-Dateien nicht geloescht.
- Keine Massenverschiebung historischer Dateien.
- Kein Webserver-Deploy noetig, Doku-only.
- Naechster Step:
  RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN.
```

## 2026-06-27 - RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN

```text
- Doku-Inventur als eigener RDAP-Step eingefuehrt.
- Repo-Snapshot-ZIPs als Zusatzbasis strukturell ausgewertet.
- docs/current und project-state sind fuer schnelle Orientierung zu laut.
- Zielstruktur fuer Doku-Cleanup geplant.
- Keine Feature-Implementierung.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine produktiven Writes.
```
