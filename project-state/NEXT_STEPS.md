# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-26.5: Deploy-Script um docs/project-state-Sync erweitern und danach Hash-Abgleich pruefen.
```

## Danach sinnvoll

```text
CAN-27.0: Neuen Arbeitsblock bewusst planen.
```

## Vor CAN-27.0 erledigt

```text
CAN-26.3 wurde abgeschlossen und dokumentiert.
CAN-26.4 hat die Doku-/Projektstandsdateien im Repo bereinigt.
CAN-26.5 soll sicherstellen, dass docs/current, docs/system-inspection, docs/modules und project-state auch ins Live-System deployt werden.
```

## Moegliche Kandidaten

```text
- Dashboard-Kosmetik fuer Overlay-Monitor Details, falls optisch noetig.
- Doppelte lokale Struktur `htdocs\htdocs\...` separat pruefen, nicht blind loeschen.
- Weitere Bus-Diagnose nur read-only ergaenzen.
- Naechstes Modul nur nach echtem Repo-/Live-Abgleich planen.
```

## Vor jedem naechsten Code-Step

```text
1. GitHub/dev und Live-Ziel abgleichen.
2. Echte Dateien lesen.
3. Ziel / Dateien / Aenderung / Nicht geaendert / Tests nennen.
4. Auf ausdrueckliches go warten.
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
Keine Dashboard-Testbuttons fuer produktive Aktionen.
```

## Standardtests fuer Overlay-Monitor nach Aenderungen

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"

$o | Select-Object currentProgramSceneName,currentPreviewSceneName,currentProgramSceneKnown,sceneAwarenessMode,inventoryUpdatedAt,inventoryFromCache,inventoryFromMemory | Format-List

$o.summary | Select-Object total,online,info,warning,error,heartbeat,stale,dead,expectedInactive,expectedIdle,expectedNotActive,activeExpected | Format-List
```

## Standardtests fuer Deploy-Doku-Sync

```powershell
Test-Path "D:\Streaming\stramAssets\docs\current\CURRENT_CHAT_HANDOFF_CAN26_3.md"

$repo = "D:\Git\stream-control-center"
$live = "D:\Streaming\stramAssets"

$files = @(
  "project-state\CURRENT_STATUS.md",
  "project-state\NEXT_STEPS.md",
  "project-state\TODO.md",
  "project-state\CHANGELOG.md",
  "project-state\FILES.md",
  "docs\current\CURRENT_CHAT_HANDOFF_CAN26_3.md"
)

$files | ForEach-Object {
  $repoPath = Join-Path $repo $_
  $livePath = Join-Path $live $_
  $repoHash = if (Test-Path $repoPath) { (Get-FileHash $repoPath -Algorithm SHA256).Hash } else { "" }
  $liveHash = if (Test-Path $livePath) { (Get-FileHash $livePath -Algorithm SHA256).Hash } else { "" }

  [pscustomobject]@{
    File = $_
    RepoExists = Test-Path $repoPath
    LiveExists = Test-Path $livePath
    Same = ($repoHash -ne "" -and $repoHash -eq $liveHash)
  }
} | Format-Table -AutoSize
```
