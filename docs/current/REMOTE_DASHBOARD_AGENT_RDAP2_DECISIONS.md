# REMOTE DASHBOARD AGENT RDAP2 DECISIONS

Stand: 2026-06-22  
Step: RDAP2.DOC1 / Architekturentscheidungen Webserver-Agent  
Status: Planung, keine Umsetzung

## 1. Zweck

Diese Datei hält die in RDAP2 entschiedene Architektur für das spätere Remote-Modboard / Dashboard-v2 fest.

RDAP2 implementiert nichts.

Nicht Teil dieses Steps:

- kein Backend-Code
- kein Agent-Code
- kein Dashboard-v2-Code
- keine React-/Vite-Dateien
- keine DB-Migration
- keine Config-Änderung
- keine OBS-Änderung
- keine produktive Remote-Verbindung
- kein Node-Neustart

## 2. Grundarchitektur

Zielarchitektur:

```text
Webserver = öffentliche Dashboard-/Modboard-Zentrale
Stream-PC-Agent = sichere Brücke zum lokalen System
Stream-PC = produktive Runtime / Ausführer
UGREEN NAS / MariaDB = private lokale Backup-/Media-/Meta-Schicht
```

Der Stream-PC verbindet sich aktiv per WSS/WebSocket zum Webserver.

Nicht geplant:

```text
Webserver -> Heim-IP / Stream-PC-Portfreigabe
Mods -> direkter Zugriff auf Stream-PC
NAS -> öffentliche Dashboard-Zentrale
```

## 3. Öffentliche Zentrale

Festgelegt:

```text
Subdomain: modboard.forrestcgn.de
Server: Hetzner
Verwaltung: ISPConfig
Webserver: nginx
TLS/HTTPS: Let's Encrypt über ISPConfig
Node-App: intern auf dem Hetzner-Server
bevorzugter interner Port: 127.0.0.1:3000
öffentlich: nur HTTPS/WSS
```

Wichtig:

- Node wird nicht direkt öffentlich auf einem Port freigegeben.
- nginx/ISPConfig übernimmt HTTPS/WSS Reverse Proxy.
- WebSocket-Upgrade muss ISPConfig-kompatibel eingerichtet werden.
- Keine manuellen nginx-Konfigurationsänderungen an ISPConfig vorbei, außer bewusst dokumentiert.

## 4. Stream-PC-Agent

Festgelegt:

```text
Der Stream-PC-Agent wird als separater Node-Prozess geplant.
```

Er ist nicht Teil des bestehenden lokalen `stream-control-center`-Backends.

Das bestehende lokale Backend bleibt produktive Runtime:

```text
lokales Backend: http://127.0.0.1:8080
lokales Dashboard aktuell: http://127.0.0.1:8080/dashboard
```

Der Agent verbindet sich aktiv per WSS mit dem Webserver und spricht später lokal mit dem bestehenden Backend.

Der Agent bekommt eigene lokale Config:

```text
agentId
agentName
serverUrl
agentSecret
localBackendUrl
allowlist
```

Der Agent darf nicht:

- freie Shell-Kommandos ausführen
- beliebige Dateien schreiben
- beliebige Dateien löschen
- beliebige Pfade akzeptieren
- beliebige Windows-Prozesse starten
- freie URLs laden
- raw config writes ausführen
- direkte DB-Befehle entgegennehmen
- produktive Aktionen ohne Allowlist ausführen

## 5. RDAP3 Minimal-Agent

RDAP3 darf nur den kleinsten technischen Weg testen.

Erlaubt:

```text
agent.ping
agent.status.request
```

RDAP3-Ziel:

- Agent startet lokal.
- Agent liest lokale Config.
- Agent verbindet per WSS zum Webserver.
- Agent authentifiziert sich mit `agentId` + Secret.
- Agent sendet Heartbeat.
- Agent sendet Basisstatus.
- Webserver kann `agent.ping` senden.
- Agent antwortet mit `pong`.
- Webserver schreibt Audit für Request und Ergebnis.
- Agent reconnectet.
- Webserver zeigt online/offline.

Nicht in RDAP3:

- Sound steuern
- OBS steuern
- Overlay steuern
- Media schreiben
- Texte schreiben
- Configs schreiben
- Commands/Kanalpunkte ändern
- DB-Zugriff
- Datei-/Shell-/Prozessaktionen

## 6. Remote-Actions v1 nach RDAP3

Nach stabilem RDAP3-Minimaltest dürfen Remote-Actions v1 nur lesend/statusbezogen sein.

Erlaubt für v1:

```text
agent.ping
agent.status.request
agent.capabilities.request
local.backend.status.request
obs.status.request
sound.status.request
overlay.status.request
```

Ausgeschlossen für v1:

```text
sound.play.live
sound.test.live
sound.pause
sound.resume
sound.stop_current
obs.scene.switch
obs.source.show
obs.source.hide
overlay.show.live
overlay.hide.live
media.upload
media.delete
media.write
config.write
texts.write
commands.write
channelpoints.write
db.*
file.*
shell.*
process.*
raw_http.*
```

