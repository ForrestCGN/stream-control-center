# CURRENT STATUS

Aktueller Stand: STEP454 – Alert Bus First Productive Switch.

## Basis

STEP452 hat VIP produktiv über das Node-Command-System und den Sound-Bus integriert.

STEP453 hat Alerts sicher parallel über Legacy + Communication-Bus laufen lassen.

STEP454 schaltet Alerts produktiv auf Bus-First:

```text
communication bus visual.alert output first + legacy fallback
```

## Alert-System

- `backend/modules/alert_system.js`: Version `3.1.4`
- `alertOutput.mode`: `bus_first`
- Bus-Channel: `visual.alert`
- Bus-Actions: `play`, `clear`
- Legacy bleibt als Fallback aktiv.

## Nicht geändert

- Kein Dashboard-Umbau.
- Kein Sound-System-Umbau.
- Kein TTS-Umbau.
- Kein Bundle-/Queue-Umbau.
- Kein `bus_only`.
- Kein Entfernen bestehender Alert-Routen oder Legacy-Ausgabe.
