# CURRENT SYSTEM STATUS – STEP394 APPEND

## Alert Overlay Stable State

Produktiv ist wieder das direkte Alert-Overlay:

```text
/overlays/_overlay-alerts-v2.html
```

Die OBS-Browserquelle soll auf folgende URL zeigen:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Die Bus-Bridge-Datei `_overlay-alerts-v2-bus.html` ist kein produktiver Pfad.

## Bestätigter Check aus STEP393A

```text
OverlayUrlStatus=200
overlayClients=1
OverlayWatchdog issues=0
missingFinishAck=0
noClient=0
CommunicationClients=alert_overlay_v2_shadow:alert_system:overlay:online
DirectOverlayBusClientOnline=True
BridgeClientOnline=False
CommunicationWatchdog issueCount=0
STEP393A_STATUS=PASS
```

## Wichtig

Der Communication-Bus bleibt vorbereitet, aber direkt im echten Overlay:

```text
clientId=alert_overlay_v2_shadow
module=alert_system
type=overlay
status=online
```

Nicht mehr als produktiver Pfad verwenden:

```text
_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```
