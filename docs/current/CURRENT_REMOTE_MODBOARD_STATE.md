# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP  
Datum: 2026-06-27

## Navigation

```text
System:
- Übersicht
- Diagnose

Admin:
- Benutzerverwaltung
- Admin-Notizen
- Verbindungen
- Doku / Details
```

## Streaming-PC-Verbindung

```text
Webserver-Seite:
- remote-modboard/backend/server.js registriert registerAgentRuntime(...).
- /agent-ws ist vorbereitet und akzeptiert gesicherte Verbindungen, wenn Runtime/Env aktiv ist.
- /api/remote/agent/status zeigt Verbindung, Heartbeat und Reject-Diagnose.
- Heartbeat bleibt read-only/in-memory.
- Keine Aktionen werden ausgefuehrt.

Lokale Streaming-PC-Seite:
- backend/modules/remote_agent.js ist ab RDAP119 der Streaming-PC-Verbindungsclient-MVP.
- Verbindung laeuft ausgehend zum Webserver.
- Verbindungsschluessel wird nur intern genutzt und nicht ausgegeben.
- Status lokal ueber /api/streaming-pc-connection/status.
```

## Admin-Modul-Vertrag

```text
Admin-Fachmodule:
- registrieren ihre Page
- bauen/polieren ihren eigenen Inhalt
- laden eigene Daten, falls noetig

Admin-Fachmodule duerfen NICHT:
- eigene Admin-Navi-Buttons erzwingen
- Admin-Reihenfolge selbst steuern
- fremde Admin-Navi-Eintraege entfernen

Admin-Navigation:
- zentrale Sortierung/Deduplizierung in users.js
```

## Sicherheit

```text
Keine DB-Migration.
Keine produktiven Writes.
Keine OBS-/Sound-/Overlay-/Command-Aktionen.
Keine Shell-/Datei-/Prozesssteuerung.
Keine freien URLs oder freien Befehle.
```
