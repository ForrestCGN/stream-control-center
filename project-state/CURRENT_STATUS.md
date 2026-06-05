# Current Status

## VIP30-STEP3

Vorbereitet ist `VIP30-STEP3 Channelpoints Reward Link 40000`.

Status:

- VIP30-Grundmodul aus STEP1 laeuft.
- Twitch Capability Check aus STEP2 ist gruen.
- `channel:manage:redemptions` ist vorhanden.
- `channel:manage:vips` ist vorhanden.
- VIP30-Reward-Kosten wurden auf **40.000 Kanalpunkte** gesetzt.
- STEP3 verbindet VIP30 lokal mit dem vorhandenen Channelpoints-System.

## Geaenderte/ergaenzte Routen

```txt
GET  /api/vip30/channelpoints/reward/status
POST /api/vip30/channelpoints/reward/ensure?confirm=YES
```

## Sicherheit

STEP3 fuehrt keine Twitch-Schreibaktion aus:

- kein Add VIP
- kein Remove VIP
- kein Fulfill/Cancel
- kein Twitch-Reward-Push

Der lokale Reward wird mit `twitch_is_enabled = 0` gespeichert.

## Naechster Fokus

VIP30-STEP4: Dry-/Decision-Flow fuer VIP30-Redemptions vorbereiten. Weiterhin kein Live-VIP, kein Fulfill/Cancel, solange die Entscheidungskette nicht vollstaendig sichtbar getestet ist.
