# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.30 - Stop and Inventory No Code`.

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

## 0.2.30 Projektbremse

```text
0.2.30 ist bewusst ein Stop-/Inventory-/No-Code-Step.
Keine Runtime-Aenderung.
Keine neuen Runtime-Dateien.
Keine DB-Migration.
Keine Media-Persistenz gebaut.
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine Agent-Actions.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Kein Webserver-Deploy noetig.
```

Grund:

```text
Vor einem persistenten Media-Index muss zuerst die echte 8080-/3010-Verantwortung sauber inventarisiert werden.
Der fehlerhafte 0.2.30-Versuch wurde zurueckgesetzt.
Ab jetzt nicht aus Erinnerung bauen.
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
8. Neue Dateien sind fuer den naechsten Code-Step verboten, ausser Forrest genehmigt sie ausdruecklich nach Begruendung.
```

## Single UI / Dual Runtime Profile

```text
Remote-Modboard UI
├─ runtimeMode: local
│  ├─ gleiche UI
│  ├─ Daten direkt vom lokalen SCC/Agent
│  ├─ echte lokale Dateien/OBS/Sounds verfuegbar
│  └─ Cloud nicht erforderlich
│
└─ runtimeMode: online
   ├─ gleiche UI
   ├─ Daten vom Webserver
   ├─ Stream-PC-Daten nur ueber Agent-Sync/Memory-Cache
   └─ zentrale Auth/Rechte/Audit-Schicht
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

## Datenklassen

```text
A = realtimePush
    Kleine Live-Zustaende, sofort sichtbar, memory-only.

B = pullOnDemand
    Details/Listen nur bei Seitenaufruf, Filter, Reload oder Detailansicht.

C = slowSync
    Regelmaessig uebertragene Inventare/Statusdaten, nicht sekundengenau.
```

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
0.2.30: Stop and Inventory No Code; Projektbremse, kein Runtime-Code, keine neuen Dateien fuer Runtime.
```

## Lokal/Online

```text
Lokal: echte Media-Dateien liegen auf dem Stream-PC unter htdocs/assets/*.
Online: Webserver hat keinen direkten Zugriff auf lokale Stream-PC-Dateien.
Online-Media-Inventar kommt aktuell per Agent-WSS-Slow-Sync, memory-only.
Persistent Server Index Cache ist geplant, aber noch nicht gebaut.
Lokal bleibt Master/Wahrheit fuer echte Media-Dateien.
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

## Wichtigste Doku

```text
docs/current/RDAP_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD.md
docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md
project-state/FILES.md
```

## Naechster sinnvoller Step

```text
Nach 0.2.30: kein Code-Step starten, bevor eine echte Datei-/Modulkarte fuer 8080 und 3010 erstellt wurde.
Wenn Code spaeter kommt: maximal bestehende Media-/Agent-/DB-Dateien nutzen; neue Runtime-Datei nur mit ausdruecklicher Forrest-Freigabe.
Keine Upload/Delete/Edit-Writes ohne eigene spaetere Steps.
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
