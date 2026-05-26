# STEP465_SHOUTOUT_OFFICIAL_LIVE_GATE

## Ziel

Offizielle Twitch-`/shoutout`-Versuche sollen offline nicht mehr hart gegen Twitch gesendet werden.

## Betroffene Dateien

```text
backend/modules/clip_shoutout.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Änderungen

- Runtime-Version `clip_shoutout` auf `0.2.8` erhöht.
- `officialShoutout.liveGateEnabled` ergänzt.
- `officialShoutout.liveGateRetryMs` ergänzt.
- Offizielle Queue prüft vor dem Twitch-API-Call lokale Live-State-Dateien.
- Offline-Fall setzt den Queue-Eintrag auf `waiting` mit `last_error=waiting_stream_live_offline`.
- Offline-Fall erhöht keine Attempts und erzeugt keinen fehlgeschlagenen Twitch-API-Versuch.
- `officialQueueStatus` gibt Live-Gate-Diagnose aus.
- Twitch-Fehler `not streaming live / no viewers` wartet nun mindestens 120 Sekunden bis zum nächsten Versuch.

## Bewusst nicht geändert

- `!vso` bleibt Testcommand.
- Keine Umstellung auf `!so`.
- Keine Dashboard-Änderung.
- Keine Sound-System-Änderung.
- Keine EventBus-Umstellung.
- Keine neuen Chatmeldungen für offizielle Twitch-Shoutouts.
- Display-Queue und Streamtag-Limit bleiben unverändert.

## Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command,officialChatMessagesMuted

$q = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
$q.officialQueue.liveGate
$q.officialQueue.queue | Select-Object id,target_login,status,available_at,attempts,last_error
```

Offline-Test:

```text
!vso @urlug
```

Erwartung:

- Display-Shouti läuft.
- Offizieller Twitch-Shoutout wird nicht gesendet.
- Official-Queue bleibt `waiting`.
- `last_error` ist `waiting_stream_live_offline`.
