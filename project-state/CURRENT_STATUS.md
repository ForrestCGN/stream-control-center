# Current Status

Stand: 2026-06-29

Aktuell: `0.2.31 - Media 8080/3010 File Module Inventory No Code`.

## Technischer Stand

```text
- 0.2.27B ist lokal und online getestet: Agent bleibt nach Media-Sync verbunden.
- Webserver-Check bestaetigt: connected=true, lastMediaSync gesetzt, mediaReject=null, heartbeatReject=null.
- Online /api/remote/agent/media/inventory/status liefert Media-Inventar aus Agent-Memory.
- 0.2.28 ist online bestaetigt: runtimeMode=online, active=true, returned=120, truncated=true, memoryOnly=true, serverPersistence=false.
- Lokal liefert Media-Inventar vollstaendig aus htdocs/assets/* und bleibt Master/Wahrheit.
- 0.2.29 ist ein reiner Plan-/Doku-Step fuer persistenten Server-Index-Cache read-only.
- 0.2.30 ist ein Stop-/Inventory-/No-Code-Step nach fehlerhaftem und zurueckgesetztem 0.2.30-Versuch.
- 0.2.31 ist ein Source-/Modul-Inventar-No-Code-Step.
- Es gibt weiterhin keinen persistenten Server-Cache fuer Media-Daten im Runtime-Code.
- Media-System bleibt fachliches Modul; Agent/Sync/Cache bleiben Infrastruktur.
- Upload/Edit/Delete bleiben false.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- Keine neuen Runtime-Dateien ohne ausdrueckliche Forrest-Freigabe.
- OBS-Modul bleibt bei 0.2.22E geparkt.
```

## 0.2.31 Ergebnis

```text
- Echte 8080-/3010-relevante Dateien wurden gelesen.
- Datei-/Modulkarte wurde dokumentiert.
- Doppelte Media-Logik wurde markiert.
- Lokale 8080-Wahrheit und Server-3010-Wahrheit wurden getrennt.
- Keine Runtime-Dateien geaendert.
- Keine DB-Migration eingefuehrt.
- Keine neue Runtime-Datei erstellt.
- Kein Webserver-Deploy noetig.
```

## 8080 lokale Verantwortung

```text
backend/modules/local_remote_modboard_adapter.js
- lokale /api/remote/* Adapterroute
- lokale /api/remote/media/status Wahrheit
- liest htdocs/assets/* read-only
- blockiert Writes

backend/modules/remote_agent.js
- lokaler Agent /api/remote-agent/*
- scannt Media-Roots read-only
- sendet Media-Inventar per WSS Slow-Sync
- akzeptiert keine Actions
```

## 3010 Server/RDAP Verantwortung

```text
remote-modboard/backend/server.js
- Server-Entry und Agent-Runtime-Registrierung

remote-modboard/backend/src/app.js
- Express-App und Routenregistrierung

remote-modboard/backend/src/services/agent-runtime.service.js
- Agent-WSS Empfang/Sanitization/Memory-State
- Media-Inventar bleibt memory-only

remote-modboard/backend/src/routes/media-readonly.routes.js
- /api/remote/media/status im Serverprofil
- online liest aus agent-runtime memory-only
- syncInfo.serverPersistence=false
```

## Doppelte Media-Logik

```text
Media Roots/Extensions/Limits/Item-Schema existieren aktuell mehrfach:
- local_remote_modboard_adapter.js
- remote_agent.js
- agent-runtime.service.js
- media-readonly.routes.js

Risiko: Drift bei Root-Keys, Extensions, Limits, Sanitization und Response-Schema.
```

## Naechste Architekturentscheidung

```text
Persistenter Server-Index ist weiterhin sinnvoll, aber nur als spaeterer separater read-only Code-/Migration-Step nach ausdruecklichem Plan.
Keine neue Runtime-Datei als Standardloesung.
Vorhandene Dateien/Helper bevorzugen.
Kein voller bidirektionaler Datei-Sync ohne Permission, Confirm, Audit, Conflict-Handling und lokalen Agent-Apply-Mechanismus.
Lokal bleibt wichtigste Quelle, weil dort die produktiven Medien benutzt werden.
```

## 0.2.29 Plan-Ergebnis bleibt gueltig

```text
- Server darf spaeter hoechstens sanitisierten Metadaten-Index speichern.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Lokal bleibt Master.
- Agent reconnect soll spaeter Server-Index wieder auf aktuellen Stand bringen.
- Upload/Edit/Delete bleiben fuer separate spaetere Steps geparkt.
```

## Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev ueber Connector nur unvollstaendig oder abgeschnitten verfuegbar ist:
1. Assistant liefert zuerst ein Sammel-Script fuer die benoetigten Quell-Dateien.
2. Forrest fuehrt es lokal im Repo aus und laedt die Source-ZIP hoch.
3. Assistant baut daraus erst danach den echten Install-Step-ZIP mit echten Repo-Zielpfaden.
4. Source-ZIP ist niemals Install-ZIP.

Server-/API-Checks:
- Standardmaessig kurze `jq '{...}'` Ausgaben verwenden.
- Volles JSON nur bei Fehlerdiagnose oder ausdruecklicher Anforderung.
- Lokal unter Windows PowerShell `Invoke-RestMethod` statt jq verwenden.
```

## Sicherheitsgrenzen

```text
keine Media-Uploads
keine Media-Deletes
keine Media-Edits
keine DB-Migration ohne separaten Step
keine Shell-/Datei-/Prozess-Actions
keine absoluten Pfade in API/UI/DB
keine Datei-Inhalte im Server-Index
keine Secrets in Logs/Status/UI/Docs
keine neuen Runtime-Dateien ohne ausdrueckliche Forrest-Freigabe
```
