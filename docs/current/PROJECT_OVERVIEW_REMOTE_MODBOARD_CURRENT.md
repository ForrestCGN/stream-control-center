# Projektuebersicht - Remote-Modboard / RDAP

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / `remote-modboard` / RDAP  
Branch: `dev`

## Zweck

Diese Datei ist die zentrale aktuelle Orientierung fuer das Remote-Modboard / RDAP.

Sie ersetzt nicht die historischen RDAP-Step-Dateien. Historische Dateien bleiben als Nachweis erhalten, sind aber nicht automatisch aktueller als diese Current-Dateien.

## Projektziel

Das Remote-Modboard ist die externe Moderations- und Admin-Oberflaeche fuer ForrestCGN.

Langfristiges Ziel:

```text
- Webserver als oeffentliche, abgesicherte Zentrale.
- Login und Rechtepruefung serverseitig.
- Berechtigte User bedienen nur freigegebene Bereiche.
- Stream-PC verbindet spaeter aktiv per WSS zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Keine freien Shell-/Datei-/Prozess-/URL-Befehle.
- OBS-/Sound-/Overlay-/Command-Aktionen nur ueber explizite Allowlist und Audit.
```

## Grundarchitektur

```text
Browser / berechtigter User
        |
        v
https://mods.forrestcgn.de/
        |
        v
Remote-Modboard Backend auf Webserver
        |
        | spaeter WSS/EventBus/Allowlist
        v
Stream-PC-Agent im lokalen Netz
        |
        v
OBS / Sounds / Overlays / Stream-Funktionen
```

Aktuell ist die Webserver-Seite mit Auth-, Session-, Admin-User-, Admin-Notes-, Status- und Agent-Read-only-Basis aufgebaut. Agent-/OBS-/Sound-/Overlay-Steuerung ist nicht produktiv freigegeben.

## Wichtige Orte

```text
GitHub Repo:
https://github.com/ForrestCGN/stream-control-center

Branch:
dev

Lokales Repo:
D:\Git\stream-control-center

Lokales Live-System:
D:\Streaming\stramAssets

Remote-Modboard Webserver-Service:
 /opt/stream-control-center/remote-modboard

Webserver-Deploy-Arbeitsordner:
 /opt/stream-control-center/_deploy_tmp

Remote-Modboard Public URL:
https://mods.forrestcgn.de/

Interner Service:
http://127.0.0.1:3010/

Systemd-Service:
scc-remote-modboard.service
```

Wichtige Regel:

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
Dort kein git pull verwenden.
Deploys laufen ueber frischen GitHub/dev-Clone und den Wrapper:
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Aktueller Funktionsstand

Bestaetigt:

```text
- Remote-Modboard-Webseite laeuft ueber mods.forrestcgn.de.
- Backend-Service laeuft intern auf Port 3010.
- Twitch-/Session-/Auth-Basis ist aufgebaut.
- Dashboard-Zugriff wird serverseitig geprueft.
- Routen-/Status-/Auth-/Permission-Diagnostik existiert.
- Admin-User-Modell kann gelesen werden.
- Admin-User-Detail ist read-only sichtbar.
- Admin-Notes sind sichtbar.
- Admin-Notes Create funktioniert.
- Admin-Notes Update/Speichern funktioniert.
- Admin-Notes Delete/Deactivate sind deaktiviert.
- Stream-PC Verbindung ist als Read-only-Status sichtbar.
- Server-Deploy-Wrapper ist live installiert.
- Backup-/Deploy-Cleanup ist live installiert und getestet.
```

## Aktueller Agent-/Stream-PC-Stand

```text
Stream-PC-Verbindung:
- Status in Admin / Verbindungen sichtbar.
- Transport-Ziel: WSS.
- Richtung: Stream-PC -> Webserver.
- Public WSS Heartbeat wurde in RDAP101B erfolgreich bestaetigt.
- Runtime danach final deaktiviert.

Aktueller Sicherheitszustand:
- agent.connected=false
- actionEnabled=false
- productiveAgentRuntime=false
- runtime.requestedEnabled=false
- runtime.effectiveEnabled=false
- runtime.acceptsAgentConnections=false
- runtime.heartbeatReceiverEnabled=false
```

## Admin-Notes Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create      -> confirmed aktiv
POST /api/remote/admin/users/admin-notes/update      -> confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Create/Update bleiben nur unter serverseitigen Bedingungen moeglich. Das Backend entscheidet ueber Session, Permission, Confirm-Write, Audit, Lock und Readback.

## Bewusst deaktiviert / verboten

```text
- Admin-Note Deactivate
- physisches Delete
- Community-Read fuer Admin-Notizen
- Permission-Verwaltung in der UI
- Rollen-/Gruppen-Schreibverwaltung
- Session-Revocation in der UI
- Agent-Steuerung
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-/Channelpoints-Steuerung
- freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
- DB-Migrationen ohne separaten Plan, Backup und Readback
- neue produktive Writes ohne separaten Sicherheits-Scope
```

## Sicherheitsmodell

Produktive Writes duerfen nicht nebenbei entstehen. Fuer jeden echten Write gelten mindestens diese Bausteine:

```text
- klare Route / klarer Scope
- serverseitige Permission
- confirmWrite
- Audit-Log
- Lock / Konfliktschutz
- Backup-/Rollback-Konzept, wenn Daten betroffen sind
- Readback-Pruefung
- Browser-/API-Test
```

Frontend-Buttons alleine gelten nicht als Sicherheit. Das Backend muss jede produktive Aktion begrenzen und pruefen.

## UI-/Design-Zielbild

```text
- dunkler CGN-/Neon-Look
- violett/blau/cyan Glow
- klare Seitenheader
- linke Hauptnavigation
- kompakte Status-Chips
- keine technischen Diagnosebloecke in Normalansichten
- Admin-Seiten mit menschlichen Labels statt technischen IDs
- Diagnose nur einklappbar oder separat
```

## Aktuelle Doku-Struktur

Aktuelle Orientierung:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Historische RDAP/CAN/DASHUI-Dateien bleiben erhalten, sollen aber nicht mehr als erste Orientierung verwendet werden.

## Naechster fachlicher Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- weitere Stream-PC-Verbindungsdetails nur read-only planen
- bestehende Admin-/Verbindungen-Seite bevorzugen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
```
