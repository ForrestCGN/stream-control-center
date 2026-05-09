# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Loyalty / Kekskrümel

Aktueller Stand:

- Shadow Mode aktiv.
- StreamElements bleibt aktiv.
- Watch/Lurk-Punkte laufen über Twitch Presence + Auto Runner.
- Event-Boni können echte Twitch/EventSub-Events im Shadow Mode verarbeiten.
- Follow, Subscribe, Resub, Cheer/Bits, Raid und GiftSub werden unterstützt.
- STEP203.6.1 ergänzt GiftSub-Receiver-Buchungen.

## GiftSub-Verhalten

Bei GiftSub mit `recipientLogin`:

```text
Gifter bekommt giftSubGiver-Punkte.
Receiver bekommt giftSubReceiver-Punkte.
```

Voraussetzung:

```text
bonuses.giftSubGiver.enabled = true
bonuses.giftSubReceiver.enabled = true
features.eventBonusesEnabled = true
```

Duplicate-Schutz bleibt über `eventUid` aktiv.
