# Modul-Doku – Loyalty / Raffle Stand 2026-06-15

## Loyalty Core

Status:

```text
live
version 0.1.23
```

Wichtige Routen:

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/transactions
GET  /api/loyalty/balance/:login
```

## StreamElements Import

Import wurde additiv über Transaktionen durchgeführt.

```text
type = legacy_points_import
sourceProvider = streamelements
mode = live
reason = streamelements_points_import
referenceId = streamelements_top489_2026-06-15
```

## Watch-Punkte

```text
Viewer: 2 pro Intervall
Subscriber/Fallback: 6 pro Intervall
Intervall: 10 Minuten
```

## Event-Boni

Support-Events werden als `event_bonus` gebucht.

Beispiele:

```text
Cheer100 -> 10
GiftSub Gifter -> 50
GiftSub Receiver -> 5
```

## Raffle

Raffle ist im Modul eingebettet:

```text
backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.7
moduleBuild = STEP_LC_RAFFLE_1F
```

Commands:

```text
!raffle -> mod
!join -> everyone
```

Raffle-Konstanten aktuell:

```text
durationSeconds = 120
prizePoolAmount = 5000
participationCost = 0
payout = floor(5000 / winnerCount)
```

Transaktion:

```text
type = raffle_win
sourceModule = loyalty_giveaways
sourceProvider = raffle
reason = loyalty_raffle_win
referenceType = raffle
referenceId = raffleUid
```

Öffentliche Textkeys:

```text
raffle.public.started
raffle.public.joined
raffle.public.already_joined
raffle.public.no_active
raffle.public.status
raffle.public.cancelled
raffle.public.no_entries
raffle.public.winners
raffle.public.permission_denied
```

Regel:

```text
Pool intern ja, im Chat nein.
Gewinnertext nennt Gewinner und Betrag.
```
