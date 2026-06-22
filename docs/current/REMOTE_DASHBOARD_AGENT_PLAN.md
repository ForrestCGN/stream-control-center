# REMOTE DASHBOARD AGENT PLAN

Stand: 2026-06-22  
Step: RDAP1 / Remote Dashboard Agent Plan + RDAP2-Verweis  
Status: Planung, keine Umsetzung

## 1. Ziel

Der Dashboard-v2-Neubau startet nicht mit Design, Bootstrap oder Optik, sondern mit der sicheren technischen Grundlage für die Verbindung zwischen öffentlichem Webserver und Stream-PC.

Ziel:

```text
Webserver kontrolliert Zugriff, Rechte, API und Audit.
Stream-PC-Agent führt lokal nur erlaubte Aktionen aus.
Keine Portfreigabe am Stream-PC.
Keine freien Befehle.
Keine direkte Mod-Verbindung zum Stream-PC.
```

Dieser Plan beschreibt nur die Zielarchitektur und Regeln. Er implementiert noch keinen Agent-Code.

## 2. Aktueller Entscheidungsstand

RDAP1 hat die Zielrichtung festgelegt.

RDAP2 konkretisiert die offenen Architekturentscheidungen in:

```text
docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md
```

Wichtigster RDAP2-Stand:

```text
Subdomain: modboard.forrestcgn.de
Webserver: Hetzner mit ISPConfig + nginx + Let's Encrypt
Node-App: intern, bevorzugt 127.0.0.1:3000
Agent: separater Node-Prozess auf dem Stream-PC
lokales Backend: 127.0.0.1:8080
NAS/MariaDB: optional lokale Backup-/Media-/Meta-Schicht
Offline-Regel: keine produktive Bearbeitung/Aktion ohne Agent
Locks: zentrales Edit-Session-/Lock-System
```

Diese Datei bleibt der grobe Architekturplan. Die konkreten RDAP2-Entscheidungen stehen in der RDAP2-Datei.

## 3. Architektur

Geplanter Aufbau:

```text
Mods / Sound-Profi / Forrest
        ↓
Remote-Modboard auf dem Webserver
        ↓
Login / Rechteprüfung / API / Audit
        ↓
WSS / WebSocket-Verbindung
        ↓
separater Stream-PC-Agent
        ↓
lokales stream-control-center / OBS / Sound / Media / Overlays
```

Festgelegt:

- Webserver ist die öffentliche Zentrale.
- Stream-PC ist lokaler Ausführer.
- Stream-PC-Agent verbindet sich aktiv zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Dynamische Heim-IP ist egal.
- Mods greifen nicht direkt auf den Stream-PC zu.
- Alle relevanten Aktionen laufen über Rechteprüfung und Audit.
- Produktive Änderungen am Live-System laufen nur bei aktivem Agent.

## 4. Webserver-Aufgaben

Der Webserver übernimmt später:

- Twitch-Login / Authentifizierung
- lokale Dashboard-Benutzer
- lokale Dashboard-Rollen
- einzelne Permissions
- Modulfreigaben
- Remote-Modboard / Dashboard-v2-API
- Agent-Verwaltung
- Agent-Status
- Remote-Action-Requests
- Audit-Log
- Media-Upload-Verwaltung
- Bearbeitungsverwaltung
- zentrales Edit-Session-/Lock-System
- Statusverteilung an alle offenen Dashboards

Wichtig:

```text
Dashboard-Buttons sind keine Sicherheit.
Sicherheit muss serverseitig geprüft werden.
```

Der Webserver fragt den Stream-PC-Agent nicht für grundsätzliche Login- oder Rechteentscheidungen.

## 5. Stream-PC-Agent-Aufgaben

Der Stream-PC-Agent übernimmt später:

- aktive WSS-Verbindung zum Webserver aufbauen
- mit Agent-ID + Secret authentifizieren
- Heartbeat senden
- lokalen Status melden
- erlaubte Befehle empfangen
- Payload gegen lokale Allowlist prüfen
- erlaubte lokale Backend-API aufrufen
- Ergebnis zurückmelden
- Fehler zurückmelden
- lokale Runtime schützen

Der Agent darf nicht:

