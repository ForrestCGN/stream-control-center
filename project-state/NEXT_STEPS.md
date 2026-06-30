# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON`

## Ziel

Lokale Logs-read-only API als Skeleton bauen.

## Vorher pruefen

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/public/assets/modules/admin/audit-log.js
```

## Geplante Routen

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

## Regeln

```text
nur GET
read-only
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Admin-Notizen weiter ausbauen
keine UI-Aktivierung vor API-Test
```

## Erwarteter Skeleton

```text
Statusroute mit Sicherheitsflags
Listenroute mit leerer oder synthetischer sicherer Antwort
limit max 100
area/status/search vorbereitet
Offline-/nicht-erreichbar-Zustand sauber
/api/remote/routes erweitert
```

## Spaeterer moeglicher Folgeschritt

`RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE`

Nur wenn 0.2.120 Skeleton lokal und ggf. remote bestaetigt ist.
