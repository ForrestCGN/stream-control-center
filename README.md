# Stream Control Center

Lokale Steuerungs-, Dashboard- und Overlay-Plattform fuer den ForrestCGN-Stream.
Das Projekt verbindet unter anderem Twitch, Discord, OBS, TTS, WebSockets,
Browser-Overlays und persistente Zustandsdaten.

## Komponenten

- `backend/`: lokaler Express-/WebSocket-Server mit modularen Integrationen
- `htdocs/`: klassisches Dashboard, OBS-Overlays und statische Assets
- `frontend/dashboard-v2/`: neues React-/Vite-Dashboard
- `remote-modboard/backend/`: separates Remote-Modboard-Backend
- `remote-modboard/stream-pc-agent/`: eingeschraenkter Heartbeat-Agent
- `config/`: eingecheckte, nicht geheime Konfiguration
- `db/`: Datenbankschema und Migrationen
- `project-state/`: aktueller Arbeitsstand, TODOs und Historie

Das Remote-Modboard und der Stream-PC-Agent befinden sich in einem bewusst
eingeschraenkten Ausbauzustand. Produktive Schreib- oder Steuerfunktionen duerfen
nicht allein aufgrund vorhandener Route- oder Service-Dateien als aktiv angenommen
werden.

## Voraussetzungen

- Windows mit PowerShell
- aktuelle Node.js-LTS-Version inklusive npm
- lokale Zugangsdaten nur fuer die Integrationen, die wirklich verwendet werden
- optional OBS Studio mit obs-websocket, Twitch-/Discord-Zugang und Datenbankdienste

## Installation

Im Repository-Stammverzeichnis:

```powershell
npm ci
npm --prefix frontend/dashboard-v2 ci
npm --prefix remote-modboard/backend install
```

Der Stream-PC-Agent besitzt derzeit keine externen npm-Abhaengigkeiten.

## Lokale Konfiguration

Der Hauptserver verwendet `STREAM_ASSETS_ROOT` als Projektwurzel. Ohne diese
Variable greift er aus Kompatibilitaetsgruenden auf
`D:\Streaming\stramAssets` zurueck. Beim Start direkt aus diesem Repository muss
die Variable deshalb vor dem Node-Prozess gesetzt werden:

```powershell
$env:STREAM_ASSETS_ROOT = (Get-Location).Path
```

Eine lokale `.env` kann aus dem Beispiel erstellt werden:

```powershell
Copy-Item .\config\secrets\.env.example .\.env
```

Platzhalter wie `CHANGE_ME` muessen lokal ersetzt oder unbenutzte Integrationen
deaktiviert bleiben. Echte Secrets, Tokens, Passwoerter und lokale `.env`-Dateien
duerfen nicht committed werden.

Der Hauptserver verwendet standardmaessig Port `8080`. Fuer einen abweichenden
lokalen Port kann `PORT` in der `.env` oder vor dem Start gesetzt werden.

## Hauptserver starten

```powershell
$env:STREAM_ASSETS_ROOT = (Get-Location).Path
npm start
```

Danach sind die wichtigsten lokalen Ziele erreichbar:

- Status: `http://127.0.0.1:8080/api/_status`
- klassisches Dashboard: `http://127.0.0.1:8080/dashboard/`
- Dashboard v2: `http://127.0.0.1:8080/dashboard-v2/`

## Tests

Der zentrale Test prueft die JavaScript-Syntax des Haupt-Backends, des
Remote-Backends und des Stream-PC-Agenten. Anschliessend startet er den
Hauptserver kurz mit einer temporaeren Root ohne Module auf einem freien
Zufallsport und prueft `/api/_status`:

```powershell
npm test
```

Die Teilpruefungen koennen einzeln ausgefuehrt werden:

```powershell
npm run check:backend
npm run check:remote
npm run check:agent
```

Die Syntaxchecks starten keine Dienste. Der Smoke-Test verwendet ausschliesslich
eine temporaere Verzeichnisstruktur, laedt keine Module und fuehrt keine
Datenbank- oder Remote-Writes aus. Port `8080` und ein bereits laufendes Backend
bleiben unberuehrt. Die Tests ersetzen noch keine vollstaendige Integrations- oder
Laufzeit-Test-Suite.

## Dashboard v2

Entwicklungsserver:

```powershell
npm --prefix frontend/dashboard-v2 run dev
```

Produktions-Build nach `htdocs/dashboard-v2/`:

```powershell
npm --prefix frontend/dashboard-v2 run build
```

## Remote-Modboard

Das Remote-Backend startet standardmaessig lokal auf `127.0.0.1:3010`:

```powershell
npm --prefix remote-modboard/backend start
```

Vor einem Lauf muessen die benoetigten Werte aus
`remote-modboard/backend/.env.example` lokal und sicher konfiguriert werden.
Weitere Sicherheits- und Statushinweise stehen in
`remote-modboard/backend/README.md` und
`remote-modboard/stream-pc-agent/README.md`.

## Aktueller Projektstand

Der kanonische Arbeitsstand liegt in:

- `project-state/CURRENT_STATUS.md`
- `project-state/TODO.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`

Vor Aenderungen an Remote-Writes, Authentifizierung, OBS-Steuerung oder
Produktivsystemen immer die aktuellen Sicherheits- und Freigaberegeln in
`docs/current/` pruefen.
