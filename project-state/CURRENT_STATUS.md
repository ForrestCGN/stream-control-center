# CURRENT_STATUS

## Stand: CAN-17.2 abgeschlossen

CAN-17.2 hat die Roles/Rights Backend Boundary no-implementation geplant.

## Roles/Rights-Status

```text
rolesRightsPlanning: true
rolesRightsActionMatrix: true
rolesRightsBackendBoundary: true
rolesRightsDisplayBoundary: false
rolesApi: false
rightsApi: false
authSystem: false
userSystem: false
rolesDb: false
dashboardRightsEnforcement: false
rightsMiddleware: false
rightsMutation: false
eventBusEmit: false
```

## Sicherheitsstand

```text
readOnly: true
canPrepare: false
canExecute: false
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
dashboardRecoveryButtons: false
```

## CAN-17.2 Ergebnis

```text
Serverseitige Rechtepruefung ist spaeter Pflicht.
Client/UI ist keine Autoritaet.
Keine Rechte-Routen, keine Middleware, keine DB, keine Config.
High-risk bleibt blockiert.
```

## Weiterhin hart blockiert

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto Recovery
Auto Retry Overlay
Streamer.bot Action Retry
OBS Source Refresh
SafetyStop Clear
SafetyStop Reset
Audit Write Route
Audit Read Route
Confirm API
Rollen-/Rechte-Mutation
Prepare Route
Execute Route
POST Command Route
```

## Naechster Schritt

```text
CAN-17.3 - Roles/Rights Display Boundary no-implementation Planning
```
