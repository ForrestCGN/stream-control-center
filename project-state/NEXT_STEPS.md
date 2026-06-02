# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-26.2: Overlay-Monitor client-control/status Top-Level-Diagnosefelder pruefen und abschliessen.
```

## CAN-26.2 Test

Nach Entpacken, Syntaxcheck, Deploy und Node-Neustart pruefen:

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"
$o | Select-Object currentProgramSceneName,currentPreviewSceneName,currentProgramSceneKnown,sceneAwarenessMode,inventoryUpdatedAt,inventoryFromCache,inventoryFromMemory | Format-List
```

Erwartung:

```text
currentProgramSceneName  : <echte OBS Program-Szene>
currentProgramSceneKnown : True
sceneAwarenessMode       : program_scene_known
inventoryUpdatedAt       : <Zeitstempel>
inventoryFromCache       : True/False
inventoryFromMemory      : True/False
```

Zusatztest Szene ohne Rahmen:

```powershell
$o.clients |
  Where-Object { $_.id -eq "overlay:frame_overlay" } |
  Select-Object id,name,status,monitorStatus,rawStatus,activeExpected,expectedInactive,expectedIdle,expectedNotActive,currentProgramSceneName,currentProgramSceneKnown,sceneAwarenessMode |
  Format-List
```

Erwartung:

```text
status/monitorStatus: expected_inactive
activeExpected: False
expectedNotActive: True
warning/error in summary: 0
```

## Danach sinnvoll

```text
CAN-26.3: Naechsten technischen Kandidaten planen oder Dashboard-Feinschliff fuer Overlay-Monitor Info/Idle/Inactive Anzeige entscheiden.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
```
