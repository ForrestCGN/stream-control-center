<#
Deployt den lokalen Git-Repo-Stand nach D:\Streaming\stramAssets.

Ziel:
- Neue/geaenderte Dateien aus dem Repo ins Live-Verzeichnis kopieren.
- Vorher ein Live-Backup unter D:\Streaming\stramAssets_DEPLOY_BACKUP\latest anlegen.
- Zusaetzlich eine kleine History mit maximal 5 Backups pflegen.
- Runtime-Daten, Secrets, SQLite-Datenbanken, Logs und Archive ausschliessen.

Standard:
  RepoRoot:   D:\Git\stream-control-center
  TargetRoot: D:\Streaming\stramAssets
  BackupRoot: D:\Streaming\stramAssets_DEPLOY_BACKUP

Beispiel:
  powershell -ExecutionPolicy Bypass -File .\tools\deploy_repo_to_streamassets.ps1

Nur Trockenlauf:
  powershell -ExecutionPolicy Bypass -File .\tools\deploy_repo_to_streamassets.ps1 -DryRun
#>

param(
  [string]$RepoRoot = "D:\Git\stream-control-center",
  [string]$TargetRoot = "D:\Streaming\stramAssets",
  [string]$BackupRoot = "D:\Streaming\stramAssets_DEPLOY_BACKUP",
  [int]$MaxBackups = 5,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "[DEPLOY] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

function Ensure-Directory($path) {
  if (!(Test-Path $path)) {
    if ($DryRun) { Write-Host "[DRY] mkdir $path"; return }
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Invoke-RobocopySafe {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination,
    [string[]]$Include = @("*"),
    [string[]]$ExcludeDirs = @(),
    [string[]]$ExcludeFiles = @()
  )

  robocopy $Source $Destination $Include /E /XD $ExcludeDirs /XF $ExcludeFiles | Out-Host
  if ($LASTEXITCODE -le 7) { $global:LASTEXITCODE = 0 }
  else { throw "Robocopy fehlgeschlagen mit Exitcode $LASTEXITCODE" }
}

function Copy-DirectorySafe {
  param(
    [Parameter(Mandatory=$true)][string]$RelativePath,
    [string[]]$Include = @("*"),
    [string[]]$ExcludeDirs = @(),
    [string[]]$ExcludeFiles = @()
  )

  $src = Join-Path $RepoRoot $RelativePath
  $dst = Join-Path $TargetRoot $RelativePath

  if (!(Test-Path $src)) {
    Write-Warn "Quelle fehlt, ueberspringe: $RelativePath"
    return
  }

  Ensure-Directory $dst

  $xd = @(".git", "node_modules", "logs", "tokens", "secrets", "data", "Screenshots", "*_BACKUP*") + $ExcludeDirs
  $xf = @(".env", ".env.*", "*.sqlite", "*.sqlite3", "*.db", "*.db-shm", "*.db-wal", "*.zip", "*.7z", "*.rar", "*.bak", "*.old", "*.alt", "*.new", "*.tmp", "*.temp", "google_tts_service_account.json", "tts_state.json", "twitch_*_raw.json", "twitch_*_data.json", "twitch_channelinfo.json", "twitch_live_data.json") + $ExcludeFiles

  if ($DryRun) {
    Write-Host "[DRY] robocopy $src $dst $($Include -join ',') /E"
    return
  }

  Invoke-RobocopySafe -Source $src -Destination $dst -Include $Include -ExcludeDirs $xd -ExcludeFiles $xf
}

function Copy-FileSafe {
  param([Parameter(Mandatory=$true)][string]$RelativePath)

  $src = Join-Path $RepoRoot $RelativePath
  $dst = Join-Path $TargetRoot $RelativePath

  if (!(Test-Path $src)) {
    Write-Warn "Datei fehlt, ueberspringe: $RelativePath"
    return
  }

  $name = Split-Path $RelativePath -Leaf
  if ($name -match "\.env|\.sqlite|\.db|token|secret|password|credential|google_tts_service_account|\.bak|\.old|\.alt|\.new|\.tmp|\.temp|\.zip|\.7z") {
    Write-Warn "Blockierte Datei uebersprungen: $RelativePath"
    return
  }

  $parent = Split-Path $dst -Parent
  Ensure-Directory $parent

  if ($DryRun) {
    Write-Host "[DRY] copy $src -> $dst"
    return
  }

  Copy-Item $src $dst -Force
  Write-Host "[COPY] $RelativePath"
}

function Backup-RelativePath {
  param(
    [Parameter(Mandatory=$true)][string]$RelativePath,
    [Parameter(Mandatory=$true)][string]$EffectiveBackupRoot
  )

  $src = Join-Path $TargetRoot $RelativePath
  $dst = Join-Path $EffectiveBackupRoot $RelativePath

  if (!(Test-Path $src)) { return }

  $parent = Split-Path $dst -Parent
  Ensure-Directory $parent

  if ($DryRun) {
    Write-Host "[DRY] backup $src -> $dst"
    return
  }

  if ((Get-Item $src).PSIsContainer) {
    $xd = @("node_modules", "logs", "tokens", "secrets", "data", "Screenshots", "*_BACKUP*")
    $xf = @(".env", ".env.*", "*.sqlite", "*.sqlite3", "*.db", "*.db-shm", "*.db-wal", "*.zip", "*.7z", "*.rar", "*.bak", "*.old", "*.alt", "*.new", "*.tmp", "*.temp", "google_tts_service_account.json")
    Invoke-RobocopySafe -Source $src -Destination $dst -ExcludeDirs $xd -ExcludeFiles $xf
  } else {
    Copy-Item $src $dst -Force
  }
}

function Copy-LatestToHistory {
  param(
    [Parameter(Mandatory=$true)][string]$LatestRoot,
    [Parameter(Mandatory=$true)][string]$HistoryRoot,
    [int]$Keep = 5
  )

  if (!(Test-Path $LatestRoot)) { return }

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $historyTarget = Join-Path $HistoryRoot $stamp

  if ($DryRun) {
    Write-Host "[DRY] copy latest backup -> $historyTarget"
  } else {
    Ensure-Directory $HistoryRoot
    Copy-Item $LatestRoot $historyTarget -Recurse -Force
    Write-Step "History-Backup erstellt: $historyTarget"
  }

  if ($Keep -lt 1) { return }

  if (Test-Path $HistoryRoot) {
    $old = Get-ChildItem -LiteralPath $HistoryRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip $Keep
    foreach ($item in $old) {
      if ($DryRun) { Write-Host "[DRY] remove old backup $($item.FullName)" }
      else {
        Remove-Item $item.FullName -Recurse -Force
        Write-Step "Altes History-Backup entfernt: $($item.Name)"
      }
    }
  }
}

Write-Step "RepoRoot:   $RepoRoot"
Write-Step "TargetRoot: $TargetRoot"
Write-Step "BackupRoot: $BackupRoot"
Write-Step "MaxBackups: $MaxBackups"

if (!(Test-Path $RepoRoot)) { throw "RepoRoot existiert nicht: $RepoRoot" }
if (!(Test-Path $TargetRoot)) { throw "TargetRoot existiert nicht: $TargetRoot" }

$latestBackupRoot = Join-Path $BackupRoot "latest"
$historyRoot = Join-Path $BackupRoot "history"

Write-Step "Erstelle aktuelles Live-Backup unter: $latestBackupRoot"
if (Test-Path $latestBackupRoot) {
  if ($DryRun) { Write-Host "[DRY] remove $latestBackupRoot" }
  else { Remove-Item $latestBackupRoot -Recurse -Force }
}
Ensure-Directory $latestBackupRoot

$backupPaths = @(
  "backend",
  "config",
  "htdocs\dashboard",
  "htdocs\dashboard-v2",
  "htdocs\alerts",
  "htdocs\overlays",
  "htdocs\public",
  "docs\current",
  "docs\system-inspection",
  "docs\modules",
  "project-state",
  "htdocs\ws-client.js",
  "htdocs\index.htm",
  "htdocs\index.html"
)

foreach ($p in $backupPaths) { Backup-RelativePath -RelativePath $p -EffectiveBackupRoot $latestBackupRoot }
Copy-LatestToHistory -LatestRoot $latestBackupRoot -HistoryRoot $historyRoot -Keep $MaxBackups

Write-Step "Deploy startet. Runtime-Daten, Secrets und DB bleiben unangetastet."

Copy-DirectorySafe -RelativePath "backend" -Include @("*.js", "package.json", "package-lock.json")
Copy-DirectorySafe -RelativePath "backend\core" -Include @("*.js")
Copy-DirectorySafe -RelativePath "backend\modules" -Include @("*.js")
Copy-DirectorySafe -RelativePath "backend\modules\helpers" -Include @("*.js")

Copy-DirectorySafe -RelativePath "config" -Include @("*.json", "*.example.json") -ExcludeDirs @("secrets")
Copy-DirectorySafe -RelativePath "config\messages" -Include @("*.json")
Copy-DirectorySafe -RelativePath "config\secrets" -Include @("*.example")

Copy-DirectorySafe -RelativePath "htdocs\dashboard" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\dashboard\modules" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\dashboard-v2" -Include @("*.html", "*.css", "*.js", "*.json", "*.svg", "*.png", "*.jpg", "*.jpeg", "*.webp", "*.ico", "*.txt", "*.map", "*.webmanifest")
Copy-DirectorySafe -RelativePath "htdocs\alerts" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\overlays" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\public" -Include @("*.html", "*.css", "*.js")

Copy-DirectorySafe -RelativePath "docs\current" -Include @("*.md", "*.txt")
Copy-DirectorySafe -RelativePath "docs\system-inspection" -Include @("*.md")
Copy-DirectorySafe -RelativePath "docs\modules" -Include @("*.md")
Copy-DirectorySafe -RelativePath "project-state" -Include @("*.md")

Copy-FileSafe "htdocs\ws-client.js"
Copy-FileSafe "htdocs\index.htm"
Copy-FileSafe "htdocs\index.html"

Write-Step "Fertig. Aktuelles Backup: $latestBackupRoot"
Write-Step "History-Backups: $historyRoot"
Write-Step "Naechster Test: http://127.0.0.1:8080/dashboard/ und http://127.0.0.1:8080/dashboard-v2/"
