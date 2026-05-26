# Scene-Control-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/scene_control.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Schlankere Szenensteuerung/Streamdeck-ähnliche API für definierte Szenenlisten, Status, Health und Set-Aktionen.

## Datei

- `backend/modules/scene_control.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/api/scene/status` |
| `GET` | `/api/scene/config` |
| `GET` | `/api/scene/settings` |
| `GET` | `/api/scene/routes` |
| `GET` | `/api/scene/integration-check` |
| `POST` | `/api/scene/reload` |
| `GET` | `/api/scene/health` |
| `GET` | `/api/scene/list` |
| `GET` | `/api/scene/set` |

## Erkannte Hauptfunktionen / interne Bereiche

- `getSceneMeta`
- `buildStatusPayload`
- `buildIntegrationCheck`
- `init`
- `ok`
- `fail`
- `normalizeInput`
- `normalizeLookup`
- `bodyOrQuery`
- `buildChatListMessage`
- `checkFile`
- `safeReadJson`
- `summarizeSceneConfig`
- `publicState`
- `buildRoutes`
- `buildCheck`

## Erkannte Datenbanktabellen

- Keine direkt erkannt.

## Wichtige Abhängigkeiten

- `OBS-Modul/OBS WebSocket`
- `Scene-Control-Konfiguration`
- `helper_routes`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `GET /api/scene/set ist eine ausführende Route; Tests nur bewusst mit Zielszene.`
- `Kann sich mit obs.js-Funktionen überschneiden; keine Parallel-Logik ohne Abgleich bauen.`

## Sinnvolle Tests

- `GET /api/scene/status`
- `GET /api/scene/list`
- `GET /api/scene/health`
- `GET /api/scene/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
