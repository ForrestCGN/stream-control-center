# Dashboard v2 React-Vite-Prototyp

Stand: 2026-06-23  
Status: DASHUI4 / Minimaler React-Vite-Prototyp  
Projekt: ForrestCGN / stream-control-center

## Zweck

Dieser Step legt die erste echte Quellcodebasis für Dashboard-v2 an.

Das neue Dashboard-v2 entsteht parallel zum bestehenden Dashboard.

Bestehendes Dashboard:

```text
htdocs/dashboard/
http://127.0.0.1:8080/dashboard
```

Neues Dashboard-v2:

```text
frontend/dashboard-v2/
späterer Build: htdocs/dashboard-v2/
späterer lokaler Aufruf: http://127.0.0.1:8080/dashboard-v2
```

## Enthalten

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
- Platzhalterseiten für spätere Module
- vorbereitete Service-Dateien:
  - `apiClient`
  - `authClient`
  - `permissionClient`
  - `lockClient`
  - `agentClient`

## Nicht enthalten

- kein Login-System
- keine echten Permissions
- keine Schreibfunktionen
- keine produktiven Agent-Aktionen
- keine Sound-Steuerung
- keine OBS-Steuerung
- keine Overlay-Steuerung
- keine Media-Schreiboperation
- keine DB-Änderung
- keine Backend-Änderung
- keine Änderung am alten Dashboard

## Verzeichnis

```text
frontend/dashboard-v2/
```

## Build-Ziel

Das spätere Build-Ziel ist vorbereitet:

```text
htdocs/dashboard-v2/
```

Der Step liefert aber keinen Build-Output mit, damit `htdocs/` nicht verändert wird.

## Entwicklung lokal starten

```powershell
cd D:\Git\stream-control-center\frontend\dashboard-v2
npm install
npm run dev
```

Danach im Browser:

```text
http://127.0.0.1:5173/dashboard-v2/
```

## Build später erstellen

```powershell
cd D:\Git\stream-control-center\frontend\dashboard-v2
npm run build
```

Dadurch wird später geschrieben nach:

```text
D:\Git\stream-control-center\htdocs\dashboard-v2
```

## Sicherheitsgrenzen

- Frontend enthält keine Secrets.
- Frontend entscheidet keine echten Rechte.
- Auth ist nur als Platzhalter vorbereitet.
- Permission-Client erlaubt aktuell nur Lesen.
- Schreibfunktionen sind bewusst nicht enthalten.
- Agent-Client enthält nur geplante Statusinformationen, keine echte Verbindung.

## Nächster sinnvoller Schritt

```text
DASHUI5 / Build- und lokaler Auslieferungsweg prüfen
```

Mögliche Ziele:

- `npm install`
- `npm run build`
- prüfen, ob `htdocs/dashboard-v2/` korrekt entsteht
- prüfen, ob lokaler Server die statischen Dateien ausliefert
- keine produktiven Aktionen
- kein altes Dashboard ändern
