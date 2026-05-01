<#
Synchronisiert den lokalen Projektstand aus D:\Streaming\stramAssets in ein Git-Working-Copy dieses Repos.

Wichtig:
- Script kopiert nur erlaubte Projektdateien.
- Secrets, SQLite, Runtime-Daten, Logs, Backups und ZIPs werden bewusst ausgeschlossen.
- Danach bitte mit `git status` pruefen und dann committen/pushen.

Beispiel:
  powershell -ExecutionPolicy Bypass -File .\tools\sync_streamassets_to_repo.ps1 `
    -SourceRoot "D:\Streaming\stramAssets" `
    -RepoRoot "D:\Git\stream-control-center"
#>

param(
  [string]$SourceRoot = "D:\Streaming\stramAssets",
  [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Copy-SafeDirectory {
  param(
    [Parameter(Mandatory=$true)][string]$RelativePath,
    [string[]]$Include = @("*"),
    [string[]]$Exclude = @()
  )

  $src = Join-Path $SourceRoot $RelativePath
  $dst = Join-Path $RepoRoot $RelativePath

  if (!(Test-Path $src)) {
    Write-Host "[SKIP] $RelativePath nicht vorhanden"
    return
  }

  if (!(Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
  }

  robocopy $src $dst $Include /E /XD `
    node_modules logs tokens secrets data Screenshots *_BACKUP* /XF `
    .env .env.* *.sqlite *.sqlite3 *.db *.db-shm *.db-wal *.zip *.7z *.rar *.bak *.old *.alt *.new google_tts_service_account.json tts_state.json twitch_*_raw.json twitch_*_data.json twitch_channelinfo.json twitch_live_data.json | Out-Host

  if ($LASTEXITCODE -le 7) {
    $global:LASTEXITCODE = 0
  }
}

Write-Host "SourceRoot: $SourceRoot"
Write-Host "RepoRoot:   $RepoRoot"
Write-Host ""

Copy-SafeDirectory -RelativePath "backend" -Include @("*.js", "package.json", "package-lock.json") -Exclude @()
Copy-SafeDirectory -RelativePath "backend\core" -Include @("*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "backend\modules" -Include @("*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "backend\modules\helpers" -Include @("*.js") -Exclude @()

Copy-SafeDirectory -RelativePath "config" -Include @("*.json", "*.example.json") -Exclude @()
Copy-SafeDirectory -RelativePath "config\messages" -Include @("*.json") -Exclude @()
Copy-SafeDirectory -RelativePath "config\secrets" -Include @("*.example") -Exclude @()

Copy-SafeDirectory -RelativePath "htdocs\dashboard" -Include @("*.html", "*.css", "*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "htdocs\dashboard\modules" -Include @("*.html", "*.css", "*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "htdocs\alerts" -Include @("*.html", "*.css", "*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "htdocs\overlays" -Include @("*.html", "*.css", "*.js") -Exclude @()
Copy-SafeDirectory -RelativePath "htdocs\public" -Include @("*.html", "*.css", "*.js") -Exclude @()

# Einzeldateien im htdocs-Root
foreach ($file in @("htdocs\ws-client.js", "htdocs\index.htm", "htdocs\index.html")) {
  $src = Join-Path $SourceRoot $file
  if (Test-Path $src) {
    $dst = Join-Path $RepoRoot $file
    $parent = Split-Path $dst -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item $src $dst -Force
    Write-Host "[COPY] $file"
  }
}

Write-Host ""
Write-Host "Fertig. Jetzt im Repo ausfuehren:"
Write-Host "  git status"
Write-Host "  git add backend config htdocs project-state docs tools"
Write-Host "  git commit -m \"Import sanitized StreamAssets project state\""
Write-Host "  git push origin dev"
