param(
  [string]$RepoRoot = "",
  [string]$LiveRoot = "D:\Streaming\stramAssets",
  [switch]$NoSyntaxCheck,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

function Write-Step($text) {
  Write-Host ""
  Write-Host "[copylive] $text" -ForegroundColor Cyan
}

function Write-Ok($text) {
  Write-Host "[ok] $text" -ForegroundColor Green
}

function Write-Warn($text) {
  Write-Host "[warn] $text" -ForegroundColor Yellow
}

function Fail($text) {
  Write-Host "[error] $text" -ForegroundColor Red
  exit 1
}

function Test-BlockedPath([string]$relativePath) {
  $p = $relativePath.Replace("\", "/").TrimStart("/")
  if ($p -eq "") { return $true }

  $lower = $p.ToLowerInvariant()

  if ($lower -match '(^|/)\.git(/|$)') { return $true }
  if ($lower -match '(^|/)\.env($|\.)') { return $true }
  if ($lower -match '(^|/)secrets?(/|$)') { return $true }
  if ($lower -match '(^|/)data/sqlite(/|$)') { return $true }
  if ($lower -match '(^|/)docs(/|$)') { return $true }
  if ($lower -match '(^|/)project-state(/|$)') { return $true }
  if ($lower -match '\.(sqlite|sqlite3|db|7z|zip|bak|old|tmp|temp)$') { return $true }
  if ($lower -match '(token|secret|password|passwd|credential)') { return $true }

  return $false
}

function Is-AllowedRuntimePath([string]$relativePath) {
  $p = $relativePath.Replace("\", "/").TrimStart("/")
  $lower = $p.ToLowerInvariant()

  if ($lower.StartsWith("backend/")) { return $true }
  if ($lower.StartsWith("htdocs/")) { return $true }
  if ($lower.StartsWith("config/")) { return $true }

  return $false
}

function Copy-WithBackup([string]$source, [string]$target, [string]$backupRoot, [string]$relativePath) {
  $targetDir = Split-Path -Parent $target
  if (!(Test-Path -LiteralPath $targetDir)) {
    if ($WhatIfOnly) {
      Write-Host "WOULD create dir: $targetDir"
    } else {
      New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
  }

  if (Test-Path -LiteralPath $target) {
    $backupTarget = Join-Path $backupRoot $relativePath
    $backupDir = Split-Path -Parent $backupTarget
    if (!(Test-Path -LiteralPath $backupDir)) {
      if ($WhatIfOnly) {
        Write-Host "WOULD create backup dir: $backupDir"
      } else {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
      }
    }

    if ($WhatIfOnly) {
      Write-Host "WOULD backup: $target -> $backupTarget"
    } else {
      Copy-Item -LiteralPath $target -Destination $backupTarget -Force
    }
  }

  if ($WhatIfOnly) {
    Write-Host "WOULD copy: $relativePath"
  } else {
    Copy-Item -LiteralPath $source -Destination $target -Force
  }
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
  $RepoRoot = (Get-Location).Path
}

if (!(Test-Path -LiteralPath $RepoRoot)) { Fail "RepoRoot nicht gefunden: $RepoRoot" }
if (!(Test-Path -LiteralPath $LiveRoot)) { Fail "LiveRoot nicht gefunden: $LiveRoot" }

$RepoRoot = [System.IO.Path]::GetFullPath($RepoRoot)
$LiveRoot = [System.IO.Path]::GetFullPath($LiveRoot)

Write-Step "RepoRoot: $RepoRoot"
Write-Step "LiveRoot: $LiveRoot"

Push-Location $RepoRoot
try {
  Write-Step "Ermittle geänderte und neue Dateien aus git status..."

  $raw = git status --porcelain=v1 -uall
  if ($LASTEXITCODE -ne 0) { Fail "git status fehlgeschlagen." }

  $items = @()

  foreach ($line in $raw) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $status = $line.Substring(0, 2)
    $path = $line.Substring(3).Trim()

    if ($path.Contains(" -> ")) {
      $path = ($path -split " -> ")[-1].Trim()
    }

    $path = $path.Trim('"')
    $path = $path.Replace("/", "\")

    if (Test-BlockedPath $path) {
      Write-Warn "Überspringe blockierten Pfad: $path"
      continue
    }

    if (!(Is-AllowedRuntimePath $path)) {
      Write-Warn "Überspringe Nicht-Runtime-Datei: $path"
      continue
    }

    if ($status.Trim().StartsWith("D")) {
      Write-Warn "Löschungen werden nicht automatisch nach Live übernommen: $path"
      continue
    }

    $source = Join-Path $RepoRoot $path
    if (!(Test-Path -LiteralPath $source)) {
      Write-Warn "Quelle nicht gefunden, überspringe: $path"
      continue
    }

    $items += [PSCustomObject]@{
      RelativePath = $path
      Source = $source
      Target = Join-Path $LiveRoot $path
    }
  }

  if ($items.Count -eq 0) {
    Write-Warn "Keine erlaubten Runtime-Dateien zum Kopieren gefunden."
    exit 0
  }

  Write-Step "Diese Dateien werden nach Live kopiert:"
  foreach ($item in $items) {
    Write-Host " - $($item.RelativePath)"
  }

  if (!$NoSyntaxCheck) {
    Write-Step "Syntaxcheck für geänderte JS-Dateien..."

    foreach ($item in $items | Where-Object { $_.RelativePath.ToLowerInvariant().EndsWith(".js") }) {
      Write-Host "node -c $($item.RelativePath)"
      node -c $item.Source
      if ($LASTEXITCODE -ne 0) {
        Fail "Syntaxcheck fehlgeschlagen: $($item.RelativePath)"
      }
    }

    Write-Ok "Syntaxchecks bestanden."
  }

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $backupRoot = Join-Path $RepoRoot "_live_copy_backup\$stamp"

  Write-Step "Kopiere nach Live. Backup: $backupRoot"

  foreach ($item in $items) {
    Copy-WithBackup -source $item.Source -target $item.Target -backupRoot $backupRoot -relativePath $item.RelativePath
  }

  Write-Ok "Runtime-Dateien wurden nach Live kopiert."
  Write-Warn "Backend bitte neu starten, wenn backend/*.js geändert wurde."
  Write-Host ""
  Write-Host "Danach sinnvoll:"
  Write-Host 'Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status" | ConvertTo-Json -Depth 30'
  Write-Host 'Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/text-pairs" | ConvertTo-Json -Depth 30'
}
finally {
  Pop-Location
}
