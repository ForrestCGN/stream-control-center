# CAN-44.9 AutoShoutout Immediate Message Fix

## Ziel
Wenn ein AutoShouti sofort abgespielt werden kann, wird keine Chat-Wartelistenmeldung mehr gesendet.

## Änderungen
- `clip_shoutout` Version `0.2.20`.
- Neue AutoShoutout-Optionen:
  - `suppressImmediateQueuedMessage: true`
  - `immediateQueuedMessageThresholdMs: 10000`
- Bei `queued` ohne Start-Szene und geschätzter Wartezeit <= Threshold wird die Chatmeldung unterdrückt.
- Bei Start-Szene-Gate oder echter Wartezeit bleibt die Meldung aktiv.
- `formatApproxDuration(0)` gibt nun `wenige Sekunden` statt `kurz` zurück.

## Betroffene Datei
- `backend/modules/clip_shoutout.js`

## Keine Änderungen
- Keine DB-Strukturänderung.
- AutoShouti-Liste bleibt unverändert.
- Queue-, Display- und Official-Shoutout-Logik bleibt erhalten.
