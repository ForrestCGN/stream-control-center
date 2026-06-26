# CURRENT_STATUS

Stand: RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP83: In-Memory Reject-Diagnose fuer abgelehnte /agent-ws Versuche live bestaetigt.
RDAP83B: RDAP83 Live-Bestaetigung dokumentiert.
RDAP84: Access-Key-Handshake-Plan dokumentiert; Doku-only.
RDAP85: Handshake-Precheck im bestehenden disabled /agent-ws Guard vorbereitet und live bestaetigt.
RDAP85B: RDAP85 Live-Bestaetigung dokumentiert.
RDAP86: Access-Key-Compare im bestehenden disabled /agent-ws Guard vorbereitet und live bestaetigt.
RDAP86B: RDAP86 Live-Bestaetigung dokumentiert.
```

## RDAP86 live bestaetigter Stand

```text
/api/remote/agent/status:
- statusApiVersion: rdap_agent86.v1
- runtime.acceptsAgentConnections: false
- runtime.accessKeyComparePrepared: true
- runtime.accessKeyCompareAcceptsConnections: false
- rejectDiagnostic.accessKeyComparePrepared: true
- rejectDiagnostic.accessKeyCompareAcceptsConnections: false
- rejectDiagnostic.visibleRejectReasons enthaelt access_key_not_configured
- rejectDiagnostic.secretsExposed: false
- rejectDiagnostic.bearerTokenLogged: false
- rejectDiagnostic.tokenLengthLogged: false
- rejectDiagnostic.tokenHashLogged: false

/api/remote/status .agent:
- connectionState: offline
- actionsEnabled: false
- productiveAgentRuntime: false
- runtimeEffectiveEnabled: false
- heartbeatReceiverEnabled: false
- accessKeyComparePrepared: true
- accessKeyCompareAcceptsConnections: false
- rejectSecretsExposed: false

/api/remote/routes .agentStatusFoundation:
- runtimeEffectiveEnabled: false
- heartbeatReceiverEnabled: false
- wssRuntimeEnabled: false
- acceptsAgentConnections: false
- accessKeyComparePrepared: true
- accessKeyCompareAcceptsConnections: false
- noAgentActions: true
```

## RDAP86 Reject-Tests bestaetigt

```text
Falsches Auth-Schema:
- HTTP 503
- reason=invalid_connection_proof

Bearer bei nicht gesetztem AGENT_ACCESS_KEY:
- HTTP 503
- reason=access_key_not_configured

Finale Reject-Diagnose:
- rejectCount: 2
- lastRejectReason: access_key_not_configured
- lastRejectHasAuthorizationHeader: true
- lastRejectHasAgentIdHeader: true
- lastRejectHasProtocolHeader: true
- lastRejectAccessKeyConfigured: false
- lastRejectConnectionProofCompared: false
- acceptsAgentConnections: false
- actionEnabled: false
- productiveAgentRuntime: false
```

## Stream-PC-Verbindungsstatus

```text
GET /api/remote/agent/status existiert.
Die Route ist read-only.
Die Route schreibt nichts.
Die Route fuehrt keine Aktionen aus.
/agent-ws ist guarded.
Handshake-Precheck ist vorbereitet.
Access-Key-Compare ist vorbereitet, aber disabled/reject-only.
Stream-PC soll spaeter aktiv zum Webserver verbinden.
Keine Portfreigabe am Stream-PC.
Keine Remote-/Agent-Actions aktiv.
```

## Sicherheit RDAP86B

```text
Keine akzeptierte Stream-PC Verbindung.
Kein echter WebSocket-Handshake.
Kein Heartbeat-Receiver.
Kein Agent online.
Keine Action-Queue.
Keine DB-Persistenz.
Keine Secret-Ausgabe.
Keine Bearer-Token-Ausgabe.
Keine Bearer-Token-Laengen-Ausgabe.
Keine Bearer-Token-Hash-Ausgabe.
Keine AGENT_ACCESS_KEY-Ausgabe.
Keine Header-Wert-Ausgabe.
Keine Cookie-Wert-Ausgabe.
Keine Authorization-Wert-Ausgabe.
Keine Query-Wert-Ausgabe.
Keine rohe IP-Ausgabe.
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
RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS
```
