# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.33 - UI i18n Media Labels Fix Plan`.

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

## 0.2.33 Status

```text
0.2.33 ist ein kleiner UI-/i18n-Fix.
Media-Translation-Keys wurden in zentrale Sprachdateien eingetragen.
Media-Modulregistrierung nutzt zentrale label/title/description/tab Keys mit Fallbacks.
Keine Backend-Routen-Aenderung.
Keine DB-Migration.
Keine Media-Persistenz.
Keine Agent-Aenderung.
Keine Uploads, Deletes oder Edits.
Keine neue Runtime-Datei.
Webserver-Deploy ist nach Einspielen/Commit sinnvoll, weil Public-Assets betroffen sind.
```

Die verbindliche Step-Doku liegt hier:

```text
docs/current/RDAP_0.2.33_UI_I18N_MEDIA_LABELS_FIX_PLAN.md
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
- D:\Streaming\stramAssets\data\sqlitepp.sqlite
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

## Bestaetigter aktueller Fokus

```text
OBS ist bei 0.2.22E geparkt.
0.2.24: Media-Foundation read-only.
0.2.25: lokales Media-Inventar read-only aktiv.
0.2.26: Architekturstandard fuer Runtime-Profile, fachliche Module, Sync-Klassen und Rechte dokumentiert.
0.2.27: Media Agent Slow Sync read-only gebaut.
0.2.27B: Media-WSS-Payload kompakt gemacht, damit kein 64-bit WebSocket-Frame-Abbruch entsteht.
0.2.28: Media-Slow-Sync Status/UI polish read-only; kein DB-Cache, keine Persistenz.
0.2.29: Persistent Media Index Cache read-only geplant; weiterhin kein Runtime-Code, keine DB-Migration, keine Writes.
0.2.30: Stop and Inventory No Code; Projektbremse, kein Runtime-Code, keine neuen Runtime-Dateien.
0.2.31: Media 8080/3010 File Module Inventory No Code; echte Datei-/Modulkarte dokumentiert, kein Runtime-Code.
0.2.32: Persistent Index Foundation Plan No Code; Plan plus UI/i18n-Befund dokumentiert, kein Runtime-Code.
0.2.33: UI/i18n Media Labels Fix; sichtbare rohe Media-Keys beseitigt.
```

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
- localRuntime-Pfad existiert in Server-Route, ist aber nicht lokale 8080-Wahrheit
```

## 0.2.33 UI-/i18n-Ergebnis

```text
Rohe Keys sollten nicht mehr sichtbar sein:
- module.media.label
- page.media.library.title
- page.media.library.label

Betroffen war UI/i18n, nicht Media-Persistenz.
```

## Sicherheitsgrenzen

```text
Keine Media-Uploads.
Keine Media-Deletes.
Keine Media-Edits.
Keine DB-Migration ohne separaten Step.
Keine Agent-Actions ohne separaten Step.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade in API/UI/DB.
Keine Datei-Inhalte im Server-Index.
Keine Secrets in Logs/Status/UI/Docs.
Keine neuen Runtime-Dateien ohne ausdrueckliche Genehmigung.
```

## Naechster sinnvoller Step

```text
Nach 0.2.33 zuerst testen, ob Online-Modboard und lokales Dashboard keine rohen Media-i18n-Keys mehr zeigen.
Danach Persistent Index Migration/Foundation nur nach gesondertem Go.
```

Nur bauen, nachdem GitHub/dev gelesen wurde und ein Plan bestaetigt ist.

## Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev ueber Connector abgeschnitten/unvollstaendig ist:
- erst Source-Sammel-Script liefern
- Source-ZIP vom Nutzer abwarten
- daraus echten Install-Step-ZIP mit Zielpfaden bauen

Check-Ausgaben kurz halten:
- Webserver: curl + jq mit ausgewaehlten Feldern
- Windows lokal: Invoke-RestMethod + pscustomobject
- volles JSON nur bei Fehlerdiagnose
```