- freie Shell-Befehle ausführen
- beliebige Dateien schreiben
- beliebige Dateien löschen
- beliebige Pfade akzeptieren
- beliebige Windows-Prozesse starten
- freie URLs laden
- raw config writes ausführen
- DB-Befehle frei entgegennehmen

## 6. WebSocket / WSS-Verbindung

Grundregel:

```text
Stream-PC-Agent → Webserver
```

Nicht:

```text
Webserver → Heim-IP / Portfreigabe
```

Geplante Verbindungseigenschaften:

- WSS statt unverschlüsseltem WS im öffentlichen Betrieb
- aktive Verbindung vom Stream-PC
- Heartbeat
- Reconnect
- Server markiert Agent bei Timeout als offline
- Remote-Aktionen werden nur an online/freigegebene Agents gesendet
- keine Aktion wird ohne Ergebnisantwort als erfolgreich angenommen

Mögliche Agent-Verbindungsdaten:

```text
agentId
agentName
agentSecret
agentVersion
capabilities
connectedAt
lastHeartbeatAt
status
localRuntimeStatus
```

## 7. Agent-Authentifizierung

Minimaler geplanter Start:

```text
agentId + agentSecret + serverseitige Agent-Freigabe
```

Besserer Zielstand später:

```text
kurzlebige Session nach Secret-Handshake
Token-Rotation möglich
Agent kann serverseitig deaktiviert werden
jede Verbindung eindeutig auditierbar
```

Wichtig:

- Secrets nie im Dashboard anzeigen.
- Secrets nicht ins Audit im Klartext schreiben.
- Agent kann serverseitig deaktiviert werden.
- Agent-Aktionen dürfen nur für den jeweils freigegebenen Agent laufen.

## 8. Erlaubte erste Agent-Actions

RDAP3 Minimal-Agent:

```text
agent.ping
agent.status.request
```

Remote-Actions v1 nach stabilem Minimaltest nur lesend/statusbezogen:

```text
agent.ping
agent.status.request
agent.capabilities.request
local.backend.status.request
obs.status.request
sound.status.request
overlay.status.request
```

Noch nicht in v1:

```text
sound.play.live
sound.test.live
sound.pause
sound.resume
sound.stop_current
overlay.show.live
overlay.hide.live
obs.scene.switch
media.delete
media.write
config.write
texts.write
commands.write
channelpoints.write
db.*
shell.*
process.*
file.*
```

Grund:

```text
Erst Verbindung, Auth, Rechteprüfung, Ergebnisantwort und Audit sauber testen.
Dann schrittweise kritischere Aktionen freigeben.
```

## 9. Remote-Command-Struktur

Jeder Remote-Befehl braucht mindestens:

```json
{
  "requestId": "uuid",
  "action": "agent.ping",
  "payload": {},
  "actorUserId": "local-user-id",
  "actorDisplayName": "ForrestCGN",
  "issuedAt": "2026-06-22T12:00:00.000Z",
  "expiresAt": "2026-06-22T12:00:10.000Z",
  "requiredPermission": "agent.actions.execute",
  "targetAgentId": "stream-pc-main"
}
```

Der Webserver prüft vor dem Senden:

- User ist eingeloggt.
- Rolle ist vorhanden.
- Permission ist vorhanden.
- Modul ist freigegeben.
- Aktion ist erlaubt.
- Agent ist online.
- Request ist nicht abgelaufen.
- Payload ist grundsätzlich gültig.
- Audit-Voreintrag wird geschrieben.

Der Agent prüft zusätzlich:

- Action ist in lokaler Allowlist.
- Payload-Schema ist gültig.
- Keine freien Pfade.
- Keine freien URLs.
- Keine Shell-Kommandos.
- Keine raw config writes.
- `expiresAt` ist gültig.
- `requestId` wurde nicht bereits verarbeitet.

## 10. Statusmeldungen

Der Agent sollte regelmäßig Status senden:

```text
agent.connected
agent.heartbeat
agent.status
local.backend.status
local.websocket.status
obs.status
sound.status
overlay.status
media.status
lastAction.result
lastAction.error
```

Statusfelder können später sein:

