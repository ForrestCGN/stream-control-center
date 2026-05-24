# CURRENT_SYSTEM_STATUS

## STEP278W

Alert Timing Diagnostics ergänzt.

Betroffene Runtime:

```text
alert_system.js
/api/alerts/bus-mirror/status
```

Funktion:

- Keine neue Alert-Logik.
- Kein neues Modul.
- Keine Sound-/TTS-/Queue-/Overlay-Änderung.
- Der bestehende Bus-Mirror bleibt runtime-only aktivierbar.
- Der Mirror-Status zeigt zusätzlich Timing-Diagnose zum letzten gespiegelten Alert.
- Messpunkte: queued, waiting for sound, sound bundle ready, sound wait done, playing, overlay sent, bus mirror sent.

## Vorheriger Stand

# CURRENT_SYSTEM_STATUS

## Aktueller Stand: STEP278V2

Der echte Alert-Bus-Mirror ist direkt im bestehenden Alert-System integriert.

Versionen:

```text
communication_bus v0.8.1
communication_debug_view v0.1.3
overlay_master_test v0.1.3
alert_system: bestehendes Modul, Mirror integriert
```

Wichtig: `STEP278V_REAL_ALERT_BUS_MIRROR.zip` mit separatem `alert_bus_mirror.js` wurde verworfen und soll nicht eingespielt werden.
