# Master Overlay Alert Mirror — Implementation Notes

## Dateien

### backend/modules/alert_system.js

Erweitert um:

- `DEFAULT_OVERLAY_MASTER_CONFIG`
- Laden von `config/overlay_master.json`
- `masterMirrorClients`
- `masterMirror` im `/api/alerts/status`
- optionales Spiegeln von `visual.alert.play` an `overlay_master_test`
- getrennte Behandlung von Master-Acks, ohne produktiven Alert zu beenden

### htdocs/overlays/_overlay-master-test.html

Neues Testoverlay.

- verbindet sich per WebSocket mit `op: overlay_master_test`
- sendet `hello`
- sendet Heartbeat alle 5 Sekunden
- zeigt Alert-Mirror-Payload als Preview-Karte
- sendet `received`, `rendered`, `finished` Acks
- spielt kein Audio ab

### config/overlay_master.json

Startet testOnly und ohne Produktivübernahme.

```json
{
  "enabled": false,
  "testOnly": true,
  "autoActivateWhenLive": false,
  "replaceExistingOverlays": false
}
```

## Keine Doppelanzeige im Stream

Wenn das Master-Testoverlay nur im Browser oder in einer OBS-Testszene geöffnet ist, stört es den Live-Stream nicht.

## Kein Produktiv-Finish durch Master

Nur Acks vom normalen Alert-Overlay laufen weiter durch `finishCurrent()`.
Acks vom `overlay_master_test` werden nur als Mirror-Status gespeichert.
