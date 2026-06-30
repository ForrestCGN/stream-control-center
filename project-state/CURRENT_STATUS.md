# CURRENT_STATUS

Aktueller Stand: `0.2.120 - Local Logs Readonly API Skeleton`

## Kurzfazit

Lokale Logs-read-only-API ist als Skeleton gebaut.

```text
Admin -> Logs
```

Die Logs-Hauptansicht bleibt sauber und bestaetigt.

## Aktueller Logs-Stand

```text
Remote-Modboard aktiv
Lokal / Stream-PC API-Skeleton vorhanden, UI noch nicht aktiviert
```

## 0.2.120 Ergebnis

```text
GET /api/remote/local/logs/status gebaut
GET /api/remote/local/logs/list gebaut
Statusroute mit Sicherheitsflags
Listenroute mit leerer Skeleton-Antwort
limit max 100
area/status/search vorbereitet
Offline-/nicht-erreichbar-Zustand sauber
/api/remote/routes erweitert
```

## Wichtig

```text
read-only
keine echten lokalen Log-Items aggregiert
keine UI aktiviert
keine Writes
keine Loeschung
keine Migration
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
```

## Neue Routen

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

## Deploy-Regel

Bei Code-/Remote-Modboard-Aenderungen nach lokalem stepdone/GitHub-dev:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON dev
```
