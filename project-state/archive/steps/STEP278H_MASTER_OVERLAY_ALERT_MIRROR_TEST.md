# STEP278H/I — Master Overlay Test + Alert Mirror

Status: Code package created, not live deployed, not committed.

## Ziel

Das bestehende System bleibt produktiv. Zusätzlich wird ein Master-Testoverlay erstellt, das Alert-Events als Mirror/Preview empfangen kann.

## Enthaltene Dateien

```text
backend/modules/alert_system.js
htdocs/overlays/_overlay-master-test.html
config/overlay_master.json
docs/backend/MASTER_OVERLAY_ALERT_MIRROR_IMPLEMENTATION.md
project-state/STEP278H_MASTER_OVERLAY_ALERT_MIRROR_TEST.md
```

## Produktivverhalten

Legacy bleibt produktiv:

```text
_overlay-alerts-v2.html bekommt weiterhin normale Alert-Events.
```

Master ist nur Mirror:

```text
_overlay-master-test.html bekommt zusätzlich eine Preview-Kopie, wenn es verbunden ist.
```

## Wichtig

Acks oder Finished vom Master-Testoverlay beenden keinen produktiven Alert.

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1&mirror=1
```

## OBS

Empfohlen nur Browser oder OBS-Testszene:

```text
_TEST_MasterOverlay
```

Nicht direkt in Live-Szene einbauen, solange der Testmodus aktiv ist.
