# REMOTE DASHBOARD AGENT RDAP3 MINIMAL AGENT PLAN

Stand: 2026-06-23  
Step: RDAP3.DOC1 / Minimal-Agent-Konzept  
Status: Planung, keine Umsetzung

## 1. Zweck

Diese Datei konkretisiert den kleinsten sinnvollen technischen Plan für den späteren Stream-PC-Agent.

RDAP3 ist bewusst nur ein Planungsstand. Es wird kein Agent-Code erstellt, keine Webserver-Node-App gebaut, kein Reverse Proxy eingerichtet und keine produktive Aktion angebunden.

Ziel ist, vor der ersten Umsetzung eindeutig festzulegen:

```text
Wie verbindet sich der Stream-PC-Agent sicher mit dem Webserver?
Wie authentifiziert er sich?
Wie meldet er Status?
Wie sehen minimale Request-/Result-Strukturen aus?
Wie wird Audit vorbereitet?
Was passiert bei Offline/Reconnect?
Welche Actions sind im Minimal-Agent erlaubt?
```

## 2. Architektur-Ziel

Geplanter Minimalaufbau:

```text
Remote-Modboard / Webserver
        ↓ HTTPS / WSS
öffentliche Zentrale auf mods.forrestcgn.de
        ↓ WSS-Verbindung
Stream-PC-Agent als separater Node-Prozess
        ↓ lokal
bestehendes stream-control-center Backend auf 127.0.0.1:8080
```

Festgelegt:

- Remote-Modboard-Subdomain: `https://mods.forrestcgn.de`
- Webserver: Hetzner mit ISPConfig, nginx und Let's Encrypt
- Webserver-Node-App später intern, bevorzugt `127.0.0.1:3000`
- Öffentlich nur HTTPS/WSS
- Kein öffentlicher Node-Port
- Stream-PC-Agent verbindet sich aktiv zum Webserver
- Keine Portfreigabe am Stream-PC
- Agent ist ein separater Node-Prozess, kein Modul im bestehenden lokalen Backend
- Lokales Backend bleibt produktive Runtime auf `http://127.0.0.1:8080`

## 3. Was RDAP3 darf

RDAP3 plant nur:

```text
separater Node-Agent-Prozess
Agent-Config
WSS-Verbindung
Auth mit agentId + Secret
Heartbeat
Basisstatus
agent.ping
agent.status.request
Request-/Result-Struktur
Audit-Vorbereitung
Reconnect-/Offline-Verhalten
```

## 4. Was RDAP3 nicht darf

Nicht Teil von RDAP3:

```text
keine Sound-Steuerung
keine OBS-Steuerung
keine Overlay-Steuerung
keine Media-Schreiboperation
keine Text-/Config-Änderung
keine Commands/Kanalpunkte
keine DB-Aktionen
keine Datei-/Shell-/Prozessaktionen
kein produktiver Agent-Code
kein produktiver Webserver-Code
kein Dashboard-v2-Code
keine React/Vite-Umsetzung
kein Reverse Proxy
kein systemd-Service
keine Änderung an produktiver SQLite
keine Änderung am lokalen Backend
```

## 5. Agent-Prozess

Der spätere Stream-PC-Agent wird als eigenständiger Node-Prozess geplant.

Nicht als Agent umsetzen:

```text
kein Modul innerhalb backend/modules
kein Browser-Overlay
kein Dashboard-Script
kein Streamer.bot-Script
kein direkter OBS-WebSocket-Ersatz
```

Grund:

- Der Agent muss unabhängig vom lokalen Backend reconnecten können.
- Der Agent soll nur erlaubte Aktionen über eine Allowlist ausführen.
- Der Agent bleibt eine sichere Brücke, nicht die produktive Hauptlogik.
- Das bestehende lokale Backend bleibt Owner für Runtime-Funktionen.

## 6. Geplante Agent-Config

Spätere Zielidee für eine lokale Agent-Config:

```json
{
  "enabled": true,
  "agentId": "stream-pc-main",
  "agentName": "Forrest Stream-PC",
  "serverUrl": "wss://mods.forrestcgn.de/agent/ws",
  "agentSecret": "NICHT_INS_REPO",
  "localBackendUrl": "http://127.0.0.1:8080",
  "heartbeatIntervalMs": 15000,
  "requestTimeoutMs": 10000,
  "reconnect": {
    "enabled": true,
    "initialDelayMs": 2000,
    "maxDelayMs": 30000
  },
  "allowlist": [
    "agent.ping",
    "agent.status.request"
  ]
}
```

Regeln:

- `agentSecret` darf nicht ins Repo.
- Secrets dürfen nicht im Dashboard angezeigt werden.
- Secrets dürfen nicht ins Audit geschrieben werden.
- Eine Beispiel-Datei darf später nur Platzhalter enthalten.
- Produktive Secrets müssen lokal oder serverseitig sicher verwaltet werden.

## 7. Agent-Identität

Geplante Identitätsfelder:

```text
agentId
agentName
agentVersion
agentSecret
capabilities
connectedAt
lastHeartbeatAt
status
```

