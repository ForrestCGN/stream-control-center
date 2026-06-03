# CAN-44.8 AutoShoutout Reset-Day Fix

## Ziel

AutoShoutout muss live sauber zurücksetzbar sein, ohne globale Cooldown-Zeiten zu verändern und ohne die AutoShouti-Liste zu löschen.

## Änderungen

- Modulversion `clip_shoutout` auf `0.2.19` erhöht.
- Neuer Endpoint:
  - `POST /api/clip-shoutout/auto/reset-day`
- Der Endpoint setzt gezielt den AutoShoutout-Tagesstatus zurück:
  - löscht AutoShoutout-Events seit Tagesbeginn bzw. gewähltem Startzeitpunkt,
  - entfernt passende DisplayQueue-Einträge aus dem aktuellen Zeitraum,
  - entfernt passende OfficialQueue-Einträge aus dem aktuellen Zeitraum,
  - leert den Anti-Spam-RAM-Merker (`noticeMemory`),
  - setzt AutoShoutout-Runtime-State zurück.
- Die AutoShouti-Streamer-Liste bleibt vollständig erhalten.
- Es werden keine DB-Tabellen gelöscht oder neu aufgebaut.

## Live-Befehl

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/reset-day" `
  -ContentType "application/json" `
  -Body '{"mode":"today"}' |
  ConvertTo-Json -Depth 8
```

## Optional nur ein Login

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/reset-day" `
  -ContentType "application/json" `
  -Body '{"mode":"today","login":"papselzockt_"}' |
  ConvertTo-Json -Depth 8
```

## Prüfung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 6

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" |
  ConvertTo-Json -Depth 6
```
