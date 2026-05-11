# STEP222 - Twitch Subscription Tier-Text Normalisierung

Stand: 2026-05-11

## Ziel

Technische Twitch-Sub-Tier-Werte duerfen nicht mehr als User-Message in Alert-Payloads landen.

Problem vor STEP222:

```json
{
  "eventsubType": "channel.subscribe",
  "type": "sub",
  "message": "Tier 1000",
  "tier": "1000"
}
```

Dadurch konnte das Alert-/TTS-System faelschlich Texte wie `TestSub schreibt: Tier 1000` erzeugen.

## Geaendert

Datei:

```text
backend/modules/twitch.js
```

Aenderung:

- `channel.subscribe` setzt `message` jetzt auf leer.
- `channel.subscription.gift` setzt `message` jetzt auf leer.
- `tier` bleibt weiterhin als eigenes Feld erhalten.
- `raw.tier` bleibt weiterhin erhalten.
- Titel, Typ, Amount, Rule-Matching und Alert-Forwarding bleiben erhalten.
- `channel.subscription.message` bleibt unveraendert und enthaelt weiter echte User-/Resub-Nachrichten.

## Bewusst nicht geaendert

```text
backend/modules/alert_system.js
backend/modules/loyalty.js
backend/core/database.js
backend/modules/sqlite_core.js
htdocs/**
config/**
package.json
app.sqlite
```

Keine Aenderung an:

- Alert-Queue
- Alert-Regeln
- Sounds
- Designs
- Dashboard
- Loyalty
- Kofi/Tipeee
- DB-Schema
- Cheer-/Bits-TTS-Bereinigung

## Erwarteter Test

Dry-Run:

```powershell
$body = @{
  kind = "sub"
  user = "TestSub"
  display = "TestSub"
  tier = "1000"
  dryRun = $true
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40
```

Erwartung:

```json
{
  "eventsubType": "channel.subscribe",
  "type": "sub",
  "message": "",
  "tier": "1000"
}
```

GiftSub-Dry-Run:

```powershell
$body = @{
  kind = "giftSub"
  user = "TestGifter"
  display = "TestGifter"
  total = 1
  tier = "1000"
  dryRun = $true
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40
```

Erwartung: `message` ist leer, `tier` bleibt erhalten.

## Naechster fachlicher Schritt

Cheer-Tokens aus TTS-Texten entfernen:

```text
Cheer100
-> kein TTS

Cheer100 test
-> test

Cheer10 Cheer10 Cheer100 test
-> test
```
