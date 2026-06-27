# CHANGELOG

## 2026-06-27 - RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP

```text
- Lokales Modul backend/modules/remote_agent.js von reinem Read-only-Modell zum Streaming-PC-Verbindungsclient erweitert.
- Outbound WebSocket-Verbindung zum Webserver vorbereitet/implementiert.
- Default-Ziel: wss://mods.forrestcgn.de/agent-ws.
- Handshake-Header: X-SCC-Agent-Id, X-SCC-Agent-Protocol, X-SCC-Agent-Version und Bearer-Verbindungsschlüssel.
- Heartbeat-Payload: type=heartbeat, protocolVersion=rdap-agent-heartbeat.v1, agentId, seq, agentVersion.
- Neuer lesbarer Status-Alias: /api/streaming-pc-connection/status.
- Bestehende /api/remote-agent/status Route bleibt erhalten.
- Keine Aktionen, keine Writes, keine DB-Migration, keine Shell-/Datei-/Prozesssteuerung.
- Admin-Notizen nicht weiter ausgebaut.
```

## 2026-06-27 - RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW

```text
- Admin-/System-Navigation sichtbar poliert.
- users.js normalisiert Admin-Labels/Aliase zentral.
- users.js stellt zentral sicher, dass Benutzerverwaltung, Admin-Notizen, Verbindungen und Doku / Details im Admin-Menue vorhanden sind.
- System-Menue wird auf Übersicht und Diagnose bereinigt.
- notes.js und connections.js bleiben Fachmodule ohne eigene Admin-Navi-Button-Erzeugung.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```