Grundregel:

```text
Erst Verbindung, Auth, Heartbeat, Status, Ergebnisantwort und Audit stabil testen.
Dann schrittweise produktive Aktionen planen.
```

## 7. Offline-Regel

Wenn Stream-PC oder Agent offline sind:

Erlaubt:

- Login am Webserver
- Dashboard / Modboard lesend öffnen
- letzter bekannter Status ansehen
- Audit / Logs ansehen
- Webserver-eigene Admin-Daten bearbeiten, sofern Rechte vorhanden sind

Gesperrt:

- produktive Aktionen
- produktionsrelevante Bearbeitung
- Texte bearbeiten
- Configs bearbeiten
- Media hochladen / zuordnen / löschen
- Commands bearbeiten
- Kanalpunkte bearbeiten
- Overlay-Layouts bearbeiten
- Stream-/Runtime-Modul-Einstellungen bearbeiten

Es gibt keine Offline-Queue.

Es gibt keine automatische spätere Ausführung.

Das Dashboard muss klar anzeigen:

```text
Agent offline
Live-System nicht erreichbar
Bearbeitung und produktive Aktionen sind gesperrt
```

## 8. Login / User / Rollen / Permissions

Festgelegt:

```text
Login, Benutzer, Rollen, Permissions und Modulfreigaben werden führend auf dem Webserver verwaltet.
```

Der Webserver fragt den Stream-PC-Agent nicht für die grundsätzliche Login- oder Rechteentscheidung.

Der Agent liefert nur:

- Online-/Offline-Status
- lokale Capabilities
- lokale Modulverfügbarkeit
- lokale Ausführbarkeitsprüfung
- Ergebnisantworten auf erlaubte Remote-Actions

Twitch-Rollen helfen nur bei der Erkennung oder Vorauswahl. Lokale Dashboard-Rollen entscheiden konkret.

## 9. Datenhoheit

### Webserver führt

```text
Login
User
Rollen
Permissions
Modulfreigaben
Edit-Sessions / Locks
Audit
Agent-Status
Remote-Requests
Remote-Result-Verknüpfung
Media-Verwaltungsmetadaten für das Modboard
```

### Stream-PC führt produktiv

```text
lokale Runtime
OBS
Sound-System
Overlays
lokales Backend
produktive Texte
produktive Configs
produktive SQLite
lokale Media-Verfügbarkeit
Live-/Runtime-Status
```

### NAS / MariaDB optional

```text
Backup
Media-Archiv / Media-Master
Papierkorb / Archivversionen
Snapshots
Versionen
Sync-Status
lokale Audit-Kopie
Meta-Daten
```

NAS/MariaDB ist kein Ersatz für den Stream-PC-Agent und kein sofortiger Ersatz für die produktive SQLite.

## 10. Texte und Configs

Festgelegt:

```text
Texte und Configs bleiben produktiv führend auf dem Stream-PC.
```

Der Webserver darf:

- anzeigen
- Bearbeitung vorbereiten
- Rechte prüfen
- Edit-Session / Lock erstellen
- Audit vorbereiten
- Änderungsrequest an Agent senden

Der Webserver darf nicht:

- produktive lokale Configs direkt überschreiben
- Offline-Änderungen später automatisch aktivieren
- bei offline Agent so tun, als wäre eine Änderung aktiv

Produktive Änderung gilt erst nach erfolgreicher Agent-Antwort.

## 11. Media-Dateien

Festgelegt:

```text
NAS kann Media-Archiv / Media-Master sein.
Stream-PC hält lokale produktive Live-Kopien.
Webserver verwaltet Upload, Freigabe, Metadaten und Audit.
Produktiv nutzbar ist Media erst nach Agent-Bestätigung.
```

Nicht geplant:

```text
OBS/Sound/Overlay liest live ausschließlich vom NAS.
```

Grund:

```text
Livebetrieb darf nicht hart von NAS/LAN abhängig sein.
```

## 12. Produktive SQLite und MariaDB

Produktive SQLite bleibt unangetastet:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Festgelegt:

- keine sofortige Migration auf MariaDB
- keine Ablösung bestehender SQLite ohne separaten Step
- keine DB löschen / ersetzen / droppen
- MariaDB auf NAS darf später für neue Meta-/Sync-/Snapshot-/Archivdaten geplant werden
- jede Migration bestehender Daten braucht eigene Planung, Test und Freigabe

## 13. Lokales Dashboard

Lokale Arbeit am Dashboard bleibt möglich.

```text
Lokales Dashboard:
http://127.0.0.1:8080/dashboard
später optional:
http://127.0.0.1:8080/dashboard-v2
```

Remote-Modboard:

```text
https://modboard.forrestcgn.de
```

Wichtige Regel:

```text
Es darf keine getrennte Remote-Wahrheit entstehen.
```

