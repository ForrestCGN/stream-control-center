# CAN-12.1 - Manual Recovery Guard Catalog Plan

## Zweck

CAN-12.1 erstellt den Guard-Katalog fuer das Manual-Recovery-Guard-Framework.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

CAN-12.0 hat die Startgrenze fuer ein einheitliches Guard-Framework definiert.

Ziel von CAN-12.1 ist ein klarer Katalog aller Guards, die fuer read-only Diagnose-Aktionen und spaetere Recovery-Kandidaten relevant sind.

## Einheitlicher Guard-Ergebnisvertrag

Jeder Guard soll spaeter in dieser Struktur darstellbar sein:

```json
{
  "key": "readOnlyGuard",
  "label": "Read-only Guard",
  "category": "read_only",
  "ok": true,
  "severity": "ok",
  "blocking": true,
  "reason": "",
  "details": {},
  "source": "dashboard|route|preflight|candidate",
  "checkedAt": "ISO timestamp"
}
```

## Severity-Werte

```text
ok
info
warning
blocked
error
```

## Guard-Kategorien

```text
read_only
timing_loop
productive_touch
execution
audit_confirmation
safety_stop
```

## Read-only Guards

### ReadOnlyGuard

Key:

```text
readOnlyGuard
```

Zweck:

Stellt sicher, dass die Aktion nur lesend arbeitet.

Erwartete Inputs:

```text
readOnly
routeSafety.readOnly
recoveryPreflight.readOnly
```

Erfolg:

```text
readOnly === true
```

Fehler:

```text
readOnly !== true
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Read-only
```

### NoMutationGuard

Key:

```text
noMutationGuard
```

Zweck:

Stellt sicher, dass keine produktive Mutation passiert.

Erwartete Inputs:

```text
productiveTouch
flowTouched
queueTouched
soundSystemTouched
alertSystemTouched
overlayTouched
```

Erfolg:

```text
productiveTouch === false
flowTouched === false
queueTouched === false
soundSystemTouched === false
alertSystemTouched === false
overlayTouched === false
```

Fehler:

Mindestens ein Touch-Feld ist `true`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Keine Mutation
```

### RouteSafetyGuard

Key:

```text
routeSafetyGuard
```

Zweck:

Stellt sicher, dass nur sichere GET-Routen verwendet werden.

Erwartete Inputs:

```text
routeSafety.method
routeSafety.commandRoute
routeSafety.prepareRoute
routeSafety.executeRoute
routeSafety.recoveryExecution
```

Erfolg:

```text
method === "GET"
commandRoute === false
prepareRoute === false
executeRoute === false
recoveryExecution === false
```

Fehler:

Eine Command-/Prepare-/Execute-/Recovery-Route ist aktiv oder Methode ist nicht GET.

Blocking:

```text
true
```

Dashboard-Label:

```text
Route-Safety
```

### NoPrepareExecuteGuard

Key:

```text
noPrepareExecuteGuard
```

Zweck:

Stellt sicher, dass keine Vorbereitung oder Ausfuehrung erlaubt ist.

Erwartete Inputs:

```text
canPrepare
canExecute
```

Erfolg:

```text
canPrepare === false
canExecute === false
```

Fehler:

`canPrepare` oder `canExecute` ist `true`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Prepare/Execute gesperrt
```

### DashboardOnlyGuard

Key:

```text
dashboardOnlyGuard
```

Zweck:

Stellt sicher, dass nur Dashboard-State veraendert wird.

Erwartete Inputs:

```text
dashboardOnly
backendMutation
externalAction
```

Erfolg:

```text
dashboardOnly === true
backendMutation !== true
externalAction !== true
```

Fehler:

Backend-Mutation oder externe Aktion wird ausgefuehrt.

Blocking:

```text
true
```

Dashboard-Label:

```text
Nur Dashboard
```

## Timing / Loop Guards

### NoAutoRetryGuard

Key:

```text
noAutoRetryGuard
```

Zweck:

Verhindert automatische Wiederholungen.

Erwartete Inputs:

```text
autoRetry
retryLoop
retryCount
```

Erfolg:

```text
autoRetry === false
retryLoop === false
retryCount <= 1
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Kein Auto-Retry
```

### NoTimerGuard

Key:

```text
noTimerGuard
```

Zweck:

Verhindert Timer-basierte Recovery- oder Refresh-Schleifen.

Erwartete Inputs:

```text
timerEnabled
intervalEnabled
scheduledExecution
```

Erfolg:

```text
timerEnabled === false
intervalEnabled === false
scheduledExecution === false
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Kein Timer
```

### ManualOnlyGuard

Key:

```text
manualOnlyGuard
```

Zweck:

Stellt sicher, dass die Aktion nur durch manuellen User-Klick startet.

Erwartete Inputs:

