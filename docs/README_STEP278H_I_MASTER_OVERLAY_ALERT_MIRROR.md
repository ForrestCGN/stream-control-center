# STEP278H/I — Master Overlay Test + Alert Mirror

Dieses Paket ist ein Parallel-Test-STEP.

## Wichtig

- altes System bleibt produktiv
- Master-Overlay ist nur Test/Mirror
- keine OBS-Quellen werden ersetzt
- keine SQLite-Änderung
- keine bestehende Overlay-Datei wird überschrieben

## Zielpfade

```text
backend/modules/alert_system.js
htdocs/overlays/_overlay-master-test.html
config/overlay_master.json
docs/backend/MASTER_OVERLAY_ALERT_MIRROR_IMPLEMENTATION.md
project-state/STEP278H_MASTER_OVERLAY_ALERT_MIRROR_TEST.md
```

## Test

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1&mirror=1
```

Öffnen, dann einen Alert testen. Das normale Alert-Overlay bleibt produktiv, das Master-Testoverlay bekommt eine Mirror-Kopie.