Beispiel:

```json
{
  "agentId": "stream-pc-main",
  "agentName": "Forrest Stream-PC",
  "agentVersion": "0.1.0",
  "capabilities": [
    "agent.ping",
    "agent.status.request"
  ]
}
```

## 8. WSS-Verbindung

Grundregel:

```text
Stream-PC-Agent → Webserver
```

Nicht:

```text
Webserver → Heim-IP
Mods → Stream-PC
Browser → Stream-PC
```

Verbindungseigenschaften:

- WSS im öffentlichen Betrieb
- aktive Verbindung vom Stream-PC
- automatischer Reconnect
- Heartbeat
- serverseitige Online-/Offline-Erkennung
- Requests nur an online und freigegebene Agents
- keine Aktion gilt ohne Ergebnisantwort als erfolgreich

## 9. Auth / Handshake

Minimaler geplanter Ablauf:

```text
1. Agent baut WSS-Verbindung zu mods.forrestcgn.de auf.
2. Agent sendet hello/auth mit agentId, agentName und agentVersion.
3. Agent authentifiziert sich mit Secret-basiertem Verfahren.
4. Webserver prüft agentId, Aktivstatus, Secret und erlaubte Version.
5. Webserver markiert Agent als online.
6. Agent sendet Heartbeats und Basisstatus.
```

Nicht erlaubt:

- Agent anhand `agentId` allein akzeptieren
- Secret im Frontend ausgeben
- Secret im Dashboard im Klartext anzeigen
- Secret ins Audit schreiben
- unbekannte Agents automatisch produktiv freischalten

## 10. Heartbeat

Geplante Heartbeat-Payload:

```json
{
  "type": "agent.heartbeat",
  "agentId": "stream-pc-main",
  "agentVersion": "0.1.0",
  "sentAt": "2026-06-23T12:00:00.000Z",
  "status": "online"
}
```

Webserver speichert mindestens:

```text
connectedAt
lastHeartbeatAt
status
lastErrorAt
lastRequestAt
lastResultAt
```

Statuswerte:

```text
online
offline
reconnecting
disabled
auth_failed
version_mismatch
```

Timeout-Regel:

```text
Wenn Heartbeat zu lange fehlt, markiert der Webserver den Agent als offline.
```

## 11. Minimal erlaubte Actions

RDAP3 erlaubt nur diese geplanten Actions:

```text
agent.ping
agent.status.request
```

Keine weitere Action wird in RDAP3 freigegeben.

### 11.1 agent.ping

Zweck:

```text
Verbindung testen und Request-/Result-/Audit-Kette prüfen.
```

Request-Beispiel:

```json
{
  "requestId": "uuid",
  "action": "agent.ping",
  "payload": {},
  "targetAgentId": "stream-pc-main",
  "actorUserId": "user-id",
  "actorDisplayName": "ForrestCGN",
  "issuedAt": "2026-06-23T12:00:00.000Z",
  "expiresAt": "2026-06-23T12:00:10.000Z",
  "requiredPermission": "agent.actions.execute"
}
```

Result-Beispiel:

```json
{
  "requestId": "uuid",
  "action": "agent.ping",
  "ok": true,
  "result": {
    "message": "pong",
    "agentId": "stream-pc-main",
    "agentTime": "2026-06-23T12:00:01.000Z"
  },
  "finishedAt": "2026-06-23T12:00:01.000Z"
}
```

### 11.2 agent.status.request

Zweck:

```text
Basisstatus des Agents und des lokalen Backends lesen.
```

Minimaler Result-Beispielstatus:

```json
{
  "agentId": "stream-pc-main",
  "agentName": "Forrest Stream-PC",
  "agentVersion": "0.1.0",
  "status": "online",
  "connectedAt": "2026-06-23T12:00:00.000Z",
  "lastHeartbeatAt": "2026-06-23T12:00:15.000Z",
  "localBackend": {
    "url": "http://127.0.0.1:8080",
    "reachable": true
  },
  "capabilities": [
    "agent.ping",
    "agent.status.request"
  ]
}
```

Wichtig:

- Noch keine OBS-Details.
- Noch keine Sound-System-Details.
- Noch keine Overlay-Details.
- Noch keine Media-Details.
- Nur Basisstatus.

## 12. Request-Struktur

Jeder Remote-Request braucht mindestens:

```text
requestId
action
targetAgentId
actorUserId
actorDisplayName
issuedAt
expiresAt
requiredPermission
payload
```

Regeln auf dem Webserver:

- User muss eingeloggt sein.
- Rolle muss vorhanden sein.
- Permission muss passen.
- Modulfreigabe muss passen, falls relevant.
- Action muss erlaubt sein.
- Agent muss online sein.
- Request darf nicht abgelaufen sein.
- Payload muss grundsätzlich gültig sein.
- Audit-Voreintrag wird geschrieben.

Regeln auf dem Agent:

