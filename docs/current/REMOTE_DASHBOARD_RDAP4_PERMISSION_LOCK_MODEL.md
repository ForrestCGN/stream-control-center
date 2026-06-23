# RDAP4 / Rechte-, Rollen-, Lock- und Audit-Modell

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY_TESTED  
Datum: 2026-06-23  
Projekt: ForrestCGN / stream-control-center / Remote-Dashboard & Modboard

## Zweck

RDAP4 beschreibt das Sicherheits- und Arbeitsmodell für das spätere Remote-Modboard unter:

```text
https://mods.forrestcgn.de
```

RDAP4A war reine Doku/Planung. RDAP4B überführt einen ersten sicheren Teil dieses Modells in das vorhandene Backend-Modul `remote_agent.js` als **read-only API-Vertrag**.

## Ergebnis RDAP4B

RDAP4B erweitert das vorhandene Modul:

```text
backend/modules/remote_agent.js
```

Neue read-only Routen:

```text
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
```

Bestehende Routen bleiben erhalten:

```text
GET /api/remote-agent/status
GET /api/remote-agent/routes
```

## Wichtig: kein neues Modul

Für RDAP4B wurde bewusst **kein neues Modul** angelegt. Das vorhandene `remote_agent`-Modul bleibt der zentrale Ort für:

- Stream-PC-Verbindungsstatus
- Remote-Dashboard-/Modboard-Anbindungsstatus
- read-only Sicherheitsmodell für Permissions, Locks und Audit
- spätere Agent-Sicherheitsgrenzen

Ein eigenes Modul wird erst sinnvoll, wenn später Login, Benutzerverwaltung, produktive Locks, Audit-Speicherung und Webserver-Agent-Management fachlich zu groß für `remote_agent` werden.

## Nicht umgesetzt durch RDAP4B

RDAP4B ändert nichts Produktives.

Nicht enthalten:

- kein neues Modul
- kein Frontend-Code
- keine React-Komponenten
- keine DB-Migration
- keine SQLite-Änderung
- kein produktiver WSS-Agent
- keine Agent-Actions
- keine Schreibroute
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Commands-/Kanalpunkte-Steuerung
- keine Datei-/Shell-/Prozesssteuerung

## Aktueller technischer Stand

- Dashboard-v2 läuft parallel zum bestehenden Dashboard unter `/dashboard-v2/`.
- Bestehendes Dashboard unter `/dashboard/` bleibt produktiv.
- Dashboard-v2 zeigt sichtbar `Stream-PC Verbindung`.
- `/api/remote-agent/status` liefert echte read-only Statusdaten.
- Der Offline-Status ist korrekt, weil noch kein produktiver WSS-Agent existiert.
- RDAP4B liefert zusätzliche read-only Modellrouten für Permissions, Locks und Audit.

## API-Kontrakt RDAP4B

### Status

```text
GET /api/remote-agent/status
```

Liefert weiter den echten Startzustand:

- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- `status.connectionState: offline`
- keine produktiven Aktionen

Neu im Status sind zusätzlich read-only Capabilities:

```text
permissionsModel: true
locksStatus: true
auditModel: true
```

Alle produktiven Capabilities bleiben `false`.

### Permissions-Modell

```text
GET /api/remote-agent/permissions/model
```

Liefert:

- Rollenliste
- Permission-Liste
- Role-Permission-Presets
- Spezialrolle `sound_profi`
- Hinweis, dass Rollen nur Bündel sind und konkrete Permission-Keys entscheiden
- Hinweis, dass Twitch-Rollen nicht automatisch lokale Dashboard-Rechte sind

### Lock-Status

```text
GET /api/remote-agent/locks/status
```

Liefert aktuell nur einen Null-/Planungsstatus:

- `enabled: false`
- `activeLockCount: 0`
- `activeLocks: []`
- geplantes Resource-Key-Format
- geplanter Heartbeat/Timeout
- geplante Takeover-Regeln

Es werden noch keine Locks erstellt, gespeichert oder verändert.

### Audit-Modell

```text
GET /api/remote-agent/audit/model
```

Liefert:

- geplante Mindestfelder
- geplante Eventtypen
- geplante Quellen
- Hinweis auf konfigurierbare Retention
- Hinweis, dass noch keine Audit-Events geschrieben werden


## Bestätigter Test nach RDAP4B

Nach Einspielen, Node-Neustart und API-Prüfung wurden alle RDAP4B-Routen erfolgreich getestet.

Bestätigte Routen:

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Bestätigte Sicherheitswerte:

```text
ok: true
moduleVersion: 0.0.2
moduleBuild: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY
statusApiVersion: rdap4b.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Weiterhin korrekt:

- `status.connectionState` bleibt `offline`, weil noch kein produktiver WSS-Agent existiert.
- `permissionsModel`, `locksStatus` und `auditModel` sind als read-only Capabilities aktiv.
- Produktive Capabilities wie OBS, Sound, Overlay, Media Write, Text Config Write, DB Write, File Write, Shell und Process Control bleiben deaktiviert.
- Es gibt keine Schreibroute und keine produktive Agent-Ausführung.

## Rollenmodell

Geplante lokale Rollen:

| Rolle | Zweck | Kritische Grenzen |
| --- | --- | --- |
| `owner` | Vollzugriff, System-/Security-Hoheit, Notfallübernahme | nicht inflationär vergeben |
| `admin` | Verwaltung von Modulen, Configs, Usern je nach Freigabe | keine Owner-Sonderrechte ohne explizite Permission |
| `lead_mod` | erweiterte Mod-Team-Funktionen, ausgewählte Modulverwaltung | keine Security-/Systemrechte |
| `mod` | normale Stream-/Mod-Bedienung, Events starten/stoppen | keine globalen Config-/Security-Rechte |
| `sound_profi` | Sound-/Media-/Command-/Kanalpunkte-Pflege | keine System-/Security-/Owner-Rechte |
| `media_manager` | optionale Medienpflege, falls später getrennt nötig | keine Systemrechte |
| `readonly` | nur lesen | keine produktiven Aktionen |

## Permission-Prinzip

Rollen bündeln Rechte nur vor. Die spätere Sicherheitsentscheidung erfolgt auf konkreten Permission-Keys.

Beispiele:

```text
dashboard.read
admin.audit.read
admin.users.manage
admin.roles.manage
locks.read
locks.create
locks.heartbeat
locks.release
locks.takeover
texts.read
texts.edit
config.read
config.edit
media.read
media.upload
media.edit
media.delete
sound.read
sound.test
sound.command.edit
channelpoints.edit
obs.control
overlay.control
agent.action.requested
agent.status.read
```

## Spezialrolle `sound_profi`

`Sound-Profi` ist eine bewusst begrenzte Spezialrolle.

Darf später können:

- Media/Sounds hochladen
- Media/Sounds bearbeiten
- Media/Sounds löschen, sofern freigegeben
- Sounds testen
- Sounds zuordnen
- Sound-Commands bearbeiten
- Kanalpunkte-Aktionen für Sound-/Media-Funktionen bearbeiten

Darf **nicht** können:

- Owner-/Security-Rechte verwalten
- globale Rollen vergeben
- Agent-Secrets verwalten
- freie Shell-/Datei-/Prozessaktionen auslösen
- Datenbankmigrationen starten
- globale System-Konfiguration ändern
- alle Module automatisch bearbeiten

## Lock-Modell

Geplantes Resource-Key-Format:

```text
<bereich>:<modul>:<resource-id>
```

Geplante Regeln:

- Ressource laden
- Resource-Version merken
- Edit-Session starten
- Lock setzen
- Heartbeat senden
- Speichern nur mit gültigem Lock
- Version beim Speichern prüfen
- Audit schreiben
- Lock freigeben

Geplante Standards:

```text
heartbeatIntervalSec: 20
timeoutSec: 90
takeoverAllowedFor: owner, admin
saveRequiresValidLock: true
versionCheckRequired: true
sharedReadWhileLocked: true
```

RDAP4B setzt diese Regeln noch nicht produktiv um, sondern stellt sie nur als read-only Modell bereit.

## Audit-Modell

Produktive Änderungen müssen später nachvollziehbar sein.

Geplante Mindestfelder:

```text
auditId
timestamp
actorUserId
actorDisplayName
source
action
permission
resourceKey
oldValueSummary
newValueSummary
status
requestId
correlationId
```

Geplante Eventtypen:

```text
permission.check
locks.create
locks.heartbeat
locks.release
locks.takeover
resource.save.requested
resource.save.succeeded
resource.save.failed
agent.action.requested
agent.action.accepted
agent.action.rejected
agent.action.failed
```

Sensible Werte dürfen später nicht im Klartext im Audit landen, sondern nur maskiert oder zusammengefasst.

## Agent-Sicherheitsgrenzen

Der spätere Stream-PC-Agent darf nur explizit erlaubte Action-Typen annehmen.

Verbindlich:

- Allowlist statt freie Befehle
- keine freie Shell
- keine freien Dateipfade
- keine freie Prozesssteuerung
- keine produktive Offline-Queue für Aktionen
- jede produktive Aktion braucht Permission-Prüfung
- jede produktive Aktion braucht Audit
- Payloads müssen schema-/typgeprüft sein

RDAP4B führt noch keine Agent-Aktionen aus.

## Tests für RDAP4B

Nach Einspielen und Node-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/permissions/model" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/locks/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/audit/model" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/routes" | ConvertTo-Json -Depth 8
```

Erwartung:

- alle Antworten `ok: true`
- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- keine produktive Capability aktiviert

## Nächster sinnvoller Schritt

Nach RDAP4B:

```text
RDAP4C_DASHBOARD_V2_SECURITY_MODEL_VIEW
```

Ziel: Dashboard-v2 zeigt die neuen read-only Modellrouten sichtbar an, weiterhin ohne Schreibfunktion.

Alternativ später:

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

für Login/User/Rollen/Grant-Speicherung, aber erst nach bewusster Planung.
