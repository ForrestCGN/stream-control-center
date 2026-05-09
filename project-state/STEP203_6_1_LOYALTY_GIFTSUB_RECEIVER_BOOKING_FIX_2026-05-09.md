# STEP203.6.1 - Loyalty GiftSub Receiver Booking Fix

Stand: 2026-05-09

## Problem

GiftSub-Events buchten bisher nur Punkte für den Gifter.

Beispiel vor Fix:

```text
/test/giftsub?login=testgifter2&recipientLogin=testreceiver2
```

Ergebnis:

```text
testgifter2 +50
testreceiver2 +0
```

## Fix

Wenn ein `gift_sub` oder `gift_bomb` Event verarbeitet wird und ein `recipientLogin` vorhanden ist, erzeugt Loyalty jetzt zusätzlich eine Receiver-Buchung, sofern `bonuses.giftSubReceiver.enabled = true` ist.

## Verhalten nach Fix

```text
Gifter:
  reason = event_gift_sub
  referenceType = event_bonus
  referenceId = <eventUid>

Receiver:
  reason = event_gifted_sub_received
  referenceType = event_bonus_receiver
  referenceId = <eventUid>:receiver:<recipientLogin>
```

## Duplicate-Schutz

Der Duplicate-Schutz bleibt eventbasiert über `eventUid`.

Ein doppeltes GiftSub-Event erzeugt weder eine zweite Gifter- noch eine zweite Receiver-Buchung.

## Event-Metadata

Der `loyalty_events` Eintrag speichert jetzt zusätzliche Metadaten:

```text
metadata.receiver
metadata.transactions[]
```

Damit ist sichtbar, welche Transaktionen aus einem GiftSub-Event entstanden sind.

## Nicht geändert

- Keine DB neu gebaut.
- Keine Daten gelöscht.
- Keine bestehenden Transaktionen verändert.
- Keine bestehende Funktionalität entfernt.
- Kein Dashboard-Umbau in diesem STEP.

## Geänderte Datei

```text
backend/modules/loyalty.js
```

## Test

```powershell
node -c backend\modules\loyalty.js
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/giftsub?login=testgifter3&displayName=TestGifter3&recipientLogin=testreceiver3&recipientDisplayName=TestReceiver3&tier=1000&quantity=1" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 30
```

Erwartung:

```text
testgifter3 +50
testreceiver3 +25
```
