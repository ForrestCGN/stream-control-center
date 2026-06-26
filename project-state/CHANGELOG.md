# CHANGELOG

## 2026-06-26 - RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON

```text
- Runtime-disabled Skeleton fuer Stream-PC Verbindung vorbereitet.
- server.js auf RDAP82 Build gesetzt.
- Disabled Upgrade-Guard fuer /agent-ws registriert.
- Neue Datei agent-runtime-disabled.service.js erstellt.
- Agent Runtime Config in config.service.js vorbereitet.
- AGENT_RUNTIME_ENABLED wird gelesen, bleibt aber effective false.
- AGENT_ACCESS_KEY wird nur als configured Boolean behandelt.
- agent-status.service.js auf rdap_agent82.v1 erweitert.
- /api/remote/status zeigt RDAP82 Agent-Summary.
- /api/remote/routes zeigt RDAP82 Agent-Foundation.
- Keine package.json/ws Dependency-Aenderung.
- Keine akzeptierte Agent-Verbindung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
```

## 2026-06-26 - RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN

```text
- Stream-PC-Verbindungs-Handshake geplant.
- Interne Agent-ID bestaetigt: stream-pc-main.
- Agent-Name bestaetigt: Forrest Stream-PC.
- Zugangsschluessel-Konzept dokumentiert.
- WSS-Pfad /agent-ws als geplanter Pfad bestaetigt.
- Heartbeat-Modell uebernommen: 30s Intervall, 90s stale, 120s offline.
- Erste Runtime-Stufe als In-Memory only geplant.
- Keine DB-Persistenz ohne separaten Plan.
- Keine produktiven Actions.
- Keine Backend-Aenderung.
- Keine package.json-Aenderung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
- Doku-only.
```

## 2026-06-26 - RDAP80C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP80 serverseitig live bestaetigt dokumentiert.
- RDAP80B serverseitig live bestaetigt dokumentiert.
- Sichtbare Sprachregel festgelegt: Admin -> Verbindungen / Stream-PC Verbindung.
- Technischer Agent-Begriff bleibt intern fuer Route/Service/Code erlaubt.
- Neuer Chat-Prompt nach RDAP80C erstellt.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS

```text
- Sichtbare UI-Einordnung korrigiert.
- Vorher: Agent -> Agent-Status.
- Nachher: Admin -> Verbindungen / Stream-PC Verbindung.
- Backend-Route /api/remote/agent/status bleibt unveraendert.
- Kein eigenes Hauptmodul Agent mehr in der Navigation.
- Keine Backend-Aenderung.
- Keine neue Route.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Remote-/Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## 2026-06-26 - RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION

```text
- Read-only Agent-Statusroute /api/remote/agent/status erstellt.
- Agent-Status-Service mit Summary, Heartbeat-Modell, Transportplan und Safety-Block erstellt.
- /api/remote/status um strukturierten Agent-Summary erweitert.
- /api/remote/routes um Agent-Statusroute und Agent-Status-Foundation erweitert.
- Remote-Modboard UI um Agent -> Agent-Status erweitert.
- Agent-Page registriert sich an vorhandener Frontend-Registry.
- Kein neuer Router, keine parallele Navigation.
- Kein produktiver Agent-Runtime.
- Kein WSS-Server.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission-Migration.
```

## 2026-06-26 - RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT

```text
- Admin-Notes-/Registry-Block dokumentarisch abgeschlossen.
- RDAP77B/RDAP78C als aktueller getesteter Stand festgehalten.
- Admin-Notes fuer jetzt eingefroren.
- Naechsten Hauptfokus Webserver <-> Stream-PC Verbindung festgelegt.
- Neuen Chat-Prompt fuer RDAP80 erstellt.
- RDAP80 als Agent Connection Architecture and Status Foundation geplant.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Kein Webserver-Deploy.
```
