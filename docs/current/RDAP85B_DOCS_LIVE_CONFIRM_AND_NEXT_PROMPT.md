# RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Live-Bestaetigung / naechster Chat-Prompt

## Zweck

RDAP85B dokumentiert den live bestaetigten Abschluss von:

```text
RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```

RDAP85 hat den bestehenden disabled `/agent-ws` Upgrade-Guard um einen sicheren Handshake-Precheck erweitert. Der Webserver bestaetigt, dass der Precheck live ist, weiterhin keine Agent-Verbindung annimmt und keine Remote-Actions ausfuehrt.

## Live bestaetigt

Auf dem Webserver getestet aus:

```text
/opt/stream-control-center/_deploy_tmp/RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```

### Test 1: Agent-/Stream-PC Status mit Handshake-Precheck

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime, .rejectDiagnostic'
```

Bestaetigtes Ergebnis:

```text
statusApiVersion: rdap_agent85.v1

runtime.skeletonPrepared: true
runtime.requestedEnabled: false
runtime.effectiveEnabled: false
runtime.wssRuntimeEnabled: false
runtime.heartbeatReceiverEnabled: false
runtime.accessKeyConfigured: false
runtime.accessKeyExposed: false
runtime.accessKeyLogged: false
runtime.defaultDisabled: true
runtime.upgradeGuardPrepared: true
runtime.handshakePrecheckPrepared: true
runtime.handshakePrecheckAcceptsConnections: false
runtime.acceptsAgentConnections: false

rejectDiagnostic.prepared: true
rejectDiagnostic.enabled: true
rejectDiagnostic.inMemoryOnly: true
rejectDiagnostic.persistsToDatabase: false
rejectDiagnostic.handshakePrecheckPrepared: true
rejectDiagnostic.handshakePrecheckAcceptsConnections: false
rejectDiagnostic.expectedProtocolVersion: rdap-agent-handshake.v1
rejectDiagnostic.rejectCount: 0
rejectDiagnostic.lastRejectAt: null
rejectDiagnostic.lastRejectReason: null
rejectDiagnostic.lastRejectPath: null
rejectDiagnostic.lastRejectStatusCode: null
rejectDiagnostic.lastRejectMethod: null
rejectDiagnostic.lastRejectHasAuthorizationHeader: false
rejectDiagnostic.lastRejectHasCookieHeader: false
rejectDiagnostic.lastRejectHasQueryString: false
rejectDiagnostic.lastRejectHasAgentIdHeader: false
rejectDiagnostic.lastRejectHasProtocolHeader: false
rejectDiagnostic.lastRejectAgentIdHint: null
rejectDiagnostic.lastRejectProtocolHint: null
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.secretsLogged: false
rejectDiagnostic.headersLogged: false
rejectDiagnostic.rawIpLogged: false
rejectDiagnostic.queryStringLogged: false
rejectDiagnostic.authorizationHeaderLogged: false
rejectDiagnostic.cookieHeaderLogged: false
rejectDiagnostic.agentIdHeaderValueLogged: false
rejectDiagnostic.protocolHeaderValueLogged: false
rejectDiagnostic.acceptsAgentConnections: false
rejectDiagnostic.actionEnabled: false
rejectDiagnostic.productiveAgentRuntime: false
```

### Test 2: Remote-Status Summary

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
```

Bestaetigtes Ergebnis:

```text
enabled: false
connected: false
connectionState: offline
actionsEnabled: false
productiveAgentRuntime: false
runtimeSkeletonPrepared: true
runtimeRequestedEnabled: false
runtimeEffectiveEnabled: false
heartbeatReceiverEnabled: false
accessKeyConfigured: false
accessKeyExposed: false
plannedTransport: wss
plannedDirection: stream-pc-agent-to-webserver
plannedWsPath: /agent-ws
streamPcPublicPortRequired: false
expectedAgentId: stream-pc-main
expectedAgentName: Forrest Stream-PC
expectedProtocolVersion: rdap-agent-handshake.v1
lastHeartbeatAt: null
heartbeatAgeMs: null
stale: false
handshakePrecheckPrepared: true
handshakePrecheckAcceptsConnections: false
rejectDiagnosticPrepared: true
rejectDiagnosticInMemoryOnly: true
rejectCount: 0
lastRejectAt: null
lastRejectReason: null
lastRejectHasAgentIdHeader: false
lastRejectHasProtocolHeader: false
lastRejectAgentIdHint: null
lastRejectProtocolHint: null
rejectSecretsExposed: false
statusApiVersion: rdap_agent85.v1
```

