<#
Kopiert lokale Aenderungen aus D:\Streaming\stramAssets in die Git-Arbeitskopie.

Ziel:
- Nur erlaubte Projektdateien ins Repo holen.
- Secrets, SQLite, Runtime-Daten, Logs und Backups ausschliessen.
- Danach Sicherheitspruefungen anzeigen.
- Optional committen/pushen mit -Commit -Push.

Beispiel nur synchronisieren und pruefen:
powershell -ExecutionPolicy Bypass -File .\tools\upload_streamassets_changes.ps1

Mit Commit:
powershell -ExecutionPolicy Bypass -File .\tools\upload_streamassets_changes.ps1 -Commit -Message "Update dashboard"

Mit Commit und Push:
powershell -ExecutionPolicy Bypass -File .\tools\upload_streamassets_changes.ps1 -Commit -Push -Message "Update dashboard"
#>

param(
  [string]$SourceRoot = "D:\Streaming\stramAssets",
  [string]$RepoRoot = "D:\Git\stream-control-center",
  [string]$Message = "Update sanitized StreamAssets project state",
  [switch]$Commit,
  [switch]$Push,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
  Write-Host "[UPLOAD] $msg" -ForegroundColor Cyan
}

function Write-Warn($msg) {
  Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

function Ensure-Directory($path) {
  if (!(Test-Path $path)) {
    if ($DryRun) {
      Write-Host "[DRY] mkdir $path"
      return
    }

    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Copy-SafeDirectory {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath,
    [string[]]$Include = @("*"),
    [string[]]$ExcludeDirs = @(),
    [string[]]$ExcludeFiles = @()
  )

  $src = Join-Path $SourceRoot $RelativePath
  $dst = Join-Path $RepoRoot $RelativePath

  if (!(Test-Path $src)) {
    Write-Warn "Quelle fehlt, ueberspringe: $RelativePath"
    return
  }

  Ensure-Directory $dst

  $xd = @(
    ".git",
    "node_modules",
    "logs",
    "tokens",
    "secrets",
    "data",
    "Screenshots",
    "*_BACKUP*"
  ) + $ExcludeDirs

  $xf = @(
    ".env",
    ".env.*",
    "*.sqlite",
    "*.sqlite3",
    "*.db",
    "*.db-shm",
    "*.db-wal",
    "*.zip",
    "*.7z",
    "*.rar",
    "*.bak",
    "*.old",
    "*.alt",
    "*.new",
    "google_tts_service_account.json",
    "tts_state.json",
    "twitch_*_raw.json",
    "twitch_*_data.json",
    "twitch_channelinfo.json",
    "twitch_live_data.json"
  ) + $ExcludeFiles

  if ($DryRun) {
    Write-Host "[DRY] robocopy $src $dst $($Include -join ',') /E"
    return
  }

  robocopy $src $dst $Include /E /XD $xd /XF $xf | Out-Host

  if ($LASTEXITCODE -le 7) {
    $global:LASTEXITCODE = 0
  }
}

function Copy-FileSafe {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath
  )

  $src = Join-Path $SourceRoot $RelativePath
  $dst = Join-Path $RepoRoot $RelativePath

  if (!(Test-Path $src)) {
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

Write-Step "SourceRoot: $SourceRoot"
Write-Step "RepoRoot: $RepoRoot"

if (!(Test-Path $SourceRoot)) {
  throw "SourceRoot existiert nicht: $SourceRoot"
}

if (!(Test-Path $RepoRoot)) {
  throw "RepoRoot existiert nicht: $RepoRoot"
}

Push-Location $RepoRoot

try {
  $branch = git branch --show-current

  if ($branch -ne "dev") {
    Write-Warn "Aktueller Branch ist '$branch', empfohlen ist 'dev'."
  }

  Write-Step "Kopiere sichere Projektdateien ins Repo."

  Copy-SafeDirectory -RelativePath "backend" -Include @("*.js", "package.json", "package-lock.json")
  Copy-SafeDirectory -RelativePath "backend\core" -Include @("*.js")
  Copy-SafeDirectory -RelativePath "backend\modules" -Include @("*.js")
  Copy-SafeDirectory -RelativePath "backend\modules\helpers" -Include @("*.js")

  Copy-SafeDirectory -RelativePath "config" -Include @("*.json", "*.example.json") -ExcludeDirs @("secrets")
  Copy-SafeDirectory -RelativePath "config\messages" -Include @("*.json")
  Copy-SafeDirectory -RelativePath "config\secrets" -Include @("*.example")

  Copy-SafeDirectory -RelativePath "htdocs\dashboard" -Include @("*.html", "*.css", "*.js")
  Copy-SafeDirectory -RelativePath "htdocs\dashboard\modules" -Include @("*.html", "*.css", "*.js")
  Copy-SafeDirectory -RelativePath "htdocs\dashboard-v2" -Include @("*.html", "*.css", "*.js", "*.json", "*.svg", "*.png", "*.jpg", "*.jpeg", "*.webp", "*.ico", "*.txt", "*.map", "*.webmanifest")
  Copy-SafeDirectory -RelativePath "htdocs\alerts" -Include @("*.html", "*.css", "*.js")
  Copy-SafeDirectory -RelativePath "htdocs\overlays" -Include @("*.html", "*.css", "*.js")
  Copy-SafeDirectory -RelativePath "htdocs\public" -Include @("*.html", "*.css", "*.js")

  Copy-FileSafe "htdocs\ws-client.js"
  Copy-FileSafe "htdocs\index.htm"
  Copy-FileSafe "htdocs\index.html"

  Copy-SafeDirectory `
    -RelativePath "frontend\dashboard-v2" `
    -Include @("*.html", "*.css", "*.js", "*.jsx", "*.json", "*.md") `
    -ExcludeDirs @("node_modules", "dist", ".vite")

  Write-Step "Git Status:"
  git status --short

  Write-Step "Dateinamen-Secret-Check:"
  $fileCheck = git diff --cached --name-only | Select-String -Pattern "\.env|\.sqlite|\.db|token|secret|google_tts_service_account|\.bak|\.old|\.alt|\.new|\.zip|\.7z"

  if ($fileCheck) {
    $fileCheck | Out-Host
  } else {
    Write-Host "OK: keine verdächtigen gestagten Dateinamen."
  }

  Write-Step "Inhalts-Secret-Check im Working Tree:"
  git grep -n -I -E "https://discord.com/api/webhooks|AIza[0-9A-Za-z_-]{20,}|-----BEGIN PRIVATE KEY-----" -- .

  if ($Commit) {
    Write-Step "Fuehre git add aus."
    git add backend config htdocs project-state docs tools frontend

    Write-Step "Pruefe gestagte Dateinamen."
    git diff --cached --name-only | Select-String -Pattern "\.env|\.sqlite|\.db|token|secret|google_tts_service_account|\.bak|\.old|\.alt|\.new|\.zip|\.7z" | Out-Host

    Write-Step "Commit: $Message"
    git commit -m $Message

    if ($Push) {
      Write-Step "Push origin dev"
      git push origin dev
    } else {
      Write-Step "Commit erstellt, aber nicht gepusht."
      Write-Host "Push mit: git push origin dev"
    }
  } else {
    Write-Step "Nicht committed. Wenn alles passt:"
    Write-Host " git add backend config htdocs project-state docs tools frontend"
    Write-Host " git commit -m `"$Message`""
    Write-Host " git push origin dev"
  }
}
finally {
  Pop-Location
}
