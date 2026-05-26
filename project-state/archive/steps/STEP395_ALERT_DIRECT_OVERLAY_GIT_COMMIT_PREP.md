# STEP395 – Alert Direct Overlay Git Commit Prep

## Zweck

Dieser Stand bereitet den Git-Commit für den final bestätigten Alert-/Soundbus-Stand vor.

## Statusbasis

STEP394 wurde lokal mit `STEP394_STATUS=PASS` bestätigt.

Bestätigt:

- `_overlay-alerts-v2.html` ist die produktive Alertquelle.
- `overlayClients=1`.
- `alert_overlay_v2_shadow` ist online.
- `BridgeClientOnline=False`.
- OverlayWatchdog: `issues=0`, `missingFinishAck=0`, `noClient=0`.
- CommunicationWatchdog: `issueCount=0`.
- Reconnect/Refresh funktioniert.
- Real Alert Flow mit Sound/TTS funktioniert.

## Nicht produktiv verwenden

`_overlay-alerts-v2-bus.html?debug=1&mode=bridge` bleibt ausdrücklich nicht die produktive Alertquelle.

## Commit-Ziel

Der Commit soll den stabilen Zustand dokumentieren und die Diagnose-/Statusdateien sichern.

Empfohlener Commit:

```text
STEP395: stabilize direct alert overlay bus flow
```
