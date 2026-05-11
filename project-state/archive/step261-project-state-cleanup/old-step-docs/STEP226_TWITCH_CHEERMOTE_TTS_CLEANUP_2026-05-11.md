# STEP226 - Twitch Cheermote TTS Cleanup

Stand: 2026-05-11

## Ziel

Twitch-Bits-/Cheer-Alerts sollen fuer TTS nicht nur klassische `Cheer100`-Woerter entfernen, sondern echte Twitch-Cheermote-Woerter wie `ShowLove10`, `Pride100`, `Party100` usw. beruecksichtigen.

## Geaendert

```text
backend/modules/twitch.js
backend/modules/alert_system.js
```

## Backend / Twitch

- Twitch-Bridge hat eine Cheermote-Prefix-Liste bekommen.
- Prefixe werden ueber Helix geladen:
  - `GET /helix/bits/cheermotes`
  - mit `broadcaster_id`, wenn `TWITCH_BROADCASTER_ID` oder Config vorhanden ist.
- Cache-Dauer: standardmaessig 24 Stunden.
- Fallback-Prefix: `Cheer`.
- Neue Status-/Reload-Routen:
  - `GET /api/twitch/cheermotes/status`
  - `POST /api/twitch/cheermotes/reload`
  - Legacy-Aliase unter `/twitch/cheermotes/*`
- Bits-Alert-Payloads enthalten nun `cheermotePrefixes`, damit das Alert-System die echte Prefix-Liste fuer TTS-Cleanup nutzen kann.

## Alert-System / TTS

- TTS-Cleanup fuer Twitch-Bits nutzt jetzt Cheermote-Prefixe aus dem Twitch-Payload.
- Nur Bits-/Cheer-Alerts werden bereinigt.
- Die originale Alert-Message bleibt unveraendert gespeichert und sichtbar.

Beispiele:

```text
Cheer100 test
-> TTS: test

Cheer10 Cheer10 Cheer100 test
-> TTS: test

ShowLove10 ShowLove10 Guten morgen!
-> TTS: Guten morgen!

ShowLove10 ShowLove10
-> kein TTS
```

## Bewusst nicht geaendert

```text
Alert-Regeln
Alert-Queue
Dashboard
Sound-System
Loyalty
Kofi/Tipeee
SQLite-Schema
app.sqlite
```

## Tests

Syntax:

```powershell
node --check backend/modules/twitch.js
node --check backend/modules/alert_system.js
```

API-Checks nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/cheermotes/status?includePrefixes=1" | ConvertTo-Json -Depth 80

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/cheermotes/reload" -Method Post | ConvertTo-Json -Depth 80
```

Simulator-Test:

```powershell
$body = @{
  kind = "bits"
  user = "TestCheerer"
  display = "TestCheerer"
  bits = 20
  message = "ShowLove10 ShowLove10 Guten morgen!"
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=1" | ConvertTo-Json -Depth 100
```

Erwartung in `raw.alertTts`:

```text
message = Guten morgen!
text = TestCheerer schreibt: Guten morgen!
cleanup.mode = strip_twitch_cheermote_words
```
