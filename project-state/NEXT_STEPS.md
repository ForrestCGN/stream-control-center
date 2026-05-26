# NEXT_STEPS

Stand: 2026-05-26 / nach STEP484

## Direkt danach prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

## Runtime-Test

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/status
curl http://127.0.0.1:8080/api/clip-shoutout/inbound
curl http://127.0.0.1:8080/api/clip-shoutout/inbound/stats
```

Optionales Debug-Event:

```bat
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
```

## Nächster sinnvoller Fach-STEP

```text
STEP485_SHOUTOUT_INBOUND_UI_POLISH_OR_SO_PRODUCTION_CHECK
```

Optionen:

1. `Eingehend`-Tab nach Live-Test weiter aufräumen.
2. EventSub-Subscriptions/Scopes für Shoutout-Events prüfen.
3. Erst nach Freigabe produktive `!so`-Umstellung planen.
