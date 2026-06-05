# NEXT_STEPS - VIP30

## Direkt nach STEP8

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node -c backend\modules\vip30.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Node neu starten.
5. Minimal prüfen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/live/check"
$r.status
$r.armed
$r.blockers
```

Erwartung: `live_actions_locked`, `False`.

## STEP9 geplant

Erst nach separatem Go:

- echte Twitch Add-VIP-Aktion
- Slot-Write in `vip30_slots`
- Redemption-Fulfill bei Erfolg
- Redemption-Cancel bei Blocker
- Alert/Sound nach Erfolg
- Cleanup/Revoke für abgelaufene VIPs als eigener Folge-Step
