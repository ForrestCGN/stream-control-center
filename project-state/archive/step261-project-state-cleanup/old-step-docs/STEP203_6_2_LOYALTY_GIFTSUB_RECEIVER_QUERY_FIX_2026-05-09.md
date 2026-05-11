# STEP203.6.2 - Loyalty GiftSub Receiver Query Fix (2026-05-09)

## Ziel

GiftSub-Receiver-Bonus wird korrekt verarbeitet, wenn Empfaengerdaten ueber Query/Raw-Testdaten oder Twitch-Event-Payload kommen.

## Problem

Die Test-Route `/api/loyalty/events/test/giftsub` hat `recipientLogin` und `recipientDisplayName` nur in `raw.query` abgelegt. `recordEventBonus()` hat den Receiver aber nur aus Top-Level-Feldern gelesen. Dadurch blieb `receiver` trotz aktivem Setting `bonuses.giftSubReceiver.enabled=true` auf `null`.

## Geaendert

- `backend/modules/loyalty.js` Version auf `0.1.6` gesetzt.
- Receiver-Erkennung in `recordEventBonus()` erweitert:
  - Top-Level-Felder
  - `raw.query.*`
  - `raw.event.*` / EventSub-nahe Feldnamen
- Test-Route gibt `recipientLogin` und `recipientDisplayName` jetzt zusaetzlich als Top-Level-Felder an `recordEventBonus()` weiter.

## Erwartung

GiftSub-Test mit Receiver:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/giftsub?login=testgifter5&displayName=TestGifter5&recipientLogin=testreceiver5&recipientDisplayName=TestReceiver5&tier=1000&quantity=1" | ConvertTo-Json -Depth 30
```

Erwartet:

- Gifter: +50
- Receiver: +25
- `receiver` nicht null
- `relatedTransactions` enthaelt Receiver-Transaktion
- `relatedUsers` enthaelt Receiver-User

## Betroffene Dateien

- `backend/modules/loyalty.js`

## Bewusst offen

- Keine Aenderung an Live-/Shadow-Modus.
- Keine Migration oder DB-Schemaaenderung.
- Keine Aenderung an bestehenden Event-Bonus-Betraegen.
