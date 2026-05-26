# NEXT_STEPS

Stand: 2026-05-26 / nach STEP485

## Direkt prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

## Runtime-Test

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/status
curl http://127.0.0.1:8080/api/clip-shoutout/production-check
curl http://127.0.0.1:8080/api/twitch/eventsub/status
curl http://127.0.0.1:8080/api/clip-shoutout/inbound
curl http://127.0.0.1:8080/api/clip-shoutout/inbound/stats
```

## Im Dashboard prüfen

- Modul `Shoutout-System` öffnen.
- Tab `Produktion` prüfen.
- Blocker/Warnungen anschauen.
- Tab `Eingehend` mit Debug-Event testen.

Optionales Debug-Event:

```bat
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
```

## Nächster sinnvoller Fach-STEP

```text
STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP
```

Ziel: Ergebnisse aus `production-check` bewerten, fehlende Scopes/Subscriptions gezielt korrigieren und erst danach über produktives `!so` entscheiden.