Produktive Texte, Configs, Runtime und lokale Medienverfügbarkeit bleiben auf dem Stream-PC führend.

## 14. Zentrales Edit-Session-/Lock-System

RDAP2 entscheidet: Es wird kein simples Lock-System geplant, sondern ein zentrales Edit-Session-/Lock-System.

Ziel:

```text
Der Webserver weiß jederzeit:
wer bearbeitet
was bearbeitet wird
von welchem Client
auf welcher Version
seit wann
ob der User noch aktiv ist
ob der Agent für diesen Bereich online sein muss
ob gespeichert werden darf
```

Jede Bearbeitung bekommt:

```text
editSessionId
lockId
```

Jeder bearbeitbare Bereich bekommt:

```text
resourceKey
```

Jeder Browser / Client bekommt:

```text
clientId
```

Jede produktive Änderung bekommt:

```text
requestId
```

Jede nachvollziehbare Aktion bekommt:

```text
auditId / correlationId
```

## 15. Resource-Key-Beispiele

```text
texts:shot_alarm:chat_messages
config:loyalty:core
media:item:1234
media:category:sounds
overlay:layout:central_event
command:sound:example
channelpoints:vip30
```

Dadurch wird nicht das ganze Dashboard gesperrt, sondern nur der konkrete Bereich.

## 16. Pflichtfelder für Edit-Sessions

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

Beim Speichern wird geprüft:

- Lock gehört diesem User.
- Lock gehört diesem Client.
- Lock ist aktiv.
- Resource-Version passt.
- Agent ist online, falls `agentRequired=true`.
- Payload ist gültig.
- Permission ist vorhanden.
- Agent bestätigt lokale Anwendung.

Wenn `resourceVersion` nicht mehr passt:

```text
Speichern verweigern.
Hinweis: Stand ist veraltet, bitte neu laden.
```

## 17. Heartbeat / Timeout

Geplante Werte für spätere technische Planung:

```text
Heartbeat: ca. alle 15 Sekunden
Warnung: nach ca. 45 Sekunden ohne Heartbeat
Timeout: nach ca. 60 Sekunden ohne Heartbeat
```

Bei Timeout:

- Edit-Session wird als abgelaufen markiert.
- Lock wird auditierbar beendet.
- Alter Editor darf nicht mehr speichern.
- Andere User können den Bereich neu bearbeiten.

## 18. Agent-Verlust während Bearbeitung

Wenn der Agent während einer Bearbeitung offline geht:

- UI zeigt Warnung.
- Speichern produktiver Daten wird deaktiviert.
- keine produktive Änderung möglich
- keine Queue
- keine automatische spätere Ausführung
- Lock läuft aus oder wird auditierbar beendet
- User muss nach Reconnect den aktuellen Stand neu laden und eine neue Edit-Session starten

## 19. Webserver-eigene Admin-Daten

Webserver-eigene Admin-Daten dürfen auch bei Agent offline bearbeitbar bleiben, sofern Rechte vorhanden sind.

Dazu gehören:

- User
- Rollen
- Permissions
- Modulfreigaben
- Webserver-Audit
- Webserver-Systemdaten

Nicht dazu gehören:

- Stream-Texte
- Stream-Configs
- Media
- Commands
- Kanalpunkte
- Overlay-Layouts
- Runtime-Modul-Einstellungen

## 20. Sicherheitsregeln

Zwingend:

- keine freien Befehle
- keine freien Shell-Kommandos
- keine freien Dateipfade
- keine freie URL-Ausführung
- keine direkten DB-Befehle
- keine raw config writes
- keine produktive Aktion ohne serverseitige Permission
- keine produktive Aktion ohne Agent-Allowlist-Prüfung
- jede Remote-Action mit `requestId`
- jede Remote-Action mit `expiresAt`
- jede Remote-Action mit Ergebnisantwort
- jede produktive Aktion ins Audit
- Secrets nie im Klartext anzeigen oder loggen

## 21. Offene Punkte nach RDAP2

Für RDAP3 / RDAP4 später klären:

- exaktes Agent-Config-Format
- Secret-Erstellung / Pairing-Flow
- WSS-Endpunkt-Schema
- Webserver-Datenbank-Schema
- Edit-Session-Tabellenmodell
- Audit-Tabellenmodell
- Permission-/Modulfreigaben technisch finalisieren
- Agent-Allowlist-Schema finalisieren
- Payload-Schemas für Status-Actions
- ISPConfig-kompatible WSS-Reverse-Proxy-Konfiguration
- lokales Dashboard-v2 und Remote-Modboard Lock-Anbindung planen

## 22. Nächste Schritte

Direkt danach sinnvoll:

```text
RDAP3 / Minimal-Agent-Konzept planen
```

RDAP3 bleibt Planung, bis explizit Umsetzung freigegeben wird.

Danach:

```text
RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell planen
DASHUI2 / React+Vite Frontend-Technikentscheidung finalisieren
DASHUI3 / Minimaler React-Prototyp planen
```
