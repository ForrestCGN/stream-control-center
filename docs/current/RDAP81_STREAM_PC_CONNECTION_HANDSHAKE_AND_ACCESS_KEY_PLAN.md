# RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Handshake / Zugangsschluessel-Plan

## Zweck

RDAP81 plant die naechste fachliche und technische Stufe fuer:

```text
Webserver <-> Stream-PC Verbindung
```

Der Step baut bewusst noch keinen produktiven Runtime, keinen WSS-Server und keine Remote-Actions. Er legt nur fest, wie sich der Stream-PC spaeter sicher beim Webserver meldet und wie der Status verarbeitet werden soll.

## Ausgangspunkt

```text
- RDAP80 ist live: read-only Agent-/Stream-PC-Verbindungsstatus.
- GET /api/remote/agent/status existiert.
- /api/remote/status enthaelt .agent Summary.
- /api/remote/routes listet /api/remote/agent/status.
- RDAP80B ordnet die UI sichtbar unter Admin -> Verbindungen ein.
- RDAP80C dokumentiert den Live-Abschluss.
- Status ist disabled/offline.
- Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
- WSS-Pfad /agent-ws ist nur geplant.
- Keine Remote-/Agent-Actions aktiv.
```

## Sprachregel

Sichtbar / Doku / Nutzerfokus:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern / Code / Route weiterhin erlaubt:

```text
agent
agent-status
/api/remote/agent/status
stream-pc-agent
```

Nicht mehr als sichtbares Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Agent-ID / Stream-PC-ID

Fuer die erste echte Verbindung wird genau ein Stream-PC geplant:

```text
agentId: stream-pc-main
agentName: Forrest Stream-PC
```

Diese Werte passen zum aktuellen RDAP80-Statusmodell und sollen nicht ohne Grund geaendert werden.

Spaeter moeglich, aber nicht Teil von RDAP81:

```text
stream-pc-main
stream-pc-test
engel-lan-client
```

## Zugangsschluessel-Konzept

Der Stream-PC soll sich spaeter mit einem serverseitig bekannten geheimen Zugangsschluessel ausweisen.

Grundregeln:

```text
- Zugangsschluessel niemals ins Repo.
- Zugangsschluessel niemals ins Frontend.
- Zugangsschluessel niemals in URLs.
- Zugangsschluessel niemals in Statusroutes ausgeben.
- Zugangsschluessel niemals roh loggen.
- Server liest den Wert aus der Webserver-Umgebung.
- Stream-PC liest den Wert aus lokaler Konfiguration ausserhalb oeffentlicher Webpfade.
```

Geplanter Verbindungsnachweis spaeter:

```text
Authorization: Bearer <geheimer-wert>
X-SCC-Agent-Id: stream-pc-main
X-SCC-Agent-Version: <version>
X-SCC-Agent-Protocol: rdap-agent-handshake.v1
```

Wichtig: Dieser Step legt nur das Konzept fest. Er fuegt keinen echten Wert hinzu und aktiviert keine Pruefung.

## WSS-Handshake

Geplanter Pfad:

```text
/agent-ws
```

Geplante Richtung:

```text
Stream-PC -> Webserver
```

Damit gilt weiterhin:

```text
- Keine Portfreigabe am Stream-PC.
- Keine eingehende Internet-Verbindung zum Stream-PC.
- Dynamische Stream-PC-IP bleibt unkritisch.
```

Spaetere serverseitige Pruefungen:

```text
- Ist Agent-Runtime explizit aktiviert?
- Ist die Agent-ID bekannt?
- Stimmt der Verbindungsnachweis?
- Passt die Protokollversion?
- Ist bereits ein Agent mit gleicher ID verbunden?
- Sind Header/Host/Transport plausibel?
```

Geplante Ablehnungsgruende ohne sensible Details:

```text
runtime_disabled
missing_agent_id
unknown_agent_id
invalid_connection_proof
protocol_version_unsupported
agent_already_connected
```

## Heartbeat-Modell

RDAP81 uebernimmt das bereits vorbereitete RDAP80-Modell:

```text
plannedHeartbeatIntervalMs: 30000
staleAfterMs: 90000
offlineAfterMs: 120000
```

Bedeutung:

```text
- Agent meldet sich spaeter alle 30 Sekunden.
- Nach 90 Sekunden ohne Meldung: stale.
- Nach 120 Sekunden ohne Meldung: offline.
```

Geplanter Heartbeat-Inhalt:

```text
agentId
agentName
agentVersion
protocolVersion
localTime
status
capabilitiesSummary
```

Nicht im Heartbeat:

```text
- geheime Werte
- lokale absolute Pfade
- freie Prozesslisten
- freie Dateiinfos
- OBS-/Sound-/Overlay-Details ohne separaten Scope
```

## In-Memory vs. DB-Persistenz

Entscheidung fuer die erste Runtime-Stufe:

```text
In-Memory only.
Keine DB-Migration.
Keine Persistenz in RDAP81.
```

Begruendung:

```text
- Fuer den ersten echten Verbindungsstatus reicht Runtime-Status.
- DB-Persistenz braucht ein separates Schema, Backup, Readback und eigenen Plan.
- Verbindungsverlauf/Audit/Agent-Registry kommen spaeter getrennt.
```

Spaeter moeglich, aber nicht Teil von RDAP81:

```text
dashboard_agent_registry
dashboard_agent_heartbeat_log
dashboard_agent_audit_log
```

## UI-Sichtbarkeit

Die vorhandene Seite bleibt:

```text
Admin -> Verbindungen
Stream-PC Verbindung
```

Sichtbar spaeter erlaubt:

```text
connectionState
lastHeartbeatAt
heartbeatAgeMs
expectedAgentId
expectedAgentName
agentVersion
protocolVersion
transport
stale/offline
```

Nicht sichtbar / nicht loggen:

```text
geheime Verbindungswerte
Authorization Header
lokale absolute Pfade
freie Prozesslisten
private Netzwerkdetails, ausser spaeter explizit noetig
```

## Harte Grenzen

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Dateioperation.
Keine freie Prozessausfuehrung.
Keine freie URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine Admin-Notes-Aenderung.
Keine Agent-Action-Queue.
```

## Naechster sinnvoller Step

```text
RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
```

Moeglicher Scope nur nach neuem Plan und go:

```text
- WSS-/Receiver-Skeleton technisch vorbereiten.
- Runtime weiterhin default disabled.
- Keine Actions.
- Kein OBS/Sound/Overlay/Command.
- Zugangsschluessel nur aus Umgebung lesen.
- Status weiterhin read-only anzeigen.
- Keine DB-Migration.
```
