# CURRENT STATUS

Aktueller Stand: STEP453 – Alert Bus Safe Parallel Integration.

## Basis

STEP452 hat VIP produktiv über das Node-Command-System und den Sound-Bus integriert.

STEP453 überträgt das Prinzip vorsichtig auf Alerts, aber noch nicht als Bus-First. Alerts laufen jetzt sicher parallel:

```text
legacy overlay output + communication bus visual.alert output
```

## Alert-System

- `backend/modules/alert_system.js`: Version `3.1.3`
- `alertOutput.mode`: `legacy_and_bus`
- Bus-Channel: `visual.alert`
- Bus-Actions: `play`, `clear`
- Legacy bleibt aktiv.

## Nicht geändert

- Kein Dashboard-Umbau.
- Kein Sound-System-Umbau.
- Kein TTS-Umbau.
- Kein Bundle-/Queue-Umbau.
- Kein `bus_only`.
- Kein Entfernen bestehender Alert-Routen oder Legacy-Ausgabe.
