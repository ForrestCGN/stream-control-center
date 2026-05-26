# Obs Scene Control

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

OBS-/Scene-Control-Backend und Overlay-Datenbereitstellung.

## Betroffene Backend-Dateien

- `backend\modules\obs.js`
- `backend\modules\obs_shared.js`
- `backend\modules\scene_control.js`
- `backend\modules\overlay_data.js`

## Erkannte technische Merkmale

### `obs.js`

- Version: keine klare Versionskennung erkannt
- Größe: 39049 Bytes
- Merkmale: Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./obs_shared`
  - `fs`

- erkannte Routen/Hinweise:
  - `GET /api/obs/config`
  - `GET /api/obs/settings`
  - `GET /api/obs/routes`
  - `GET /api/obs/integration-check`
  - `POST /api/obs/reload`
  - `? /api/obs/status`
  - `? /api/obs/config`
  - `? /api/obs/settings`
  - `? /api/obs/routes`
  - `? /api/obs/integration-check`
  - `? /api/obs/reload`
  - `? /api/obs/dashboard/config`
  - `? /api/obs/stats`
  - `? /api/obs/scenes`
  - `? /api/obs/scene/switch`
  - `? /api/obs/scene/preview`
  - `? /api/obs/sources`
  - `? /api/obs/browser-sources`
  - `? /api/obs/scene-items`
  - `? /api/obs/source/show`
  - `? /api/obs/source/hide`
  - `? /api/obs/source/toggle`
  - `? /api/obs/audio/busy`
  - `? /api/obs/audio/state`
  - `? /api/obs/audio/mute`
  - `? /api/obs/audio/unmute`
  - `? /api/obs/audio/toggle`
  - `? /api/obs/audio/volume`
  - `? /api/obs/media/action`
  - `? /api/obs/replay/status`
  - ... plus 8 weitere erkannte Routenzeilen

### `obs_shared.js`

- Version: 1.0.0
- Größe: 19418 Bytes
- Merkmale: Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `child_process`
  - `fs`
  - `path`

### `scene_control.js`

- Version: 1.2.1
- Größe: 14225 Bytes
- Merkmale: Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_core`
  - `./obs_shared`
  - `fs`

- erkannte Routen/Hinweise:
  - `GET /api/scene/status`
  - `GET /api/scene/config`
  - `GET /api/scene/settings`
  - `GET /api/scene/routes`
  - `GET /api/scene/integration-check`
  - `POST /api/scene/reload`
  - `GET /api/scene/health`
  - `GET /api/scene/list`
  - `GET /api/scene/set`
  - `? /api/scene`
  - `? /api/scene/status`
  - `? /api/scene/config`
  - `? /api/scene/settings`
  - `? /api/scene/routes`
  - `? /api/scene/integration-check`
  - `? /api/scene/reload`
  - `? /api/scene/health`
  - `? /api/scene/list`
  - `? /api/scene/set`
  - `? /api/scene-control`
  - `? /api/scene_control`
  - `? /api/scenes`

### `overlay_data.js`

- Version: keine klare Versionskennung erkannt
- Größe: 1061 Bytes
- Merkmale: keine besonderen Marker automatisch erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `GET /api/overlay/start-data`
  - `? /api/overlay/start-data`

## Aktueller Doku-Status

- Erste strukturierte Moduldoku vorhanden.
- Vor Funktionsänderungen muss die echte Datei erneut vollständig aus GitHub/dev oder aus dem aktuellen Live-/ZIP-Stand geprüft werden.
- Keine Funktionalität wurde in diesem STEP geändert.

## Offene Punkte / spätere Prüfung

- Routen und Dashboard-Anbindung bei nächster echter Moduländerung erneut prüfen.
- Config-/DB-/Message-Nutzung genauer dokumentieren, sobald das Modul fachlich angefasst wird.
- Falls Versionskennung fehlt, später bewusst und ohne Funktionsänderung ergänzen.

## Tests bei späteren Änderungen

- `node --check` für jede geänderte JS-Datei.
- relevante `/api/.../status`- oder Modulrouten gezielt prüfen.
- Dashboard-/Overlay-Flows nur testen, wenn das Modul wirklich betroffen ist.
