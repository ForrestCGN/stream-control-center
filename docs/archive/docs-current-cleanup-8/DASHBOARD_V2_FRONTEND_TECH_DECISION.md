# Dashboard v2 Frontend-Tech-Entscheidung

Stand: 2026-06-23  
Status: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert  
Projekt: ForrestCGN / stream-control-center

## Zweck

Diese Datei konkretisiert die technische Frontend-Richtung fuer Dashboard-v2 und das spaetere Remote-Modboard.

Wichtig: Dieser Step ist ein reiner Planungs-/Doku-Step.

Nicht geaendert durch diesen Step:

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

## Entscheidung

Dashboard-v2 wird als neue Frontend-Linie mit folgender Richtung geplant:

```text
React + Vite
```

React ist dabei ausschliesslich Frontend im Browser. Sicherheitsentscheidungen liegen nie im Frontend.

Feste Regeln:

- keine Secrets ins Frontend
- keine Tokens im Frontend-Code
- keine echten Rechteentscheidungen im Frontend
- keine produktive Aktion nur aufgrund versteckter Buttons verhindern
- Backend prueft Login, Rollen, Permissions und Modulfreigaben
- Agent prueft lokal zusaetzlich Allowlist und Payload
- Frontend zeigt nur an, was erlaubt ist, ist aber nicht die Sicherheitsgrenze

## Warum React + Vite

React + Vite passt fuer dieses Projekt, weil Dashboard-v2 viele wiederkehrende UI- und Zustandsmuster braucht:

- Module mit eigenen Tabs
- Live-Status per WebSocket
- Remote-Agent-Status
- Edit-Sessions und Locks
- Rollen-/Permission-gesteuerte Bedienung
- Tabellen, Filter, Pagination
- Modals, Toasts, Confirm-Dialoge
- Media-/Text-/Config-Editoren
- spaetere Erweiterung und Umstrukturierung

Vite ist fuer den spaeteren Build pragmatisch, weil der gebaute statische Output sauber nach `htdocs/dashboard-v2/` gelegt werden kann.

## Nicht verwenden / nicht uebernehmen

Creative Tim / Vision UI bleiben Inspiration, aber keine Codebasis.

Nicht uebernehmen:

- keine Creative-Tim-Templates
- kein Vision-UI-Code
- keine Template-Lizenzstruktur
- keine Demo-Business-Inhalte wie Sales, Orders, Billing
- keine Chakra-/MUI-Struktur erzwingen
- keine Abhaengigkeit, nur weil ein Template sie nutzt

Uebernehmen nur als Design-Idee:

- dunkle Dashboard-Anmutung
- Glassmorphism
- Kartenaufbau
- Tabellen-/Timeline-/Chip-Muster
- ruhige Dashboard-Komponenten

## Build- und Deploy-Ziel

Geplantes Frontend-Projekt im Repo:

```text
frontend/dashboard-v2/
```

Geplanter Build-Output fuer das lokale System:

```text
htdocs/dashboard-v2/
```

Das bedeutet:

- Quellcode liegt getrennt unter `frontend/dashboard-v2/`
- gebauter statischer Output liegt unter `htdocs/dashboard-v2/`
- das bestehende Dashboard unter `htdocs/dashboard/` wird nicht blind ersetzt
- eine Migration alter Module passiert nur Schritt fuer Schritt nach separatem `go`

## Lokale und Remote-Nutzung

Dashboard-v2 soll langfristig beide Zielwelten bedienen:

```text
lokal:  http://127.0.0.1:8080/dashboard-v2/
remote: https://mods.forrestcgn.de
```

Dabei gilt:

- lokales Dashboard-v2 spricht spaeter das lokale Backend bzw. lokale APIs an
- Remote-Modboard spricht den Webserver an
- produktive Stream-PC-Aktionen laufen spaeter nur ueber den Agent-Weg
- kein direkter Browserzugriff vom Remote-Modboard auf `127.0.0.1:8080` des Stream-PCs

## API-, WebSocket-, Auth- und Lock-Trennung

Frontend-Clients sollen klar getrennt werden.

Geplante Client-Schichten:

```text
apiClient        normale HTTP/API-Aufrufe
wsClient         WebSocket-Verbindung und Bus-/Live-Events
authClient       Login-/Session-/User-Kontext
permissionClient Rechte-/Modulfreigaben fuer UI-Anzeige
lockClient       Edit-Session-/Lock-Handling
agentClient      Remote-Agent-Status und spaeter Agent-Requests
```

Wichtig:

- UI-Komponenten rufen nicht wild direkt `fetch()` auf
- Module nutzen zentrale Clients/Services
- Locks werden nicht pro Modul neu erfunden
- WebSocket-Verbindungen werden nicht pro Widget doppelt aufgebaut
- Permission-Namen bleiben kompatibel mit RDAP4

## Modul-Registry

Dashboard-v2 soll Module nicht hart in Sidebar, Router und Komponenten verteilen.

Geplante Modul-Definition:

```js
export default {
  id: "shot_alarm",
  label: "Shot-Alarm",
  category: "actions",
  route: "/actions/shot-alarm",
  permission: "shot_alarm.view",
  tabs: [
    { id: "overview", label: "Uebersicht", permission: "shot_alarm.view" },
    { id: "history", label: "Verlauf", permission: "shot_alarm.view" },
    { id: "stats", label: "Statistik", permission: "shot_alarm.view" },
    { id: "texts", label: "Texte", permission: "shot_alarm.texts" },
    { id: "settings", label: "Einstellungen", permission: "shot_alarm.config" }
  ]
};
```

