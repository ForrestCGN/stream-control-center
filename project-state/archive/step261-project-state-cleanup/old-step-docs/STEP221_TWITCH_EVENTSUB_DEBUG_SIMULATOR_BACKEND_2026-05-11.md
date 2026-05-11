# STEP221 - Twitch EventSub Debug-Simulator Backend

Stand: 2026-05-11

## Ziel

Lokale Debug-API fuer Twitch-EventSub-Alert-Simulation bereitstellen, damit Twitch-Events gezielt getestet werden koennen, bevor die Dashboard-Oberflaeche gebaut wird.

## Betroffene Datei

```text
backend/modules/twitch.js
```

## Neue Routen

```text
GET  /api/twitch/alerts/debug/presets
POST /api/twitch/alerts/debug/eventsub
```

Legacy-/Kurzaliase:

```text
GET  /twitch/alerts/debug/presets
POST /twitch/alerts/debug/eventsub
```

## Verhalten

`POST /api/twitch/alerts/debug/eventsub` nimmt entweder ein einfaches Preset-/Kind-Payload oder ein Twitch-aehnliches EventSub-Payload an.

Beispiele:

```json
{
  "kind": "follow",
  "user": "TestFollower",
  "display": "TestFollower"
}
```

```json
{
  "kind": "bits",
  "user": "TestCheerer",
  "display": "TestCheerer",
  "bits": 100,
  "message": "Cheer100 test"
}
```

```json
{
  "subscriptionType": "channel.cheer",
  "event": {
    "user_login": "testcheerer",
    "user_name": "TestCheerer",
    "bits": 100,
    "message": "Cheer100 Cheer100 test"
  }
}
```

Die Route nutzt die echte Twitch-Alert-Normalisierung:

```text
EventSub-Testpayload
-> normalizeTwitchEventSubToAlert()
-> Sub-/Resub-30s-Puffer aus STEP220
-> /api/alerts/twitch
-> Alert-System
```

## Wichtig

- `forwardLoyalty` ist standardmaessig `false`.
- Debug-Tests erzeugen dadurch keine Loyalty-/Kekskruemel-Buchungen.
- `dryRun: true` normalisiert nur und forwardet nicht ins Alert-System.
- STEP220 bleibt erhalten: `channel.subscribe` wird weiterhin 30 Sekunden gepuffert.

## Presets

Die Preset-Route liefert Testvorschlaege fuer:

```text
follow
bits ohne Text
bits mit Text
bits mit mehreren Cheer-Tokens
sub
resub
giftSub
giftBomb
raid
channelPoints
```

## Bewusst nicht geaendert

```text
backend/modules/alert_system.js
backend/modules/loyalty.js
htdocs/**
config/**
app.sqlite
Alert-Regeln
Alert-Queue
Sounds
Overlays
Dashboard-UI
```

## Tests

Syntaxcheck:

```powershell
node --check backend/modules/twitch.js
```

API-Checks nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/presets" | ConvertTo-Json -Depth 20
```

Dry-Run ohne Alert-Ausloesung:

```powershell
$body = @{
  kind = "bits"
  user = "TestCheerer"
  display = "TestCheerer"
  bits = 100
  message = "Cheer100 Cheer100 test"
  dryRun = $true
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40
```

Echter Alert-Test:

```powershell
$body = @{
  kind = "follow"
  user = "TestFollower"
  display = "TestFollower"
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40
```

Subscribe-Puffer-Test:

```powershell
$body = @{
  kind = "sub"
  user = "TestSubBuffer"
  display = "TestSubBuffer"
  tier = "1000"
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 40
```

## Offene Punkte

Naechster STEP:

```text
STEP222 - Dashboard UI fuer Twitch Event Simulator
```

Danach:

```text
Twitch Event Mapping Audit
Cheer-Token-Bereinigung fuer TTS
Sub-/GiftSub-Normalisierung: technische Tier-Werte nicht mehr als User-Message/TTS behandeln
```
