# Dashboard v2 Prototype

Stand: DASHUI4 / Minimaler React-Vite-Prototyp  
Datum: 2026-06-23

## Zweck

Dieser Ordner ist die neue Frontend-Quellcodebasis für das geplante Dashboard-v2.

Das bestehende Dashboard bleibt produktiv:

```text
htdocs/dashboard/
http://127.0.0.1:8080/dashboard
```

Dashboard-v2 wird parallel aufgebaut:

```text
frontend/dashboard-v2/
htdocs/dashboard-v2/
http://127.0.0.1:8080/dashboard-v2
```

## Was dieser Step enthält

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
- Platzhalter für zentrale Clients:
  - API
  - Auth
  - Permission
  - Lock
  - Agent

## Was dieser Step nicht enthält

- kein Login-System
- keine echten Permissions
- keine Schreibfunktionen
- keine produktiven Agent-Aktionen
- keine Sound-/OBS-/Overlay-/Media-Steuerung
- keine DB-Änderung
- keine Backend-Änderung
- keine Änderung am alten Dashboard

## Lokaler Start für Entwicklung

```powershell
cd D:\Git\stream-control-center\frontend\dashboard-v2
npm install
npm run dev
```

Danach:

```text
http://127.0.0.1:5173/dashboard-v2/
```

## Build für lokales Backend

```powershell
cd D:\Git\stream-control-center\frontend\dashboard-v2
npm run build
```

Der Build schreibt nach:

```text
htdocs/dashboard-v2/
```

Danach kann der lokale Server die Seite später unter diesem Pfad ausliefern, sofern statische Dateien unter `htdocs` wie bisher erreichbar sind.

## Wichtig

Der Build nach `htdocs/dashboard-v2/` ist vorbereitet, aber dieser Step erzeugt noch keinen Build-Output im ZIP. Dadurch wird das bestehende `htdocs/` nicht verändert.

Das alte Dashboard bleibt Fallback.
