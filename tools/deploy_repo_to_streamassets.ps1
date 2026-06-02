<#
Deployt den Git-Repo-Stand nach D:\Streaming\stramAssets.

Ziel:
- Neue/geaenderte Dateien aus dem Repo ins Live-Verzeichnis kopieren.
- Vorher genau EIN Backup der alten Zielbereiche anlegen.
- Altes Backup wird ersetzt.

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
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
  Write-Host "[DEPLOY] $msg" -ForegroundColor Cyan
}

function Write-Warn($msg) {
  Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

function Ensure-Directory($path) {
  if (!(Test-Path $path)) {
    if ($DryRun) { Write-Host "[DRY] mkdir $path"; return }
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
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
  $xf = @(".env", ".env.*", "*.sqlite", "*.sqlite3", "*.db", "*.db-shm", "*.db-wal", "*.zip", "*.7z", "*.rar", "*.bak", "*.old", "*.alt", "*.new", "google_tts_service_account.json", "tts_state.json", "twitch_*_raw.json", "twitch_*_data.json", "twitch_channelinfo.json", "twitch_live_data.json") + $ExcludeFiles

  if ($DryRun) {
    Write-Host "[DRY] robocopy $src $dst $($Include -join ',') /E"
    return
  }

  robocopy $src $dst $Include /E /XD $xd /XF $xf | Out-Host
  if ($LASTEXITCODE -le 7) { $global:LASTEXITCODE = 0 }
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
  if ($name -match "\.env|\.sqlite|\.db|token|secret|google_tts_service_account|\.bak|\.old|\.alt|\.new|\.zip|\.7z") {
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
  param([Parameter(Mandatory=$true)][string]$RelativePath)

  $src = Join-Path $TargetRoot $RelativePath
  $dst = Join-Path $BackupRoot $RelativePath

  if (!(Test-Path $src)) { return }

  $parent = Split-Path $dst -Parent
  Ensure-Directory $parent

  if ($DryRun) {
    Write-Host "[DRY] backup $src -> $dst"
    return
  }

  if ((Get-Item $src).PSIsContainer) {
    robocopy $src $dst /E /XD node_modules logs tokens secrets data Screenshots *_BACKUP* /XF .env .env.* *.sqlite *.sqlite3 *.db *.db-shm *.db-wal *.zip *.7z *.rar *.bak *.old *.alt *.new google_tts_service_account.json | Out-Host
    if ($LASTEXITCODE -le 7) { $global:LASTEXITCODE = 0 }
  } else {
    Copy-Item $src $dst -Force
  }
}

Write-Step "RepoRoot:   $RepoRoot"
Write-Step "TargetRoot: $TargetRoot"
Write-Step "BackupRoot: $BackupRoot"

if (!(Test-Path $RepoRoot)) { throw "RepoRoot existiert nicht: $RepoRoot" }
if (!(Test-Path $TargetRoot)) { throw "TargetRoot existiert nicht: $TargetRoot" }

Write-Step "Erstelle genau ein neues Backup. Altes Backup wird ersetzt."
if (Test-Path $BackupRoot) {
  if ($DryRun) { Write-Host "[DRY] remove $BackupRoot" }
  else { Remove-Item $BackupRoot -Recurse -Force }
}
Ensure-Directory $BackupRoot

$backupPaths = @(
  "backend",
  "config",
  "htdocs\dashboard",
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

foreach ($p in $backupPaths) { Backup-RelativePath $p }

Write-Step "Deploy startet. Runtime-Daten und Secrets bleiben unangetastet."

Copy-DirectorySafe -RelativePath "backend" -Include @("*.js", "package.json", "package-lock.json")
Copy-DirectorySafe -RelativePath "backend\core" -Include @("*.js")
Copy-DirectorySafe -RelativePath "backend\modules" -Include @("*.js")
Copy-DirectorySafe -RelativePath "backend\modules\helpers" -Include @("*.js")

Copy-DirectorySafe -RelativePath "config" -Include @("*.json", "*.example.json") -ExcludeDirs @("secrets")
Copy-DirectorySafe -RelativePath "config\messages" -Include @("*.json")
Copy-DirectorySafe -RelativePath "config\secrets" -Include @("*.example")

Copy-DirectorySafe -RelativePath "htdocs\dashboard" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\dashboard\modules" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\alerts" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\overlays" -Include @("*.html", "*.css", "*.js")
Copy-DirectorySafe -RelativePath "htdocs\public" -Include @("*.html", "*.css", "*.js")

Copy-DirectorySafe -RelativePath "docs\current" -Include @("*.md")
Copy-DirectorySafe -RelativePath "docs\system-inspection" -Include @("*.md")
Copy-DirectorySafe -RelativePath "docs\modules" -Include @("*.md")
Copy-DirectorySafe -RelativePath "project-state" -Include @("*.md")

Copy-FileSafe "htdocs\ws-client.js"
Copy-FileSafe "htdocs\index.htm"
Copy-FileSafe "htdocs\index.html"

Write-Step "Fertig. Backup liegt hier: $BackupRoot"
Write-Step "Naechster Test: http://127.0.0.1:8080/dashboard/"
