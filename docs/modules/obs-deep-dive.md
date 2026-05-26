# OBS-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/obs.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Backend-API für OBS-Steuerung: Szenen, Quellen, Browser-Sources, Audio, Replay Buffer, Medienaktionen und Dashboard-Konfiguration.

## Datei

- `backend/modules/obs.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/api/obs/config` |
| `GET` | `/api/obs/settings` |
| `GET` | `/api/obs/routes` |
| `GET` | `/api/obs/integration-check` |
| `POST` | `/api/obs/reload` |
| `GET` | `/api/obs/status` |
| `GET/POST` | `/api/obs/dashboard/config` |
| `GET` | `/api/obs/stats` |
| `GET` | `/api/obs/scenes` |
| `POST` | `/api/obs/scene/switch` |
| `POST` | `/api/obs/scene/preview` |
| `GET` | `/api/obs/sources` |
| `GET` | `/api/obs/browser-sources` |
| `GET` | `/api/obs/scene-items` |
| `POST` | `/api/obs/source/show` |
| `POST` | `/api/obs/source/hide` |
| `POST` | `/api/obs/source/toggle` |
| `GET` | `/api/obs/audio/busy` |
| `GET` | `/api/obs/audio/state` |
| `POST` | `/api/obs/audio/mute` |
| `POST` | `/api/obs/audio/unmute` |
| `POST` | `/api/obs/audio/toggle` |
| `POST` | `/api/obs/audio/volume` |
| `POST` | `/api/obs/media/action` |
| `GET` | `/api/obs/replay/status` |
| `POST` | `/api/obs/replay/start` |
| `POST` | `/api/obs/replay/stop` |
| `POST` | `/api/obs/replay/save` |
| `GET` | `/api/obs/filter/list` |
| `POST` | `/api/obs/filter/enable` |
| `POST` | `/api/obs/filter/disable` |
| `POST` | `/api/obs/filter/toggle` |

## Erkannte Hauptfunktionen / interne Bereiche

- `resolveSceneName`
- `resolveInputName`
- `handleSceneItemVisibility`
- `handleFilter`
- `buildObsSettingsResponse`
- `buildObsIntegrationCheck`
- `init`
- `clampNumber`
- `boolValue`
- `sanitizeDashboardConfig`
- `loadDashboardConfig`
- `saveDashboardConfig`
- `setCommonHeaders`
- `ok`
- `fail`
- `body`
- `normalize`
- `normalizeLookup`
- `safeJsonParse`
- `obsRoutes`
- `getFileStatus`
- `buildObsRouteList`
- `buildObsConfigResponse`
- `buildObsCheck`

## Erkannte Datenbanktabellen

- Keine direkt erkannt.

## Wichtige Abhängigkeiten

- `obs_shared.js / OBS WebSocket Client`
- `OBS WebSocket Verbindung`
- `config/obs_dashboard.json bzw. Dashboard-Config`
- `Scene-/Source-Namen aus OBS`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Routen können produktive OBS-Szenen/Quellen schalten.`
- `Dashboard-Hauptseite soll normale Szenen ohne führenden Unterstrich anzeigen; Overlay-/Detailseiten dürfen _-Szenen anzeigen.`
- `Source-/Scene-Namen nie blind umbenennen.`

## Sinnvolle Tests

- `GET /api/obs/status`
- `GET /api/obs/scenes`
- `GET /api/obs/sources`
- `GET /api/obs/browser-sources`
- `GET /api/obs/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