```text
manualTrigger
autoTrigger
systemTrigger
```

Erfolg:

```text
manualTrigger === true
autoTrigger === false
systemTrigger === false
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Nur manuell
```

## Productive Touch Guards

### NoQueueTouchGuard

Key:

```text
noQueueTouchGuard
```

Zweck:

Verhindert Queue-Mutationen.

Inputs:

```text
queueTouched
queueCleared
queueReordered
queueItemRemoved
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Queue unberuehrt
```

### NoSoundTouchGuard

Key:

```text
noSoundTouchGuard
```

Zweck:

Verhindert Sound-System-Mutationen.

Inputs:

```text
soundSystemTouched
soundStarted
soundStopped
soundReplayed
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Sound unberuehrt
```

### NoAlertTouchGuard

Key:

```text
noAlertTouchGuard
```

Zweck:

Verhindert Alert-System-Mutationen.

Inputs:

```text
alertSystemTouched
alertReplayed
alertQueued
alertCleared
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Alert unberuehrt
```

### NoOverlayTouchGuard

Key:

```text
noOverlayTouchGuard
```

Zweck:

Verhindert Overlay-State-Mutationen.

Inputs:

```text
overlayTouched
overlayShown
overlayHidden
overlayStateChanged
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Overlay unberuehrt
```

### NoObsTouchGuard

Key:

```text
noObsTouchGuard
```

Zweck:

Verhindert OBS-Steuerung.

Inputs:

```text
obsTouched
sceneChanged
sourceChanged
obsCommandSent
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
OBS unberuehrt
```

### NoStreamerBotTouchGuard

Key:

```text
noStreamerBotTouchGuard
```

Zweck:

Verhindert Streamer.bot-Aktionen.

Inputs:

```text
streamerBotTouched
streamerBotActionStarted
streamerBotCommandSent
```

Erfolg:

Alle Felder sind `false`.

Blocking:

```text
true
```

Dashboard-Label:

```text
Streamer.bot unberuehrt
```

## Execution Guards

Diese Guards bleiben in CAN-12 nur geplant und duerfen noch keine Execution erlauben.

### PrepareAllowedGuard

Key:

```text
prepareAllowedGuard
```

Zweck:

Prueft spaeter, ob eine konkrete Vorbereitung erlaubt ist.

Status in CAN-12:

```text
planned_only
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Prepare erlaubt
```

### ExecuteAllowedGuard

Key:

```text
executeAllowedGuard
```

Zweck:

Prueft spaeter, ob eine konkrete Ausfuehrung erlaubt ist.

Status in CAN-12:

```text
planned_only
```

Blocking:

```text
true
```

Dashboard-Label:

```text
Execute erlaubt
```

### AuditRequiredGuard

Key:

```text
auditRequiredGuard
```

Zweck:

Stellt spaeter sicher, dass produktive Recovery-Aktionen Audit schreiben muessen.

Status in CAN-12:

```text
planned_only
```

Dashboard-Label:

```text
Audit erforderlich
```

### ConfirmRequiredGuard

Key:

```text
confirmRequiredGuard
```

Zweck:

Stellt spaeter sicher, dass riskante Aktionen bestaetigt werden muessen.

Status in CAN-12:

```text
planned_only
```

Dashboard-Label:

```text
Bestaetigung erforderlich
```

### RollbackAvailableGuard

Key:

```text
rollbackAvailableGuard
```

Zweck:

Prueft spaeter, ob eine Aktion rueckgaengig gemacht oder sicher abgebrochen werden kann.

Status in CAN-12:

```text
planned_only
```

Dashboard-Label:

```text
Rollback verfuegbar
```

### SafetyStopGuard

Key:

```text
safetyStopGuard
```

Zweck:

Prueft spaeter, ob ein Safety-Stop aktiv ist oder eine Aktion stoppen muss.

Status in CAN-12:

```text
planned_only
```

Dashboard-Label:

```text
Safety-Stop
```

## Pflicht-Guards fuer aktuelle read-only Aktionen

Fuer `manual_diagnostics_refresh` und `manual_status_resync_request` sind Pflicht:

```text
ReadOnlyGuard
NoMutationGuard
RouteSafetyGuard
NoPrepareExecuteGuard
DashboardOnlyGuard
NoAutoRetryGuard
NoTimerGuard
ManualOnlyGuard
```

## CAN-12.2 Empfehlung

CAN-12.2 soll eine einheitliche Guard-Display-Struktur planen:

```text
Manual Recovery Guard Display Contract Plan
```

Ziel:

- Darstellung im Dashboard vereinheitlichen
- GuardSummary definieren
- Guard-Tabelle definieren
- Statusfarben/Labels planen
- keine Code-Aenderung

## CAN-12.2 Grenze

CAN-12.2 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-12.2.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung
