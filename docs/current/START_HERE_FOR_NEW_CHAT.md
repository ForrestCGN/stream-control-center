# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.34 - Media Persistent Index Migration Foundation Readonly`.

## Verbindlich

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Wenn GitHub/dev ueber Connector nur unvollstaendig/abgeschnitten lesbar ist: zuerst Sammel-Script fuer Quell-Dateien liefern, Forrest laedt Source-ZIP hoch, danach erst echten Install-Step bauen.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
Keine Online-Sonder-UI.
```

## 0.2.34 Status

```text
0.2.34 ist eine kleine DB-Migration/Foundation fuer den Media Persistent Index.
Erstellt/validiert Tabelle remote_media_index ueber bestehende DB-Schicht backend/core/database.js + ensureSchema.
Media-Route bleibt read-only.
Agent-Sync schreibt in diesem Step noch keine Media-Daten in die DB.
/api/remote/media/status meldet persistentIndex-Status.
Memory bleibt online zuerst.
Lokal bleibt Datei-Wahrheit.
Keine Uploads, Deletes oder Edits.
Keine Agent-Actions.
Keine neue Runtime-Datei.
```

Step-Doku:

```text
docs/current/RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY.md
```

## Harte Architekturregeln

```text
1. Eine UI, zwei Runtime-Profile.
2. Module sind fachlich, nicht technisch.
3. Sync ist Infrastruktur, kein eigenes Navigationsmodul.
4. Agent ist Infrastruktur, kein Fachmodul.
5. Gleiche Funktionen bleiben im gleichen fachlichen Modul.
6. Jede Funktion wird von Anfang an mit User-/Rollen-/Permission-Modell gedacht.
7. Keine Write-Funktion ohne serverseitige Permission-Pruefung, Confirm, Audit und Readback.
8. Neue Runtime-Dateien sind verboten, ausser Forrest genehmigt sie ausdruecklich nach Begruendung.
9. Erst vorhandene Media-/Agent-/DB-Dateien nutzen oder gar nichts bauen.
10. UI-/i18n-Fehler separat behandeln, nicht mit DB-/Persistent-Index-Code vermischen.
```

## 8080 / 3010 Wahrheit

```text
8080 = lokal
3010 = Server
```

Lokal:

```text
Lokaler Server: http://127.0.0.1:8080
Lokales Dashboard: http://127.0.0.1:8080/dashboard-v2
Lokale Adapter-/SCC-Schicht:
- backend/modules/local_remote_modboard_adapter.js
- backend/modules/remote_agent.js
Produktive lokale SQLite-DB:
- D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Server/RDAP:

```text
Public: https://mods.forrestcgn.de/
Interner Server-Dienst: http://127.0.0.1:3010
Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
Server-Code:
- remote-modboard/backend/src/**/*.js
```

Keine lokalen Checks gegen 3010.
3010 nur fuer Webserver-/RDAP-Server-Checks nach GitHub/dev + Deploy.

## Aktuelle Media-Verantwortung

```text
backend/modules/local_remote_modboard_adapter.js
- lokal 8080 Adapter fuer /api/remote/*
- lokale Media-Statusroute /api/remote/media/status
- liest lokal htdocs/assets/* read-only
- blockiert Writes

backend/modules/remote_agent.js
- lokaler Agent /api/remote-agent/*
- scannt lokale Media-Roots read-only
- sendet Media-Inventar als WSS Slow-Sync
- akzeptiert keine produktiven Actions

remote-modboard/backend/src/services/agent-runtime.service.js
- Server 3010 Agent-WSS Runtime
- validiert/sanitized Heartbeat/Live-State/OBS/Media-Inventar
- haelt Media-Inventar memory-only
- persistsToDatabase=false

remote-modboard/backend/src/routes/media-readonly.routes.js
- Server 3010 /api/remote/media/status
- online liest aus agent-runtime memory-only
- bereitet remote_media_index DB-Schema vor
- DB-Fallback/Data-Writes bleiben deaktiviert
```

## Sicherheitsgrenzen

```text
Keine Media-Uploads.
Keine Media-Deletes.
Keine Media-Edits.
Keine Agent-Actions ohne separaten Step.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade in API/UI/DB.
Keine Datei-Inhalte im Server-Index.
Keine Secrets in Logs/Status/UI/Docs.
Keine neuen Runtime-Dateien ohne ausdrueckliche Genehmigung.
0.2.34 erlaubt nur die bestaetigte DB-Schema-Migration fuer remote_media_index.
```

## Naechster sinnvoller Step

```text
Nach 0.2.34 zuerst lokal und online pruefen:
- node --check fuer media-readonly.routes.js
- /api/remote/media/status persistentIndex.ok/tableName/schemaVersion
- keine Upload/Edit/Delete/Agent-Actions aktiv

Danach erst eigener Step fuer Daten-Write/Fallback-Lesen, wenn ausdruecklich freigegeben.
```
