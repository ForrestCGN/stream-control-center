# Modul-Doku: `stream_status`

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quelle: `backend/modules/stream_status.js`

## Zweck

`stream_status` ist die zentrale Live-/Streamsession-Schicht. Es bündelt die Frage, ob der Stream live ist, wie frisch der Status ist, welche Quelle genutzt wurde und welche Streamsession bzw. welcher Streamtag aktiv ist.

Das Modul soll perspektivisch alte Einzelprüfungen über Dateien wie `twitch_stream_raw.json` ersetzen oder ergänzen, ohne bestehende Module ungeprüft umzubauen.

## Hauptdatei

```text
backend/modules/stream_status.js
```

## Version / Meta

```text
module: stream_status
moduleVersion: 0.1.2
apiPrefix: /api/stream-status
```

## Exporte

```text
getCurrentStatus
refreshStatus
refreshStatusAsync
statusPayload
startAutoRefresh
init
```

## HTTP-Routen

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/stream-status/status` | vollständiger Modulstatus, ggf. mit Refresh |
| GET | `/api/stream-status/current` | aktueller gespeicherter Status ohne erzwungenen API-Refresh |
| GET | `/api/stream-status/refresh` | Status aktualisieren |
| POST | `/api/stream-status/refresh` | Status aktualisieren |
| GET | `/api/stream-status/sessions` | letzte Stream-Sessions listen |

## Wichtige Statusfelder

```text
ok
module
moduleVersion
live
statusKnown
stale
source
upstreamSource
lastCheckedAt
lastLiveAt
streamSessionId
streamDayId
sessionStatus
restartGraceUntil
autoRefreshEnabled
autoRefreshNextRunAt
lastError
lastApiError
```

## Datenquellen

Default-Dateien:

```text
htdocs/data/twitch_stream_raw.json
htdocs/data/twitch_live_data.json
```

Default-Twitch-API-URL:

```text
http://127.0.0.1:8080/api/twitch/stream?login={login}
```

Das Modul kann API-first arbeiten und bei Bedarf auf Dateien zurückfallen.

## Environment-/Config-Werte

Direkt aus `getConfig()` erkannt:

```text
TWITCH_BOT_CHANNEL
TWITCH_CHANNEL
TWITCH_BROADCASTER_LOGIN
STREAM_STATUS_FILES
STREAM_STATUS_STALE_MS
STREAM_STATUS_RESTART_GRACE_MS
STREAM_STATUS_TWITCH_API_ENABLED
STREAM_STATUS_TWITCH_API_URL
STREAM_STATUS_TWITCH_API_TIMEOUT_MS
STREAM_STATUS_API_FIRST
STREAM_STATUS_AUTO_REFRESH_ENABLED
STREAM_STATUS_AUTO_REFRESH_IDLE_MS
STREAM_STATUS_AUTO_REFRESH_ACTIVE_MS
STREAM_STATUS_CACHE_MAX_AGE_MS
```

## SQLite-Tabellen

### `stream_status_state`

```text
key TEXT PRIMARY KEY
value_json TEXT NOT NULL DEFAULT '{}'
updated_at TEXT NOT NULL
```

Nutzung: Speichert den aktuellen Status unter `key='current'`.

### `stream_status_sessions`

```text
id INTEGER PRIMARY KEY AUTOINCREMENT
stream_session_id TEXT NOT NULL UNIQUE
stream_day_id TEXT NOT NULL
broadcaster_login TEXT NOT NULL DEFAULT ''
status TEXT NOT NULL DEFAULT 'active'
stream_id TEXT NOT NULL DEFAULT ''
stream_started_at TEXT NOT NULL DEFAULT ''
first_seen_at TEXT NOT NULL
last_seen_at TEXT NOT NULL
ended_at TEXT NOT NULL DEFAULT ''
restart_grace_until TEXT NOT NULL DEFAULT ''
source TEXT NOT NULL DEFAULT ''
meta_json TEXT NOT NULL DEFAULT '{}'
```

Indizes:

```text
idx_stream_status_sessions_broadcaster_status ON stream_status_sessions(broadcaster_login, status, last_seen_at)
idx_stream_status_sessions_day ON stream_status_sessions(stream_day_id)
```

## Interne Hauptfunktionen

```text
getConfig
ensureSchema
readStoredStatus
writeStoredStatus
extractStatusFromPayload
readFileStatus
selectSourceStatus
buildTwitchApiUrl
requestJson
normalizeApiStatus
readTwitchApiStatus
selectSourceStatusAsync
makeSessionIds
getRecentSession
closeExpiredGraceSessions
updateSessionForStatus
buildStatusFromSource
persistRefreshedStatus
refreshStatus
refreshStatusAsync
getCurrentStatus
listSessions
statusPayload
startAutoRefresh
```

## Session-Logik

Das Modul unterscheidet:

```text
streamSessionId = konkrete Streamsession
streamDayId     = Streamtag/zusammengehöriger Streamtag
restartGraceUntil = Toleranzfenster für kurzen Neustart
```

Kurze Offline-/Reconnect-Phasen können über `STREAM_STATUS_RESTART_GRACE_MS` demselben Streamtag zugeordnet werden.

## Abhängigkeiten

```text
fs
path
http
https
helper_core
helper_config
backend/core/database.js
Twitch-Modul/API-Route /api/twitch/stream
```

## Bekannte Risiken / Regeln

- Twitch kann verzögert Live/Offline melden; das Modul reduziert das Problem, löst es aber nicht vollständig.
- Sessiondaten sind SQLite-relevant, daher keine DB-Dateien ersetzen.
- Neue Module sollen den zentralen Status nutzen, aber bestehende Flows nur bewusst migrieren.
- Dateiquellen können stale sein; `statusKnown` und `stale` beachten.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | Select-Object ok,module,moduleVersion,live,statusKnown,stale,source,streamSessionId,streamDayId,lastError
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/current" | Select-Object ok,live,statusKnown,stale,source,streamSessionId,streamDayId
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/refresh" | Select-Object ok,live,statusKnown,source,lastError
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/sessions" | ConvertTo-Json -Depth 5
```

## Offene Punkte

- Prüfen, welche Module noch eigene Live-Dateien lesen.
- Schrittweise Migration auf `stream_status` dokumentieren.
- Dashboard-/Diagnoseanzeige für Sessions später verbessern.
