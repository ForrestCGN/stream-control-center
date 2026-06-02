# NEXT_STEPS

## Sofort testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-status" | ConvertTo-Json -Depth 10
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-test?rewardKey=bauernweisheit" | ConvertTo-Json -Depth 10
```

## Erwartung

```text
enabled: false
hookInstalled: true
auto-test skipped: true
reason: hook_disabled
```

## Danach

```text
CAN-24.15 Testergebnis dokumentieren und entscheiden, ob enabled=true fuer einen begrenzten Test erlaubt ist.
```
