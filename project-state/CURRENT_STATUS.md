# CURRENT_STATUS

Stand: RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN  
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
RDAP89: Runtime-Enable-Plan dokumentiert; Doku-only.
RDAP90: Runtime-Accept disabled Build-Plan dokumentiert; Doku-only.
```

## RDAP90 Stand

```text
- Minimaler Runtime-Accept-Code-Step ist nur geplant.
- Keine Code-Aenderung.
- Keine Runtime wurde aktiviert.
- Keine Stream-PC Verbindung wurde akzeptiert.
- Kein echter WebSocket-Handshake wurde gebaut.
- Kein Heartbeat-Receiver wurde gebaut.
- Kein Agent wurde online gesetzt.
- Keine Agent-Actions wurden aktiviert.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
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

## Runtime-Accept-Grundsatz

```text
AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.

Spaetere Runtime braucht Zwei-Stufen-Freigabe:
1. Betreiber-Wunsch per Env.
2. expliziter Code-/Build-Schalter in separatem Step.

Der erste spaetere Accept-Code-Step darf maximal Transport akzeptieren.
Actions bleiben false.
productiveAgentRuntime bleibt false.
Heartbeat moeglichst separat planen.
Keine zweite parallele /agent-ws Registrierung.
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
RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN
```
