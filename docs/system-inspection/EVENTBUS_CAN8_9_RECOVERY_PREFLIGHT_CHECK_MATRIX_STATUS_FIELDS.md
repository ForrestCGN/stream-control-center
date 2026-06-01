# EVENTBUS CAN-8.9 RECOVERY-PREFLIGHT CHECK-MATRIX STATUSFELDER

Stand: 2026-06-01
Status: umgesetzt / read-only Backend-Erweiterung

## Ziel

CAN-8.9 erweitert `backend/modules/bus_diagnostics.js` additiv um eine read-only Check-Matrix innerhalb von `recoveryPreflight`.

## Geändert

```text
backend/modules/bus_diagnostics.js
```

Änderungen:

```text
bus_diagnostics Version: 1.2.6 -> 1.2.7
Build: STEP_CAN8_3 -> STEP_CAN8_9
recoveryPreflight.checks[] ergänzt
recoveryPreflight.checkSummary ergänzt
recoveryPreflight.scope ergänzt
neue Summary-Felder ergänzt
```

## Neue recoveryPreflight-Felder

```text
recoveryPreflight.scope[]
recoveryPreflight.checks[]
recoveryPreflight.checkSummary.total
recoveryPreflight.checkSummary.ok
recoveryPreflight.checkSummary.warnings
recoveryPreflight.checkSummary.blocking
recoveryPreflight.checkSummary.blocked
recoveryPreflight.checkSummary.categories[]
```

## Neue Summary-Felder

```text
summary.recoveryPreflightCheckCount
summary.recoveryPreflightBlockingCheckCount
summary.recoveryPreflightWarningCheckCount
summary.recoveryPreflightScopeCount
```

## Sicherheitsgrenze

CAN-8.9 bleibt strikt read-only.

```text
Keine neue API-Route
Keine POST-/Command-Route
Keine Dashboard-Code-Änderung
Keine Config-Änderung
Keine DB-Migration
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
```

Weiterhin bleiben hart blockiert:

```text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
manual_unlock_stale_bundle
clear_stale_visual_wait
refresh_overlay_state
```

## Testbefehle

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$s.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
$s.recoveryPreflight.checks | Select-Object key,category,ok,blocking,severity,reason | Format-Table -AutoSize
$s.recoveryPreflight.scope
$s.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCanPrepare,recoveryPreflightCanExecute,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightScopeCount,recoveryPreflightNextStep
```

## Erwartung

```text
recoveryPreflight.status = ready oder observe, je nach Live-Warnungen
recoveryPreflight.mode = read_only
recoveryPreflight.readOnly = true
recoveryPreflight.canPrepare = false
recoveryPreflight.canExecute = false
recoveryPreflight.currentStep = CAN-8.9
recoveryPreflight.nextAllowedStep = CAN-8.10_preflight_check_matrix_live_test_acceptance
```

## Nächster Schritt

```text
CAN-8.10: Recovery-Preflight Check-Matrix Live-Test und Abnahme dokumentieren
```
