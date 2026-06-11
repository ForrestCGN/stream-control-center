# CURRENT CHAT HANDOFF – STEP212b / LWG-5.4b

Stand: 2026-06-11

## Zweck

Hotfix fuer das Points-Runtime-Testscript.

## Grund

Der STEP212a-Test hatte keinen Backendfehler, sondern ein PowerShell-Parameterproblem: Der Funktionsparameter `$Args` kollidierte praktisch mit der PowerShell-Automatikvariable/Argumentbehandlung. Dadurch wurde `!punkte @user` im Permission-Test ohne Zielargument an die Runtime gesendet und faelschlich als Self-Check getestet.

## Fix

```text
Invoke-PointsRuntime: Parameter Args -> CommandArgs
Body: args = @($CommandArgs)
Testaufrufe: -CommandArgs ...
```

## Status

Keine Runtime-Aenderung. Keine Datenbank-Aenderung. Keine Command-Aktivierung.

Nach StepDone erneut ausfuehren:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP212_LWG5_4_points_command_runtime_ForrestCGN.ps1
```
