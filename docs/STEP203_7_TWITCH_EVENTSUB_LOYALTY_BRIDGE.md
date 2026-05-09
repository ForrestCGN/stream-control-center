# STEP203.7 - Twitch EventSub -> Loyalty Bridge

Stand: 2026-05-09

## Ziel

Echte Twitch EventSub Events werden jetzt zusätzlich zum Alert-System an das Loyalty-System weitergereicht.

Die Punkteberechnung bleibt zentral in `backend/modules/loyalty.js`.
`backend/modules/twitch.js` normalisiert nur Twitch EventSub Payloads und sendet sie an:

`POST http://127.0.0.1:8080/api/loyalty/events/ingest`

## Betroffene Dateien

- `backend/modules/twitch.js`
- `backend/modules/loyalty.js`
- `backend/modules/alert_system.js` nur mitgeliefert als aktueller Stand / Vergleichsbasis
- `backend/modules/helpers/helper_core.js` nur mitgeliefert als aktueller Stand / Vergleichsbasis

## Verarbeitete Twitch Events

| Twitch EventSub Type | Loyalty eventType | Bemerkung |
|---|---|---|
| `channel.follow` | `follow` | Follow-Bonus |
| `channel.cheer` | `cheer` | Bits werden als `bits` übergeben |
| `channel.raid` | `raid` | Viewer werden als `viewers` übergeben |
| `channel.subscribe` | `subscribe` oder `gifted_sub_received` | Bei `is_gift=true` Empfänger-Bonus |
| `channel.subscription.message` | `resub` | Monate werden übergeben |
| `channel.subscription.gift` | `gift_sub` oder `gift_bomb` | Gifter-Bonus, ab total >= 5 als Giftbomb |

## Duplicate-Schutz

Als `eventUid` wird bevorzugt `metadata.message_id` aus EventSub genutzt.
Dadurch wird dasselbe echte Twitch Event nicht doppelt gebucht.

## Konfiguration

In der Twitch-Alert-Bridge-Config gibt es:

```json
"loyaltyForward": {
  "enabled": true,
  "url": "http://127.0.0.1:8080/api/loyalty/events/ingest",
  "includeRawEvent": true
}
```

Loyalty selbst muss außerdem Event-Boni erlauben:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"features.eventBonusesEnabled":true}'
```

## Test

Der bestehende Twitch-Test-Endpunkt wurde erweitert.
Er testet jetzt Alert-Forwarding und Loyalty-Forwarding zusammen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=follow&user=testfollowbridge&display=TestFollowBridge&eventId=bridge_follow_001" | ConvertTo-Json -Depth 30
```

Weitere Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=sub&user=testsubbridge&display=TestSubBridge&tier=3000&eventId=bridge_sub_001" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=resub&user=testresubbridge&display=TestResubBridge&tier=1000&amount=6&eventId=bridge_resub_001" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=giftSub&user=testgifterbridge&display=TestGifterBridge&tier=1000&amount=1&eventId=bridge_giftsub_001" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=bits&user=testbitsbridge&display=TestBitsBridge&amount=500&eventId=bridge_bits_001" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=raid&user=testraidbridge&display=TestRaidBridge&viewers=12&eventId=bridge_raid_001" | ConvertTo-Json -Depth 30
```

Kontrolle:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 30
```

## Installation

ZIP nach `D:\Streaming\stramAssets\` entpacken.
Danach Backend neu starten.

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 20
```

## Wichtig

Das System bleibt im Shadow-Modus, solange `mode=shadow` gesetzt ist.
StreamElements wird dadurch noch nicht ersetzt.
