# Next Steps

Nach `0.2.17`:

```text
0.2.18 - lokalen OBS-Inventar-Read testen und UI/Adapter nur falls noetig angleichen
```

Vorher lokal testen:

```powershell
$env:STREAMING_PC_OBS_INVENTORY_READ_ENABLED="true"
# optional:
$env:STREAMING_PC_OBS_PASSWORD="..."
```

Dann pruefen:

```text
/api/remote-agent/status -> streamingPcConnection.componentStatus.obs.inventory
/api/remote/local-dashboard/obs/status -> inventory.counts
```
