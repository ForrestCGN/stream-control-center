# CHANGELOG

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
