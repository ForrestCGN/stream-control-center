# README - CAN-9.4 ZIP

Dieses ZIP nach `D:\Git\stream-control-center` entpacken.

## Enthalten

```text
backend/modules/bus_diagnostics.js
docs/system-inspection/EVENTBUS_CAN9_4_RECOVERY_PREFLIGHT_ROUTE_CONTEXT_NEXTSTEP_FIX.md
docs/current/CURRENT_CHAT_HANDOFF_CAN9_4.md
docs/current/README_CAN9_4_FILE_ZIP.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Danach ausfuehren

```cmd
node -c backend\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-9.4 Recovery-Preflight Route-Kontext NextStep bereinigt"
```

Wenn Node nicht automatisch neu startet, Backend neu starten.
