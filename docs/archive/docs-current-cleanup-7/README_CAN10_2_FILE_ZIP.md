# README - CAN-10.2 ZIP

Dieses ZIP enthaelt CAN-10.2.

## Entpacken nach

```text
D:\Git\stream-control-center
```

## Tests

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-10.2 Manual Diagnostics Refresh Dashboard Button umgesetzt"
```

## Dashboard-Pruefung

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Erwartung:

- Karte `Manueller Diagnose-Refresh` sichtbar
- Button `Preflight neu laden` sichtbar
- Klick laedt nur read-only Daten neu
- keine Recovery-/Prepare-/Execute-Buttons
