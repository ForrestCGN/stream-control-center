# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Nächster empfohlener Step

```text
BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping prüfen
```

## Ziel

```text
Bestehenden Channelpoints-/VIP30-Fluss analysieren und sauberes Event-Mapping festlegen,
ohne bestehende Verarbeitung zu entfernen.
```

## Geplante Prüfpunkte

```text
1. Welche EventSub-Redemption-Events verarbeitet twitch.js aktuell?
2. Welche VIP30-/Channelpoints-Module reagieren aktuell direkt?
3. Welche Twitch-API-Funktionen für fulfill/cancel bleiben in twitch.js?
4. Welche Events liefert twitch_events künftig?
5. Welche Result-Events braucht VIP30?
6. Wie verhindern wir doppelte Fulfill/Cancel-Aktionen während Parallelbetrieb?
```

## Vorgeschlagene Events

```text
twitch.channelpoints.redemption.created
twitch.channelpoints.redemption.fulfill.requested
twitch.channelpoints.redemption.cancel.requested
twitch.channelpoints.redemption.fulfilled
twitch.channelpoints.redemption.canceled
twitch.channelpoints.redemption.failed
```

## Danach

```text
BUS-TWITCH.14 – VIP30 Subscriber parallel vorbereiten
BUS-TWITCH.15 – VIP30 Fulfill/Cancel Result-Events testen
BUS-TWITCH.16 – Alert Event-Mapping vorbereiten
```
