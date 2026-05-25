# STEP393 Alert Overlay Direct Reconnect

## Summary

The alert overlay is stable again on the direct overlay path. The previous bus bridge wrapper introduced a visible reconnect/iframe renderer problem and is not used for production.

The direct overlay itself already contains bus shadow registration and ACK logic while keeping legacy alert rendering active.

## Production overlay

```text
/overlays/_overlay-alerts-v2.html
```

## Runtime expectations

- Alert system reports one overlay client.
- Communication status lists `alert_overlay_v2_shadow` as online.
- The bridge wrapper client must not be online in production.
- Reconnect recovery should use the existing legacy resend with remaining duration.
- Sound/TTS must not restart during reconnect.

## Verification commands

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" |
  Select-Object step,overlayClients,currentEventId

(Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status").status.clients |
  Select-Object id,module,type,status
```
