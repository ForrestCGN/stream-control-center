# REMOTE DASHBOARD AGENT RDAP2 DECISIONS

Stand: 2026-06-23  
Step: RDAP2.DOC1 / Architekturentscheidungen Webserver-Agent + RDAP3-Verweis  
Status: Planung, keine Umsetzung

## 1. Zweck

Diese Datei hält die in RDAP2 entschiedene Architektur für das spätere Remote-Modboard / Dashboard-v2 fest.

RDAP2 implementiert nichts.

Aktueller Hinweis aus RDAP2.WEB1/RDAP3:

```text
Der führende Remote-Modboard-Zielname ist mods.forrestcgn.de.
Die frühere Planungs-Subdomain modboard.forrestcgn.de ist nicht mehr führend.
```

## 2. Öffentliche Zentrale

Festgelegt:

- Webserver wird öffentliche Dashboard-/Modboard-Zentrale.
- Remote-Modboard läuft später unter `https://mods.forrestcgn.de`.
- Webserver ist Hetzner mit ISPConfig, nginx und Let's Encrypt.
- Node-App auf dem Webserver läuft später intern, bevorzugt `127.0.0.1:3000`.
- Öffentlich erreichbar sind nur HTTPS/WSS.
- Es wird kein öffentlicher Node-Port geöffnet.

## 3. Stream-PC-Agent

Festgelegt:

- Stream-PC-Agent wird als separater Node-Prozess geplant.
- Agent wird nicht als Modul im bestehenden lokalen Backend gebaut.
- Agent verbindet sich aktiv per WSS zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Dynamische Heim-IP ist egal.
- Stream-PC bleibt produktive Runtime / Ausführer.
- Bestehendes lokales Backend bleibt produktiv auf `http://127.0.0.1:8080`.

## 4. Login / Rechte / Rollen

Festgelegt:

- Login, User, Rollen, Permissions und Modulfreigaben werden führend auf dem Webserver verwaltet.
- Der Agent wird nicht für grundsätzliche Login-/Rechteentscheidungen abgefragt.
- Twitch-Rollen helfen höchstens bei Erkennung/Vorschlag.
- Lokale Dashboard-Rollen und Permissions entscheiden konkret.
- Dashboard-Buttons sind keine Sicherheit.
- Backend/Webserver muss Rechte serverseitig prüfen.
- Agent prüft lokal zusätzlich Allowlist und Payload.

## 5. Agent offline

Wenn Agent offline ist:

Erlaubt:

- Login
- lesende Dashboard-Ansicht
- letzter bekannter Status
- Webserver-eigene Admin-/Audit-Ansichten, falls Rechte passen

Gesperrt:

- produktive Bearbeitung
- produktive Aktionen
- Remote-Actions
- Text-/Config-/Media-/Command-/Kanalpunkte-Änderungen
- Overlay-Layout-Änderungen

Festgelegt:

- Keine Offline-Queue.
- Keine automatische spätere Ausführung nach Reconnect.
- Abgelaufene Requests werden nicht nachträglich ausgeführt.

## 6. Datenhoheit

Festgelegt:

- Webserver führt Login, Rollen, Permissions, Modulfreigaben, Agent-Verwaltung und Audit für Remote-Zugriffe.
- Stream-PC bleibt produktive Runtime und Ausführer.
- Texte und Configs bleiben produktiv führend auf dem Stream-PC.
- Produktive SQLite bleibt unangetastet.
- NAS/MariaDB ist optional nur private lokale Backup-/Media-/Meta-Schicht.
- NAS/MariaDB ersetzt nicht den Stream-PC-Agent.
- NAS/MariaDB ersetzt nicht die produktive SQLite.

## 7. Remote-Actions v1

Nach RDAP3 und einem stabilen Minimaltest dürfen zunächst nur lesende/statusbezogene Actions geplant werden.

RDAP3 Minimal-Agent:

```text
agent.ping
agent.status.request
```

Später mögliche Remote-Actions v1:

```text
agent.ping
agent.status.request
agent.capabilities.request
local.backend.status.request
obs.status.request
sound.status.request
overlay.status.request
```

Nicht in v1:

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

## 8. Multi-User / Edit-Sessions / Locks

Festgelegt:

- Für Multi-User-Bearbeitung wird ein zentrales Edit-Session-/Lock-System geplant.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Lock-Mechanismus nutzen.
- Bearbeiten erzeugt einen Lock.
- Andere User sehen gesperrte Resource nur lesend.
- Lock hat Heartbeat und Timeout.
- Speichern/Abbrechen/Logout gibt Lock frei.
- Owner/Admin können Locks übernehmen.
- Lock-Aktionen werden auditierbar.

Geplante Begriffe:

```text
resourceKey
resourceType
resourceVersion
editSessionId
lockId
clientId
requestId
auditId
correlationId
```

Resource-Key-Beispiele:

```text
texts:shot_alarm:chat_messages
config:loyalty:core
media:item:1234
media:category:sounds
overlay:layout:central_event
command:sound:example
channelpoints:vip30
```

## 9. Sicherheitsregeln

Zwingend:

- Keine freien Shell-Befehle.
- Keine freien Dateioperationen.
- Keine freie URL-Ausführung.
- Keine direkten DB-Befehle.
- Keine raw config writes.
- Keine produktive Aktion ohne serverseitige Permission.
- Keine produktive Aktion ohne lokale Agent-Allowlist.
- Jede Aktion mit `requestId`.
- Jede Aktion mit `expiresAt`.
- Jede Aktion mit Ergebnisantwort.
- Jede produktive Aktion ins Audit.
- Secrets nicht im Klartext anzeigen oder loggen.

## 10. Nächste Schritte

RDAP3:

- Minimal-Agent-Konzept planen
- Agent-Config planen
- WSS-Verbindung planen
- Auth mit `agentId` + Secret planen
- Heartbeat planen
- Basisstatus planen
- `agent.ping` planen
- `agent.status.request` planen
- Request-/Result-/Audit-Struktur planen
- Offline-/Reconnect-Verhalten planen
- keine produktiven Aktionen

RDAP4:

- Permission- und Edit-Session-/Lock-Datenmodell planen
- Rollen-/Permission-Matrix technisch konkretisieren
- Modulfreigaben planen
- Lock-/Resource-Version-Konflikte planen
- Audit für Locks planen
- keine DB-Migration ohne separaten Step

DASHUI2:

- React + Vite als bevorzugte Frontend-Richtung konkretisieren
- Dashboard-v2 Build-/Deploy-Ziel planen
- CGN-Komponentensystem planen
- Navigation-/Modul-Registry planen
- keine produktive Frontend-Umsetzung ohne separaten Step

## 11. Nicht geändert durch RDAP2/RDAP3-Doku

- kein Backend-Code
- kein Dashboard-Code
- kein Frontend-Code
- kein Agent-Code
- keine DB-Änderung
- keine Config-Änderung
- keine OBS-Änderung
- keine produktive Remote-Verbindung
- kein Node-Neustart nötig
