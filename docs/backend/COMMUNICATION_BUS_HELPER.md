# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0
communication_bus.js:    v0.8.1
WS Test Client:          v0.1.0
Master Test Overlay:     v0.1.3
Debug View:              v0.1.3
Alert-System Mirror:     integriert in alert_system.js
```

## STEP278V2

Der echte Alert-Bus-Mirror ist jetzt direkt im bestehenden `alert_system.js` integriert. Es gibt kein zusätzliches `alert_bus_mirror.js` und keine dauerhafte Parallelzuständigkeit.

Der Mirror ist standardmäßig deaktiviert und kann runtime-only per API geschaltet werden:

```text
/api/alerts/bus-mirror/status
/api/alerts/bus-mirror/enable?confirm=1
/api/alerts/bus-mirror/disable?confirm=1
```

Beim echten Alert-Play bleibt der bisherige Weg unverändert:

```text
alert_system queue -> sound/tts sync -> buildOverlayAlert -> sendOverlay
```

Direkt danach wird optional zusätzlich ein Bus-Event gesendet:

```text
visual.alert.play
source: alert_system
mirror: true
productionTarget: false
```

## Bewusst nicht geändert

- kein neues Modul
- keine Alert-DB-Migration
- kein Ersatz von `broadcastWS`
- keine Änderung am echten Alert-Overlay
- keine Änderung an Sound/TTS/VIP
- keine OBS-Änderung
