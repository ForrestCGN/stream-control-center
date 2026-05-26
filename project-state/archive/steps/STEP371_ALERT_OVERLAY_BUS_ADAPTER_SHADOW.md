# STEP371_ALERT_OVERLAY_BUS_ADAPTER_SHADOW

## Ziel

Das bestehende Alert-Overlay `_overlay-alerts-v2.html` soll im Shadow-Modus zusätzlich Communication-Bus-Envelopes verstehen, ohne den produktiven Legacy-Pfad zu verändern.

## Geänderter Zielbereich

- `htdocs/overlays/_overlay-alerts-v2.html` über Patch-Skript
- Patch-Skript: `tools/patches/STEP371_apply_alert_overlay_bus_shadow_adapter.js`
- Diagnose: `tools/diagnostics/STEP371_check_alert_bus_shadow_adapter.ps1`

## Verhalten nach Anwendung

Das Overlay sendet beim WebSocket-Connect weiterhin den bestehenden Legacy-Hello:

```json
{ "op": "alert_system", "client": "overlay", "event": "hello" }
```

Zusätzlich sendet es einen Bus-Hello für Shadow-Tests:

```json
{
  "type": "bus_hello",
  "clientId": "alert_overlay_v2_shadow",
  "clientType": "overlay",
  "module": "alert_system",
  "mode": "shadow",
  "capabilities": ["visual.alert.play", "visual.alert.clear"]
}
```

Das Overlay versteht danach zwei Eingangsformate:

### Legacy

```json
{ "op": "alert_system", "event": "play", "alert": { } }
```

### Bus Envelope

```json
{
  "bus": "cgn",
  "version": 1,
  "id": "evt_...",
  "type": "event",
  "channel": "visual.alert",
  "action": "play",
  "payload": {
    "alert": { }
  },
  "meta": {
    "requireAck": true,
    "replayable": true
  }
}
```

Bei Bus-Events sendet das Overlay `bus_ack` mit `received`, später bei Ende `finished`.

## Nicht-Ziele

- Kein Umschalten von `alertOutput.mode` auf Bus.
- Kein Entfernen von Legacy.
- Kein Umbau von Alert-Regeln, Sounds, TTS oder Queue.
- Kein Produktiv-Risiko: Das Overlay bleibt mit Legacy kompatibel.

## Anwendung

```powershell
cd D:\Git\stream-control-center
node .\tools\patches\STEP371_apply_alert_overlay_bus_shadow_adapter.js
powershell -ExecutionPolicy Bypass -File .\tools\diagnostics\STEP371_check_alert_bus_shadow_adapter.ps1
node --check backend\modules\alert_system.js
.\stepdone.cmd "STEP371 Alert Overlay Bus Adapter Shadow"
```

## Erwartung

Die Diagnose meldet:

```text
RESULT=OK STEP371 alert bus shadow adapter is present and legacy path is still present.
```

## Nächster Schritt

STEP372 sollte den Shadow-Bus gezielt testen, ohne `alertOutput.mode=legacy` produktiv zu ändern.
