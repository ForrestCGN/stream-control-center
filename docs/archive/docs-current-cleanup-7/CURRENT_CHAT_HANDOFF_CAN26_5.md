# Current Chat Handoff - CAN26.5

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-26.5 vorbereitet: Der Deploy-Workflow wurde als Ursache fuer den fehlenden Live-Doku-Sync identifiziert. `stepdone.cmd` staged zwar `docs` und `project-state`, aber `tools/deploy_repo_to_streamassets.ps1` kopierte diese Pfade bisher nicht nach Live.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene CAN-26 Schritte

```text
CAN-26.0  GitHub/dev und Live-System bewusst abgeglichen.
CAN-26.1  Overlay-Monitor Scene-Awareness Diagnose-Fix.
CAN-26.2  Overlay-Monitor client-control Top-Level Diagnosefelder.
CAN-26.3  Doku- und Handoff-Aktualisierung inkl. Dashboard-Sichtpruefung.
CAN-26.4  Live-Doku-Sync und NEXT_STEPS-Bereinigung im Repo vorbereitet.
CAN-26.5  Deploy-Script-Erweiterung fuer docs/project-state vorbereitet.
```

## Relevante Dateien

```text
tools/deploy_repo_to_streamassets.ps1
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md
docs/current/CURRENT_CHAT_HANDOFF_CAN26_5.md
```

## CAN-26.5 Aenderung

`tools/deploy_repo_to_streamassets.ps1` wurde vorbereitet, um folgende Pfade beim Backup und Deploy einzubeziehen:

```text
docs/current
docs/system-inspection
docs/modules
project-state
```

Diese Erweiterung ist rein dokumentations-/projektstandsbezogen.

## Weiterhin verboten / nicht passiert

```text
Keine OBS-Reparatur.
Kein Browser-Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein Overlay-HTML-Umbau.
Kein Sound-Play.
Keine Queue-Aktion.
Keine Twitch-/Redemption-Write-Aktion.
Keine produktive Sound-Bus-Migration.
Keine Dashboard-Buttons fuer produktive Aktionen.
Keine Backend-Modul-Logik geaendert.
Keine Dashboard-Code-Logik geaendert.
```

## Empfohlener Test nach CAN-26.5

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
  "docs\current\CURRENT_CHAT_HANDOFF_CAN26_3.md",
  "docs\current\CURRENT_CHAT_HANDOFF_CAN26_5.md"
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

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN26_5.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-26.5 vorbereitet/abgeschlossen, sofern Hash-Abgleich docs/project-state erfolgreich war. Nächster Schritt: CAN-27.0 planen, aber zuerst GitHub/dev und Live-System erneut bewusst abgleichen.
```
