# CAN-44.12 Live-Status Monitor + Logging

## Ziel

Dieser Stand ergänzt eine Diagnose- und Beobachtungsbasis für den zentralen Live-Status. Es wird noch nicht die Projektlogik aller Module umgestellt. Ziel ist, mehrere Tage sichtbar zu loggen, welche Quelle welchen Live-Status liefert.

## Neue Backend-Datei

- `backend/modules/live_status_monitor.js`

Neue Routen:

- `GET /api/live-status-monitor/status`
  - Fragt alle Live-Quellen ab und gibt eine zusammengefasste Auswertung zurück.
  - Mit `?log=1` wird die Messung gespeichert.
- `POST /api/live-status-monitor/test`
  - Fragt alle Live-Quellen ab und speichert die Messung.
- `GET /api/live-status-monitor/logs?limit=150`
  - Gibt die letzten Messungen aus.
- `GET /api/live-status-monitor/routes`
  - Listet die Routen.

## Neue Dashboard-Dateien

- `htdocs/dashboard/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.css`
- `htdocs/dashboard/index.html` lädt die neue CSS/JS und enthält ein Panel.

Die Seite wird im Admin-Bereich als `Live-Status` sichtbar.

## Beobachtete Quellen

Der Monitor fragt ab:

- OBS Status: `/api/obs/status`
- Twitch User: `/api/twitch/user?login=forrestcgn`
- Twitch Channel: `/api/twitch/channel?id=...`
- Twitch Stream Debug: `/api/twitch/stream?login=forrestcgn&debug=1`
- Twitch Stream Summary Debug: `/api/twitch/stream/summary?login=forrestcgn&debug=1`
- Stream Status: `/api/stream-status/status?forceApi=1`
- EventSub Status: `/api/twitch/eventsub/status?refresh=1`

## Auswertung

Der Monitor berechnet eine Diagnose-Entscheidung:

- `effectiveLive`
- `obsStreaming`
- `eventSubLive`
- `twitchStreamsLive`
- `twitchSearchLive`
- `streamStatusLive`
- `confidence`
- `sourceSummary`
- `warnings`

Noch keine Modul-Umstellung: Module wie AutoShouti, Rotator usw. nutzen weiterhin ihren bisherigen Stand. CAN-44.13 soll später die zentrale `effectiveLive`-Logik in `stream_status` übernehmen.

## Logging

Es wird automatisch geloggt, wenn das Modul geladen ist.

Standardwerte:

- `LIVE_STATUS_MONITOR_AUTO_LOG_ENABLED=true`
- `LIVE_STATUS_MONITOR_AUTO_LOG_INTERVAL_MS=60000`
- `LIVE_STATUS_MONITOR_LOG_RETENTION_DAYS=7`

Die Tabelle heißt:

- `live_status_monitor_log`

Alte Einträge werden anhand der Retention gelöscht.

## Tests

Nach dem Einspielen:

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\live_status_monitor.js
.\stepdone.cmd "CAN-44.12 Live-Status Monitor"
```

Node neu starten und dann testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/live-status-monitor/status?log=1" |
  ConvertTo-Json -Depth 12
```

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/live-status-monitor/test" |
  ConvertTo-Json -Depth 12
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/live-status-monitor/logs?limit=20" |
  ConvertTo-Json -Depth 8
```

## Rollback

- `backend/modules/live_status_monitor.js` entfernen
- `htdocs/dashboard/modules/live_status_monitor.js` entfernen
- `htdocs/dashboard/modules/live_status_monitor.css` entfernen
- In `htdocs/dashboard/index.html` die drei neuen Referenzen/Panel entfernen

Die DB-Tabelle kann bleiben. Sie wird von keinem anderen Modul genutzt.
