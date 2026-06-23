# CURRENT STATUS

Stand: DASHUI4 / Minimaler React-Vite-Prototyp gebaut  
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

## Aktueller Dashboard-v2-Stand

Aktueller dokumentierter und gebauter Planungs-/Prototypstand:

```text
DASHUI4 / Minimaler React-Vite-Prototyp gebaut
```

Dieser Step erstellt erstmals Quellcode unter:

```text
frontend/dashboard-v2/
```

Enthalten:

- React + Vite Grundgerüst
- AppShell
- Sidebar
- Topbar
- PageHeader
- ModuleTabs
- CGN-Dark-/Neon-/Galaxy-Basisdesign
- Navigation-Registry
- Modul-Registry
- Beispielseite `Übersicht`
- Beispielseite `Remote Agent`
- Platzhalterseiten für geplante Module
- vorbereitete Service-Dateien ohne produktive Aktionen

## Nicht geändert

Durch DASHUI4 wurde nichts an der Runtime geändert:

- kein Backend-Code
- kein bestehendes lokales Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service
- kein lokaler Node-Neustart

## Aktuelle Architekturentscheidungen

- Altes Dashboard bleibt produktiv unter `http://127.0.0.1:8080/dashboard`.
- Dashboard-v2 entsteht parallel.
- Dashboard-v2-Quellcode liegt unter `frontend/dashboard-v2/`.
- Späterer Build-Output ist `htdocs/dashboard-v2/`.
- Module werden einzeln migriert.
- Jedes Modul startet zuerst read-only.
- Schreibfunktionen erst mit Permission, Lock, resourceVersion, Confirm und Audit.
- Remote-Modboard-Ziel bleibt `https://mods.forrestcgn.de`.

## Nächster sinnvoller Schritt

```text
DASHUI5 / Build- und lokaler Auslieferungsweg prüfen
```

Ziel:

- Abhängigkeiten installieren
- Vite-Build testen
- Build nach `htdocs/dashboard-v2/` prüfen
- lokalen Aufruf prüfen
- kein altes Dashboard ändern
- keine produktiven Aktionen
