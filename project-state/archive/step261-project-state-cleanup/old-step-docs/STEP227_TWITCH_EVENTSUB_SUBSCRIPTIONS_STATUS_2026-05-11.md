# STEP227 - Twitch EventSub Subscription Status Route

Stand: 2026-05-11

## Ziel

Diagnose-Route zum Auslesen der aktuell aktiven Twitch EventSub-Subscriptions über Twitch Helix.

Damit kann geprüft werden, welche EventSub-Typen wirklich aktiv abonniert sind und ob mögliche Doppel-/Falschverarbeitungen durch parallel aktive Eventtypen entstehen können.

## Geändert

```text
backend/modules/twitch.js
project-state/STEP227_TWITCH_EVENTSUB_SUBSCRIPTIONS_STATUS_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Neue Routen

```text
GET /api/twitch/eventsub/subscriptions
GET /api/twitch/eventsub/status
GET /twitch/eventsub/subscriptions
```

## Funktion

Die Route fragt Twitch Helix ab:

```text
GET /helix/eventsub/subscriptions
```

und gibt aus:

```text
- id
- status
- type
- version
- condition
- created_at
- cost
- transport.method
- transport.session_id
- transport.callback redacted
- Summary nach type/status/transport
- Checks fuer moegliche Doppel-/Sonderfaelle
```

## Diagnose-Checks

Die Response enthält u. a.:

```text
channelCheer
channelBitsUse
cheerAndBitsUseBothActive
subscriptionGift
subscribe
subscriptionMessage
giftedSubReceiverRisk
follow
raid
channelPoints
hypeTrainActive
hypeTrainTypes
```

Damit kann gezielt geprüft werden:

```text
- Sind channel.cheer und channel.bits.use gleichzeitig aktiv?
- Sind Hype-Train-Events aktiv?
- Sind GiftSub-Gifter und GiftSub-Receiver-Events parallel aktiv?
- Ist channel.subscription.message aktiv?
- Sind Channel-Points-Alerts aktiv?
```

## Bewusst nicht geändert

```text
Alert-Regeln
Alert-Queue
TTS-Logik
Dashboard
Loyalty
Datenbank
app.sqlite
Bestehende Twitch EventSub-Subscriptions
```

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend/modules/twitch.js

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/subscriptions" | ConvertTo-Json -Depth 100
```

Optional mit mehr Seiten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/subscriptions?maxPages=10" | ConvertTo-Json -Depth 100
```

## Einordnung

Dieser STEP ist reine Diagnose. Er verändert keine Event-Verarbeitung. Die Ergebnisse werden genutzt, um die EventSub-/Alert-Mapping-Auditliste Event für Event weiter zu prüfen.
