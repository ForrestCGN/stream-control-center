# NEXT_STEPS

## Sofort testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-migration-candidates/dry-run" | ConvertTo-Json -Depth 10
```

## Danach

```text
CAN-24.12: Testergebnis mediaId-DryRun dokumentieren.
```

## Weiter blockiert

```text
Keine produktive Sound-Migration.
Kein EventSub-/Execute-Hook.
Kein Sound-Play ueber Bus.
```
