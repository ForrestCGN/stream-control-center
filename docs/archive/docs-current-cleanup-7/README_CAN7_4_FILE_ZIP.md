# README – CAN-7.4 Datei-ZIP

Stand: 2026-06-01

Diese ZIP enthält den CAN-7.4 Recovery-Tab UX-Cleanup.

## Entpacken nach

```text
D:\Git\stream-control-center
```

## Danach testen

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-7.4 Recovery-Tab UX-Cleanup mit Untertabs umgesetzt"
```

## Dashboard-Prüfung

```text
Admin / Bus-Diagnose -> Recovery
```

Erwartung:

```text
Interne Untertabs sichtbar
Übersicht kompakter
Details/Readiness/Sperren erreichbar
Keine Recovery-Buttons
Keine Simulation-Buttons
```