Ziel:

- Modul verschieben, ohne Sidebar-Code gross umzubauen
- Modul deaktivieren oder verstecken
- Tabs pro Modul definieren
- Permissions pro Modul und Tab setzen
- spaeter Remote-/Lokal-Unterschiede sauber abbilden

## Navigation-Registry

Sidebar-Regel bleibt:

```text
Hauptkategorie -> Modul
```

Keine dritte Sidebar-Ebene.

Tabs und Unterseiten liegen innerhalb der Modulseite.

Geplante Hauptbereiche:

```text
Live
Community / Events
Loyalty
Media
Overlays
Aktionen
Admin
```

Beispiele:

```text
Community / Events -> Stream-Events
Community / Events -> Shot-Alarm
Live -> Remote Agent
Admin -> Benutzer & Rechte
Admin -> Locks
Admin -> Audit
```

## Topbar-Regel

Die Topbar zeigt Standort und aktiven Tab in diesem Muster:

```text
Hauptbereich
Modul • aktiver Tab
```

## Eigenes CGN-Komponentensystem

Dashboard-v2 soll ein eigenes, kleines CGN-Komponentensystem bekommen.

Geplante Basis-Komponenten:

```text
CgnAppShell
CgnTopbar
CgnSidebar
CgnPageHeader
CgnModuleTabs
CgnCard
CgnStatCard
CgnButton
CgnChip
CgnTable
CgnPagination
CgnTimeline
CgnModal
CgnConfirmDialog
CgnToast
CgnSwitch
CgnAvatar
CgnProgress
CgnEmptyState
CgnErrorState
CgnPermissionGate
CgnLockBanner
```

Regel:

- Komponenten sind wiederverwendbar
- kein Modul baut eigene Grundbuttons/Karten/Toasts ohne Grund
- CGN-Farben, Abstaende, Radien und Glow liegen zentral in Tokens

## CSS-/JS-Strategie

Ziel ist nicht, CSS und JS komplett loszuwerden. Das ist bei einem modernen Dashboard unrealistisch.

Ziel ist:

- weniger verstreute Einzeldateien
- klarere Zuständigkeiten
- wiederverwendbare Komponenten
- zentrale Theme-/Token-Dateien
- Module statt wild verteilter Script-Logik
- Build-Prozess statt manuell zusammenkopierter Einzelscripte

Geplante CSS-Struktur:

```text
src/styles/tokens.css
src/styles/theme.css
src/styles/layout.css
src/styles/components.css
```

Spaeter optional:

- CSS Modules fuer Komponenten
- keine Entscheidung fuer Tailwind ohne separaten Step
- kein CSS-Framework-Zwang

## Sicherheitsgrenzen

Frontend darf nur Komfort und Darstellung machen.

Frontend darf:

- Buttons anhand Permissions ausblenden
- Warnungen anzeigen
- Lock-Status darstellen
- Eingaben vorvalidieren
- Confirm-Dialoge zeigen

Frontend darf nicht:

- Actions ohne Backend-Permission absichern
- Secrets enthalten
- Agent-Secret kennen
- produktive Aktionen nur per verstecktem Button schuetzen
- Rollen selbst entscheiden
- Locks nur lokal im Browser halten

## Geplante Struktur fuer spaeteren Prototyp

Erst in DASHUI3, nicht in diesem Step:

```text
frontend/dashboard-v2/
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    app/
      App.jsx
      router.jsx
      moduleRegistry.js
      navigationRegistry.js
    layout/
      AppShell.jsx
      Topbar.jsx
      Sidebar.jsx
      PageHeader.jsx
      ModuleTabs.jsx
    components/
      CgnCard.jsx
      CgnButton.jsx
      CgnChip.jsx
      CgnToast.jsx
      CgnLockBanner.jsx
    services/
      apiClient.js
      wsClient.js
      authClient.js
      permissionClient.js
      lockClient.js
      agentClient.js
    modules/
      overview/
      agent/
      admin/
    styles/
      tokens.css
      theme.css
      layout.css
      components.css
```

## DASHUI3 erst nach Freigabe

DASHUI3 darf erst nach separatem `go` gebaut werden.

DASHUI3 soll maximal ein technischer Minimal-Prototyp sein:

- React + Vite Grundgeruest
- AppShell
- Topbar
- Sidebar
- PageHeader
- ModuleTabs
- eine Beispielseite, bevorzugt `Remote Agent`
- noch keine produktive Modulmigration
- noch keine alten Dashboard-Dateien umbauen
- noch keine produktiven Actions
- noch keine Secrets

## Offene Punkte fuer spaeter

- genaue Package-Abhaengigkeiten fuer React/Vite festlegen
- Build-Script fuer `htdocs/dashboard-v2/` planen
- Entwicklungsmodus lokal planen
- Webserver-Deploy fuer Remote-Modboard planen
- Auth-Fluss fuer Remote-Modboard separat planen
- API-Basis-URLs fuer lokal/remote sauber konfigurieren
- CSP/Security-Headers fuer Remote-Modboard planen
- Barrierefreiheit und Tastaturbedienung nachziehen

## StepDone-Vorschlag

```powershell
.\stepdone.cmd "DASHUI2 Frontend-Tech-Entscheidung dokumentiert: React+Vite als bevorzugte Richtung, Build nach htdocs/dashboard-v2, lokale/remote Nutzung, Module-/Navigation-Registry, CGN-Komponenten, Client-Trennung und Sicherheitsgrenzen geplant; kein Code und kein Node-Neustart nötig"
```
