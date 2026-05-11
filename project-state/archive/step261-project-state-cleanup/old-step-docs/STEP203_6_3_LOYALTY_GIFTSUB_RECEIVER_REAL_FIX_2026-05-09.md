# STEP203.6.3 Loyalty GiftSub Receiver Real Fix

## Ziel
GiftSub-Receiver-Bonus wird korrekt verarbeitet, wenn Test-/Ingest-Daten den Empfänger in Query-/Raw-Feldern liefern.

## Problem
Die aktive `loyalty.js` erkannte Receiver-Felder nur aus Top-Level-Input. Die Test-Route legte `recipientLogin` jedoch nur unter `raw.query` ab. Ergebnis: `receiver: null`, keine Receiver-Transaktion.

## Änderung
- `loyalty.js` Version auf `0.1.7` gesetzt.
- `recordEventBonus()` liest Receiver jetzt aus:
  - Top-Level `recipientLogin`, `recipientDisplayName`
  - `raw.query.recipientLogin`, `raw.query.recipientDisplayName`
  - EventSub-nahe `raw.event.*` Felder
- Test-Route `/api/loyalty/events/test/:type` gibt Receiver-Felder zusätzlich direkt an `recordEventBonus()` weiter.

## Erwartung
Test mit GiftSub erzeugt zwei Buchungen:
- Gifter: `event_gift_sub`, z. B. +50
- Receiver: `event_gifted_sub_received`, z. B. +25

## Test
```powershell
node -c backend\modules\loyalty.js

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/giftsub?login=testgifter6&displayName=TestGifter6&recipientLogin=testreceiver6&recipientDisplayName=TestReceiver6&tier=1000&quantity=1" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 30
```

## Wichtig
Nach dem Entpacken Backend neu starten. Ohne Neustart läuft weiter der alte Code.
