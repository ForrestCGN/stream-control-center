# NEXT_STEPS – nach STEP417

## Direkt testen

1. Backend neu starten.
2. Im Browser öffnen:

```text
http://127.0.0.1:8080/public/tools/alert_eventbus_debug.html
```

3. Communication-Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `id: alert_eventbus_debug`
- `module: alert_system`
- `version: 1.0.0`
- `capabilities` enthält `alert.event_output`
- `connected: true`

4. Alert-Bus-Test auslösen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/test?message=STEP417" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `deliveredTo` enthält `alert_eventbus_debug`
- `deliveredCount: 1`
- `stats.errors: 0`
- Browser zeigt das `alert.status/test` Event

## Danach sinnvoll

STEP418: echten Alert-Flow beobachten/korrelieren, ohne Queue, Sound-System-Bundle/TTS oder Overlay-Flow umzubauen.
