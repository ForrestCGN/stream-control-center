# NEXT_STEPS

Stand: 2026-05-26 / nach STEP486

## Direkt prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

## Runtime-Test

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/status
curl http://127.0.0.1:8080/api/clip-shoutout/production-check
curl http://127.0.0.1:8080/api/clip-shoutout/live-test
curl http://127.0.0.1:8080/api/twitch/eventsub/status
curl http://127.0.0.1:8080/api/clip-shoutout/inbound
curl http://127.0.0.1:8080/api/clip-shoutout/inbound/stats
```

## Debug-Inbound testen

```bat
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
curl http://127.0.0.1:8080/api/clip-shoutout/live-test
```

## Im Dashboard prüfen

- Modul `Shoutout-System` öffnen.
- Tab `Produktion` prüfen.
- Tab `Live-Test` prüfen.
- Empfohlene nächste Aktion beachten.
- Keine produktive `!so`-Umstellung durchführen, bis echte Receive-/Create-Events geprüft wurden.

## Nächster sinnvoller Fach-STEP

```text
STEP487_SHOUTOUT_REAL_EVENT_TEST_RESULTS
```

Ziel: echte Runtime-Ergebnisse aus Production-Check, Live-Test und Twitch-EventSub-Shoutouts auswerten und dokumentieren.
