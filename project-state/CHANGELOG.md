# CHANGELOG

## 0.2.120 - Local Logs Readonly API Skeleton Deploy Confirmed

- 0.2.120 serverseitig live bestaetigt.
- Getestet auf Webserver `127.0.0.1:3010`.
- Bestaetigte Routen:
  - `GET /api/remote/local/logs/status`
  - `GET /api/remote/local/logs/list`
  - `GET /api/remote/routes` mit `.localLogsReadonly`
- Bestaetigte Werte:
  - `statusApiVersion = rdap_local_logs120.v1`
  - `routeBuild = RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON`
  - `readOnly = true`
  - `writeEnabled = false`
  - `items = []`
  - `count = 0`
  - `maxLimit = 100`
  - `agentActionsEnabled = false`
  - `localControlActionsEnabled = false`
- Wichtige Klarstellung dokumentiert:
  - `3010` ist Remote-Modboard Backend auf dem Webserver.
  - `8080` ist lokaler Stream-PC / Dashboard / Agent beim Nutzer.
- Noch nicht erledigt:
  - lokale Logs-UI-Quelle `Lokal / Stream-PC` aktivieren.
  - echtes lokales Item-Aggregating.
  - lokales 8080-Dashboard separat anpassen.

## 0.2.120 - Local Logs Readonly API Skeleton

- Lokale Logs-read-only API als Skeleton gebaut.
- Neue Routen:
  - `GET /api/remote/local/logs/status`
  - `GET /api/remote/local/logs/list`
- Statusroute liefert Sicherheitsflags, Agent-Connection-Zustand und vorbereitete Bereiche.
- Listenroute liefert bewusst noch `items: []` und `count: 0`.
- `limit`, `area`, `status`, `search` vorbereitet; Limit hart auf 100 begrenzt.
- `/api/remote/routes` um lokale Logs erweitert.
- Keine UI-Aktivierung.
- Keine echten lokalen Log-Items.
- Keine Writes, keine Migration, keine Loeschung, keine Agent-Actions.

## 0.2.119 - Local Logs Readonly API Design

- Lokale Logs-read-only-API konkret designt.
- Bestehende Agent-/Runtime-/OBS-/Media-read-only Struktur geprueft.
- `/api/remote/agent/status` als read-only Design-Anker erkannt.
- Geplante lokale Logs-Routen festgelegt:
  - `GET /api/remote/local/logs/status`
  - `GET /api/remote/local/logs/list`
- Antwortformat fuer Status/List und Log-Items festgelegt.
- Offline-/nicht-erreichbar-Verhalten definiert.
- Sicherheitsgrenzen dokumentiert.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.

## 0.2.118 - Local Logs Source Plan

- Lokale Log-Quelle geplant.
- Erste sinnvolle Bereiche festgelegt.
- Bevorzugte Quelle: `127.0.0.1:8080` Dashboard/Agent.
- Read-only Schutzgrenzen dokumentiert.
- Folgeschritt fuer API-Design vorbereitet.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.

## 0.2.117 - Logs Clean Selector UI Deploy Confirmed

- 0.2.116E bestaetigt.
- Logs-Hauptansicht ist bereinigt.
- Retention-/Selbstbereinigungsinfos sind aus Logs entfernt.
- Log-Quelle und Log-Bereich bleiben als Auswahl sichtbar.
- Lokal / Stream-PC ist vorbereitet, aber noch ohne API.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.
