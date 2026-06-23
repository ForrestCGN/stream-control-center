# CURRENT STATUS

Stand: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert  
Datum: 2026-06-23

## Aktueller Runtime-Stand

Der bestätigte Runtime-Stand bleibt unverändert.

Central Event Overlay:

- `htdocs/overlays/central_event_overlay.html`
- Version `0.1.3`
- Step `HT4.3`
- HypeTrain Start, Level-Up, Ende und Rekord wurden sichtbar getestet.
- Overlay ist am Communication Bus verbunden.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## Aktueller Remote-/Dashboard-v2-Planungsstand

Aktueller dokumentierter Planungsstand:

```text
DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert
```

Dieser Step dokumentiert:

- altes Dashboard bleibt produktiv unter `http://127.0.0.1:8080/dashboard`
- neues Dashboard-v2 entsteht parallel unter `http://127.0.0.1:8080/dashboard-v2`
- kein Big-Bang-Umbau
- keine blinde Ersetzung von `htdocs/dashboard/`
- Migration erfolgt Modul für Modul
- jedes Modul startet in v2 zuerst read-only
- Schreibfunktionen erst mit Permission, Lock, resourceVersion, Confirm und Audit
- Login wird gestuft eingeführt
- Remote-Modboard bleibt Ziel unter `https://mods.forrestcgn.de`

## Nicht geändert

Durch DASHUI3.DOC1 wurde nichts an der Runtime geändert:

- kein Backend-Code
- kein bestehendes lokales Dashboard
- kein Frontend-Code
- kein React-/Vite-Projekt
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service
- kein lokaler Node-Neustart

## Aktuelle Architekturentscheidungen

- Webserver ist langfristig öffentliche Dashboard-/Modboard-Zentrale.
- Stream-PC-Agent wird sichere Brücke zum lokalen System.
- Stream-PC bleibt produktive Runtime / Ausführer.
- Lokales Backend bleibt produktiv auf `127.0.0.1:8080`.
- Agent wird als separater Node-Prozess geplant.
- Login, User, Rollen, Permissions und Modulfreigaben werden führend auf dem Webserver verwaltet.
- Agent offline: Login/Lesen möglich, produktive Bearbeitung/Aktionen gesperrt.
- Keine Offline-Queue.
- Texte und Configs bleiben produktiv führend auf dem Stream-PC.
- Produktive SQLite bleibt unangetastet.

## Nächster sinnvoller Schritt

```text
DASHUI4 / Minimaler React-Vite-Prototyp
```

DASHUI4 soll erst nach explizitem `go` gebaut werden.

Ziel:

- `frontend/dashboard-v2/` Grundgerüst
- React + Vite
- AppShell
- Sidebar
- Topbar
- PageHeader
- ModuleTabs
- Beispielseite `Remote Agent`
- Beispielseite `Übersicht`
- zentrale Styles/Tokens
- keine produktive Modulmigration
- keine Schreibfunktion
- kein Login-Zwang
- kein altes Dashboard ändern
