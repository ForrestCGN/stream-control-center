# NEXT_STEPS

Stand: 2026-05-26 / nach STEP483_SHOUTOUT_DASHBOARD_TABS

## Direkt nach Einbau testen

```bat
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\shoutout.js
```

API-/Live-Checks:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
```

Dashboard:

```text
/dashboard/ öffnen -> Shoutout-System -> Tabs Übersicht, Queues, Statistik, Timeline, Settings/Test prüfen.
```

## Nächster sinnvoller Fach-STEP

```text
STEP484_SHOUTOUT_INBOUND_EVENTSUB_LOGGING
```

Ziel:

- Eingehende Twitch-Shoutouts separat loggen.
- Sauber von ausgehenden Shoutouts trennen.
- Später im Dashboard anzeigen, wer ForrestCGN woanders geshoutoutet hat.

## Spätere offene Punkte

- Settings-Bearbeitung im Shoutout-Dashboard nur gezielt planen, falls wirklich gewünscht.
- EventBus-/Monitoring-Ausbau für Shoutout-Queue-Status später ergänzen.
- Produktive Umstellung auf `!so` nur ausdrücklich und nach Test.
