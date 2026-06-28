# Next Steps

Nach `0.2.18D`:

```text
0.2.19 - echten lokalen OBS-Inventar-Read mit OBS_WS_URL testen und UI-Anzeige nur falls noetig angleichen
```

Lokal pruefen:

```text
GET /api/remote-agent/obs/inventory/status
GET /api/remote-agent/status
GET /api/remote/local-dashboard/obs/status
```

Erwartung bei gesetztem OBS_WS_URL:

```text
config.urlSource: OBS_WS_URL
inventoryReadEnabled: true
inventoryStatus: readonly_inventory_available oder konkreter Fehler auth_required/timeout/read_failed
```
