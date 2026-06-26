# CURRENT_STATUS

Stand: RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP77B: Module Registry / Admin-Unterseiten sichtbar exklusiv getestet.
RDAP78C: Admin-Notes Zieluser-/Notice-/Count-Kontext getestet.
RDAP79: Doku-Abschluss und naechster Fokus Webserver <-> Stream-PC vorbereitet.
RDAP80: Agent-Status/Heartbeat-Foundation read-only vorbereitet und serverseitig live bestaetigt.
RDAP80B: Sichtbare UI-Einordnung von Agent -> Agent-Status zu Admin -> Verbindungen korrigiert und serverseitig live bestaetigt.
RDAP80C: Live-Abschluss dokumentiert und naechsten Step auf Stream-PC Verbindung statt sichtbares Agent-Modul ausgerichtet.
RDAP81: Stream-PC-Verbindungs-Handshake, Agent-ID, Zugangsschluessel-Konzept, WSS-Pfad und Heartbeat-Modell geplant; Doku-only.
RDAP82: Runtime-disabled Skeleton fuer Stream-PC Verbindung vorbereitet; /agent-ws Upgrade-Guard lehnt disabled ab; keine Actions.
RDAP82B: RDAP82 live serverseitig bestaetigt und naechsten Step RDAP83 vorbereitet.
RDAP83: In-Memory Reject-Diagnose fuer abgelehnte /agent-ws Versuche vorbereitet; keine akzeptierte Verbindung.
RDAP83B: RDAP83 live serverseitig bestaetigt; /agent-ws Reject-Test erfolgreich; keine Actions/DB/Secrets.
RDAP84: Access-Key-Handshake-Plan dokumentiert; Doku-only, keine Runtime-Aktivierung.
```

## RDAP83 live bestaetigt

```text
/api/remote/agent/status:
- statusApiVersion: rdap_agent83.v1
- runtime.acceptsAgentConnections: false
- rejectDiagnostic.prepared: true
- rejectDiagnostic.inMemoryOnly: true
- rejectDiagnostic.rejectCount steigt nach /agent-ws Test von 0 auf 1
- rejectDiagnostic.lastRejectReason: agent_runtime_disabled
- rejectDiagnostic.secretsExposed: false
- rejectDiagnostic.headersLogged: false
- rejectDiagnostic.rawIpLogged: false

/agent-ws Reject-Test:
- HTTP/1.1 503 Service Unavailable
- reason=agent_runtime_disabled
```

## RDAP84 Planstand

```text
Geplanter spaeterer Handshake-Header-Vertrag:
- Authorization: Bearer <secret>
- X-SCC-Agent-Id: stream-pc-main
- X-SCC-Agent-Version: <version>
- X-SCC-Agent-Protocol: rdap-agent-handshake.v1

Zwei-Stufen-Freigabe:
- AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Spaeterer Runtime-Code-Step muss effective Runtime separat freigeben.
- Keine akzeptierte Verbindung ohne separaten Plan und explizites go.

Geplante sichere Ablehnungsgruende:
- runtime_not_effectively_enabled
- missing_agent_id
- unknown_agent_id
- missing_connection_proof
- invalid_connection_proof
- protocol_version_unsupported
- agent_already_connected
```

## Stream-PC-Verbindungsstatus

```text
GET /api/remote/agent/status existiert.
Die Route ist read-only.
Die Route schreibt nichts.
Die Route fuehrt keine Aktionen aus.
/api/remote/status enthaelt Agent-/Stream-PC-Summary.
/api/remote/routes listet die Agent-Statusroute.
Remote-Modboard UI zeigt Admin -> Verbindungen.
Seite heisst Stream-PC Verbindung.
Status ist read-only und aktuell disabled/offline.
Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
WSS-Pfad /agent-ws ist vorbereitet und guarded.
Abgelehnte /agent-ws Versuche werden in-memory gezaehlt.
Stream-PC soll spaeter aktiv zum Webserver verbinden.
Keine Portfreigabe am Stream-PC.
Keine Remote-/Agent-Actions aktiv.
```

## Sicherheit

```text
Keine akzeptierte Agent-Verbindung.
Kein echter WebSocket-Handshake.
Kein Heartbeat-Receiver.
Kein Agent online.
Keine Action-Queue.
Keine DB-Persistenz.
Keine Secret-Ausgabe.
Keine Header-Wert-Ausgabe.
Keine Cookie-Wert-Ausgabe.
Keine Authorization-Wert-Ausgabe.
Keine Query-Wert-Ausgabe.
Keine rohe IP-Ausgabe.
```

## Admin-Notes Status

```text
Admin-Notizen sind fuer jetzt eingefroren.
User-Detail und Admin-Notizen sind getrennte Admin-Pages.
Header, Navigation und sichtbares Panel sind synchron.
ForrestCGN zeigt eigene Notizen.
EngelCGN zeigt keine falschen Forrest-Notizen mehr.
Falscher stale Count wurde in remote-modboard.js korrigiert.
```

## Sprachregel

```text
Sichtbar / Doku / Nutzerfokus:
- Stream-PC Verbindung
- Verbindungen
- Webserver <-> Stream-PC

Intern / Code / Route:
- agent
- agent-status
- /api/remote/agent/status
- stream-pc-agent
- /agent-ws
```

Nicht mehr sichtbar als Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Remote-/Agent-Actions/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
produktive Writes ausserhalb explizit freigegebener Admin-Notes Create/Update-Scope
DB-Migrationen ohne separaten Plan
neue Permissions ohne separaten Plan
Secret-Ausgabe in Status/UI/Logs
```

## Naechster empfohlener Step

```text
RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```