```text
agentOnline
agentVersion
backendReachable
backendBaseUrl
obsConnected
soundSystemReady
mediaRootReady
overlayBusConnected
lastHeartbeatAt
lastCommandAt
lastErrorAt
```

## 11. Reconnect / Offline-Verhalten

Regeln:

- Agent reconnectet automatisch.
- Webserver markiert Agent nach Timeout als `offline`.
- Dashboard zeigt Remote-Status klar an.
- Remote-Aktionen werden blockiert, wenn kein passender Agent online ist.
- Produktionsrelevante Bearbeitung wird blockiert, wenn Agent offline ist.
- Abgelaufene Requests werden nicht mehr ausgeführt.
- Nach Reconnect sendet Agent vollständigen Status.
- Offene Dashboards bekommen Agent-Statusupdates.
- Keine Aktion wird blind als erfolgreich behandelt.
- Ergebnisantwort ist Pflicht.
- Es gibt keine Offline-Queue und keine automatische spätere Ausführung.

Beispielstatus:

```text
online
offline
reconnecting
disabled
auth_failed
version_mismatch
```

## 12. Edit-Session-/Lock-System

Für Multi-User-Bearbeitung wird ein zentrales Edit-Session-/Lock-System geplant.

Jede Bearbeitung bekommt:

```text
editSessionId
lockId
resourceKey
resourceType
resourceVersion
ownerUserId
ownerDisplayName
clientId
source: local-dashboard | remote-modboard
agentRequired: true/false
createdAt
heartbeatAt
expiresAt
status
```

Jede produktive Änderung bekommt zusätzlich:

```text
requestId
auditId
correlationId
```

Produktionsrelevante Bearbeitung ist nur erlaubt, wenn:

- User passende Permission hat
- Modul freigegeben ist
- Agent online ist
- aktueller lokaler Stand geladen wurde
- Resource nicht von jemand anderem gelockt ist

## 13. Sicherheitsregeln

Zwingende Regeln:

- Keine freien Befehle.
- Keine freien Shell-Kommandos.
- Keine freien Dateipfade.
- Keine freie URL-Ausführung.
- Keine direkten DB-Befehle.
- Keine raw config writes.
- Keine produktive Aktion ohne serverseitige Permission.
- Keine produktive Aktion ohne Agent-Allowlist-Prüfung.
- Jede Aktion mit `requestId`.
- Jede Aktion mit `expiresAt`.
- Jede Aktion mit Ergebnisantwort.
- Jede produktive Aktion ins Audit-Log.
- Secrets nie im Klartext anzeigen oder loggen.

## 14. Audit-Log

Jede produktive Remote-Aktion muss auditierbar sein.

Zu speichern:

```text
wer
wann
welche lokale Rolle
welche Permission
welche Aktion
welcher Agent
Payload-Zusammenfassung
Ergebnis
Fehler
Dauer
requestId
editSessionId falls relevant
resourceKey falls relevant
ip/userAgent falls sinnvoll
```

Nicht ins Audit im Klartext:

```text
Secrets
Tokens
private Keys
sensible Konfigwerte
vollständige große Payloads
```

Audit-Ziel:

- nachvollziehbar für Owner/Admin
- nicht für normale Mods
- Retention später konfigurierbar
- kritische Aktionen besonders sichtbar

## 15. Minimaler erster technischer Test später

Noch keine Umsetzung in diesem Step.

Ein späterer Minimal-Test sollte sein:

1. Agent verbindet sich mit Webserver.
2. Webserver zeigt Agent online.
3. Dashboard sendet `agent.ping`.
4. Agent antwortet mit `pong`.
5. Audit enthält Request und Ergebnis.
6. Agent wird getrennt.
7. Dashboard zeigt offline.
8. Remote-Aktion wird sauber blockiert.

Erst danach sollten weitere Status-Actions geplant werden.

## 16. Nicht Teil dieses Steps

Nicht Teil dieses Planungssteps:

- kein Backend-Code
- kein Agent-Code
- kein Dashboard-v2-Code
- keine DB-Änderung
- keine Config-Änderung
- kein Bootstrap-/Design-Entscheid
- keine OBS-Änderung
- keine produktive Remote-Verbindung