### Test 3: Routes / Agent Foundation

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
```

Bestaetigtes Ergebnis:

```text
prepared: true
route: /api/remote/agent/status
method: GET
statusApiVersion: rdap_agent85.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
runtimeSkeletonPrepared: true
runtimeRequestedEnabled: false
runtimeEffectiveEnabled: false
heartbeatFoundationPrepared: true
heartbeatReceiverEnabled: false
wssRuntimeEnabled: false
upgradeGuardPrepared: true
handshakePrecheckPrepared: true
handshakePrecheckAcceptsConnections: false
acceptsAgentConnections: false
accessKeyConfigured: false
accessKeyExposed: false
plannedTransport: wss
plannedDirection: stream-pc-agent-to-webserver
plannedWsPath: /agent-ws
expectedAgentId: stream-pc-main
expectedProtocolVersion: rdap-agent-handshake.v1
streamPcPublicPortRequired: false
rejectDiagnosticPrepared: true
rejectDiagnosticInMemoryOnly: true
rejectCount: 0
lastRejectAt: null
lastRejectReason: null
lastRejectHasAgentIdHeader: false
lastRejectHasProtocolHeader: false
lastRejectAgentIdHint: null
lastRejectProtocolHint: null
rejectSecretsExposed: false
noAgentActions: true
safety.noObsControl: true
safety.noSoundControl: true
safety.noOverlayControl: true
safety.noCommandsOrChannelpoints: true
safety.noShellOrProcessActions: true
safety.noFileWrite: true
safety.noProcessControl: true
safety.noFreeUrlExecution: true
safety.noDatabaseWrite: true
safety.noProductiveWrites: true
safety.noAgentActionExecution: true
```

### Test 4: Reject-Test ohne Agent-ID/Auth

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Bestaetigtes Ergebnis:

```text
HTTP/1.1 503 Service Unavailable
reason=missing_agent_id
```

### Test 5: Reject-Test mit falscher Agent-ID

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: wrong-agent\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Bestaetigtes Ergebnis:

```text
HTTP/1.1 503 Service Unavailable
reason=unknown_agent_id
```

### Test 6: Reject-Test mit richtiger Agent-ID und Protokoll, aber ohne Auth

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: stream-pc-main\r\nX-SCC-Agent-Protocol: rdap-agent-handshake.v1\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Bestaetigtes Ergebnis:

```text
HTTP/1.1 503 Service Unavailable
reason=missing_connection_proof
```

### Test 7: Reject-Diagnose nach drei Reject-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.rejectDiagnostic'
```

Bestaetigtes Ergebnis:

```text
rejectDiagnostic.rejectCount: 3
rejectDiagnostic.lastRejectReason: missing_connection_proof
rejectDiagnostic.lastRejectPath: /agent-ws
rejectDiagnostic.lastRejectStatusCode: 503
rejectDiagnostic.lastRejectMethod: GET
rejectDiagnostic.lastRejectHasAuthorizationHeader: false
rejectDiagnostic.lastRejectHasCookieHeader: false
rejectDiagnostic.lastRejectHasQueryString: false
rejectDiagnostic.lastRejectHasAgentIdHeader: true
rejectDiagnostic.lastRejectHasProtocolHeader: true
rejectDiagnostic.lastRejectAgentIdHint: stream-pc-main
rejectDiagnostic.lastRejectProtocolHint: rdap-agent-handshake.v1
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.secretsLogged: false
rejectDiagnostic.headersLogged: false
rejectDiagnostic.rawIpLogged: false
rejectDiagnostic.queryStringLogged: false
rejectDiagnostic.authorizationHeaderLogged: false
rejectDiagnostic.cookieHeaderLogged: false
rejectDiagnostic.agentIdHeaderValueLogged: false
rejectDiagnostic.protocolHeaderValueLogged: false
rejectDiagnostic.acceptsAgentConnections: false
rejectDiagnostic.actionEnabled: false
rejectDiagnostic.productiveAgentRuntime: false
```

## Aktueller sicherer Stand

```text
- RDAP85 ist live.
- /agent-ws Handshake-Precheck ist aktiv vorbereitet.
- Diagnose ist in-memory only.
- Reject-Zaehler funktioniert.
- Fehlende Agent-ID wird als missing_agent_id erkannt.
- Falsche Agent-ID wird als unknown_agent_id erkannt.
- Fehlender Authorization-Header wird als missing_connection_proof erkannt.
- Letzte sichere Ablehnung wird ohne Secret-/Header-/Cookie-/Query-/IP-Werte angezeigt.
- /agent-ws wird weiterhin mit 503 abgelehnt.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- Keine Agent-Verbindung wird angenommen.
- Kein echter WebSocket-Handshake wird akzeptiert.
- Keine Agent-Actions aktiv.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Commands/Channelpoints.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Access-Key sichtbar.
```

## Sichtbarer UI-Stand

Zu pruefen bzw. Zielzustand:

```text
https://mods.forrestcgn.de/
Admin -> Verbindungen
Seite: Stream-PC Verbindung
Status: offline / disabled
Handshake-Precheck-/Reject-Diagnose nur als sichere technische Statusinformation
Keine Action-Buttons
Kein eigenes Hauptmodul Agent
```

## Sprachregel bleibt

Sichtbar / Doku / Nutzerfokus:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern / Code / Route erlaubt:

```text
agent
agent-status
/api/remote/agent/status
stream-pc-agent
/agent-ws
```

Nicht sichtbar als Hauptmodul:

```text
Agent -> Agent-Status
```

## Naechster sinnvoller Step

```text
RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
```

Ziel:

```text
- Access-Key-Vergleich gegen AGENT_ACCESS_KEY vorbereiten.
- Weiterhin keine Runtime-Aktivierung.
- Weiterhin keine akzeptierte Verbindung.
- invalid_connection_proof sicher diagnostizieren.
- Authorization-Wert und AGENT_ACCESS_KEY niemals ausgeben/loggen.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
```

## Doku-only

RDAP85B aendert keinen Code und braucht keinen Webserver-Deploy.
