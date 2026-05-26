# STEP278V2_REAL_ALERT_BUS_MIRROR_IN_ALERT_SYSTEM

## Ziel

Echte Alert-Events werden zusätzlich in den Communication Bus gespiegelt, ohne ein neues Bridge-Modul zu erzeugen.

## Umsetzung

- Mirror direkt im bestehenden `alert_system.js`.
- Standardmäßig deaktiviert.
- Runtime-only steuerbar über:

```text
/api/alerts/bus-mirror/status
/api/alerts/bus-mirror/enable?confirm=1
/api/alerts/bus-mirror/disable?confirm=1
```

## Ablauf

Der bestehende Alert-Ablauf bleibt bestehen:

```text
Queue -> Sound/TTS Sync -> playing -> buildOverlayAlert -> sendOverlay
```

Danach, nur wenn aktiviert:

```text
emit visual.alert.play to Communication Bus
```

## Sicherheitsgrenzen

- kein neues Modul
- keine DB-Migration
- kein Ersatz von `broadcastWS`
- keine Änderung am echten Alert-Overlay
- keine Änderung an Sound/TTS/VIP
- Mirror-Fehler dürfen den Alert-Flow nicht abbrechen
