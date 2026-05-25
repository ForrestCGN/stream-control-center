# STEP392 Direct Overlay Production Rule

## Production URL

OBS Alert Browser Source must use:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

## Forbidden/experimental URLs

Do not use as active production overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

## Rationale

The iframe bridge had a visible reconnect/renderer issue after OBS refresh.
The direct real overlay has its own legacy WebSocket connection and direct Bus shadow registration.
STEP390 verified direct bus delivery/ack.
STEP391 verified real alert-system flow with sound/TTS.

## Known future work

Move from shadow bus support to intentional production bus mode only after a separate audited step.
Do not mix bridge-wrapper fixes into production.