- Action muss in lokaler Allowlist stehen.
- Payload-Schema muss gültig sein.
- `expiresAt` muss gültig sein.
- `requestId` darf nicht bereits verarbeitet worden sein.
- Keine freien Pfade.
- Keine freien URLs.
- Keine Shell-Kommandos.
- Keine raw config writes.
- Keine DB-Kommandos.

## 13. Result-Struktur

Jede Ergebnisantwort braucht mindestens:

```text
requestId
action
ok
result oder error
startedAt
finishedAt
durationMs
agentId
```

Erfolgsbeispiel:

```json
{
  "requestId": "uuid",
  "action": "agent.ping",
  "ok": true,
  "agentId": "stream-pc-main",
  "startedAt": "2026-06-23T12:00:00.500Z",
  "finishedAt": "2026-06-23T12:00:00.800Z",
  "durationMs": 300,
  "result": {
    "message": "pong"
  }
}
```

Fehlerbeispiel:

```json
{
  "requestId": "uuid",
  "action": "agent.status.request",
  "ok": false,
  "agentId": "stream-pc-main",
  "startedAt": "2026-06-23T12:00:00.500Z",
  "finishedAt": "2026-06-23T12:00:00.800Z",
  "durationMs": 300,
  "error": {
    "code": "local_backend_unreachable",
    "message": "Local backend is not reachable."
  }
}
```

## 14. Audit-Vorbereitung

Minimaler Audit-Datensatz:

```text
auditId
correlationId
requestId
actorUserId
actorDisplayName
action
targetAgentId
status: pending | success | failed | expired | blocked
createdAt
finishedAt
durationMs
errorCode
payloadSummary
```

Nicht ins Audit:

```text
Secrets
Tokens
private Keys
vollständige sensible Payloads
große Rohdaten
```

Audit-Regel:

```text
Jeder Request bekommt vor dem Senden einen Audit-Voreintrag.
Jedes Result schließt diesen Audit-Eintrag sauber ab.
Blockierte und abgelaufene Requests werden ebenfalls auditierbar festgehalten.
```

## 15. Offline-Verhalten

Wenn Agent offline ist, bleibt erlaubt:

```text
Login
Dashboard lesend öffnen
letzten bekannten Agent-Status ansehen
Webserver-eigene Logs/Audit ansehen, falls Rechte passen
Webserver-eigene Admin-Daten ansehen/bearbeiten, falls dafür kein Agent nötig ist
```

Wenn Agent offline ist, wird gesperrt:

```text
produktive Aktionen
produktive Bearbeitung
Text-/Config-/Media-/Command-/Kanalpunkte-Änderungen
Overlay-Layout-Änderungen
Remote-Actions
```

Keine Offline-Queue:

```text
Nichts wird gesammelt und später automatisch ausgeführt.
```

## 16. Reconnect-Verhalten

Nach Reconnect:

```text
Agent authentifiziert sich neu.
Agent sendet vollständigen Basisstatus.
Webserver markiert Agent online.
Offene Dashboards bekommen Statusupdate.
Alte Requests bleiben abgelaufen.
Es wird nichts automatisch nachträglich ausgeführt.
```

## 17. Sicherheitsregeln

Zwingend:

- Keine freien Shell-Befehle.
- Keine freien Dateipfade.
- Keine freie URL-Ausführung.
- Keine direkten DB-Befehle.
- Keine raw config writes.
- Keine produktive Aktion ohne serverseitige Permission.
- Keine produktive Aktion ohne lokale Agent-Allowlist.
- Jede Aktion mit `requestId`.
- Jede Aktion mit `expiresAt`.
- Jede Aktion mit Ergebnisantwort.
- Jede produktive Aktion ins Audit.
- Secrets nie im Klartext anzeigen oder loggen.

## 18. Spätere Minimal-Testidee

Noch nicht in RDAP3 umsetzen. Späterer erster technischer Test könnte sein:

```text
1. Agent verbindet sich mit Webserver.
2. Webserver zeigt Agent online.
3. Dashboard sendet agent.ping.
4. Agent antwortet mit pong.
5. Audit enthält Request und Ergebnis.
6. Agent wird getrennt.
7. Dashboard zeigt offline.
8. Remote-Aktion wird sauber blockiert.
```

## 19. Nächster sinnvoller Schritt nach RDAP3

Nach RDAP3 sinnvoll:

```text
RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell planen
```

RDAP4 soll unter anderem klären:

- Rollen-/Permission-Modell technisch finalisieren
- Modulfreigaben planen
- Edit-Sessions planen
- Lock-Heartbeat/Timeout planen
- `resourceKey`-Schema finalisieren
- `editSessionId`, `lockId`, `clientId`, `requestId`, `auditId`, `correlationId` finalisieren
- Audit-Events für Locks planen
- Konfliktverhalten bei `resourceVersion` planen

## 20. Node-Neustart

Für RDAP3.DOC1 ist kein Node-/Backend-Neustart nötig.

Grund:

- nur Markdown-Dokumentation
- kein Backend-Code
- kein Dashboard-Code
- kein Frontend-Code
- kein Agent-Code
- keine Config
- keine DB
- keine OBS-Änderung
