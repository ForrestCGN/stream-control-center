# CURRENT_STATUS

Stand: RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED  
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
RDAP87: Sicheres AGENT_ACCESS_KEY Env-Setup dokumentiert; Doku-only.
RDAP87B: AGENT_ACCESS_KEY gesetzt und falscher-Bearer-Reject live bestaetigt; Doku-only.
RDAP88: Correct-Bearer-Reject-Only-Test live bestaetigt; Doku-only.
```

## RDAP88 Stand

```text
- AGENT_ACCESS_KEY ist auf dem Webserver gesetzt.
- Der echte Key wurde nicht im Chat/Doku/Git/Status/UI/Logs ausgegeben.
- Der Correct-Bearer-Test wurde nur lokal auf dem Webserver ausgefuehrt.
- Bearer-Token wurde nicht ausgegeben.
- Bearer-Token-Laenge wurde nicht ausgegeben.
- Bearer-Token-Hash wurde nicht ausgegeben.
- Correct Bearer liefert HTTP 503 / reason=runtime_not_effectively_enabled.
- statusApiVersion: rdap_agent86.v1.
- runtime.accessKeyConfigured: true.
- runtime.acceptsAgentConnections: false.
- runtime.effectiveEnabled: false.
- lastRejectReason: runtime_not_effectively_enabled.
- lastRejectAccessKeyConfigured: true.
- lastRejectConnectionProofCompared: true.
- secretsExposed: false.
- bearerTokenLogged: false.
- tokenLengthLogged: false.
- tokenHashLogged: false.
- Verbindung bleibt disabled/reject-only.
- acceptsAgentConnections: false.
- actionEnabled: false.
- productiveAgentRuntime: false.
```

## Stream-PC-Verbindungsstatus

```text
GET /api/remote/agent/status existiert.
Die Route ist read-only.
Die Route schreibt nichts.
Die Route fuehrt keine Aktionen aus.
/agent-ws ist guarded.
Handshake-Precheck ist vorbereitet.
Access-Key-Compare ist vorbereitet und mit gesetztem Key getestet.
Falscher Bearer liefert invalid_connection_proof.
Korrekter Bearer liefert runtime_not_effectively_enabled.
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
RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```
