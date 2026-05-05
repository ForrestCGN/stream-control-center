param(
  [Parameter(Position=0)]
  [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkGray
  Write-Host "[stepdone] $Text" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor DarkGray
}

function Write-Ok {
  param([string]$Text)
  Write-Host "[ok] $Text" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Text)
  Write-Host "[warn] $Text" -ForegroundColor Yellow
}

function Fail {
  param([string]$Text)
  Write-Host "[error] $Text" -ForegroundColor Red
  exit 1
}

function Run {
  param(
    [string]$Command,
    [string]$ErrorText
  )

  Write-Host ""
  Write-Host "> $Command" -ForegroundColor DarkGray
  cmd /c $Command
  if ($LASTEXITCODE -ne 0) {
    Fail "$ErrorText ExitCode=$LASTEXITCODE"
  }
}

function Has-StagedBlockedFiles {
  $blockedPatterns = @(
    '\.env($|\.)',
    '(^|/|\\)secrets?(/|\\)',
    '(^|/|\\)data(/|\\)sqlite(/|\\)',
    '\.sqlite$',
    '\.sqlite3$',
    '\.db$',
    '\.7z$',
    '\.zip$',
    '\.bak$',
    '\.old$',
    '\.tmp$',
    '\.temp$',
    'token',
    'secret',
    'password',
    'credential'
  )

  $files = git diff --cached --name-only
  foreach ($file in $files) {
    $normalized = $file.Replace('\', '/')
    foreach ($pattern in $blockedPatterns) {
      if ($normalized -match $pattern) {
        Write-Host "[blocked] $file" -ForegroundColor Red
        return $true
      }
    }
  }

  return $false
}

if (!(Test-Path ".git")) {
  Fail "Bitte im Repo-Root ausführen: D:\Git\stream-control-center"
}

Write-Step "Repo prüfen"
Run "git status --short --untracked-files=all" "git status fehlgeschlagen."

if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
  $CommitMessage = Read-Host "Commit-Beschreibung eingeben"
}

if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
  Fail "Keine Commit-Beschreibung angegeben."
}

Write-Step "JS-Syntax prüfen"

$syntaxFiles = @(
  "backend\modules\hug.js",
  "htdocs\dashboard\modules\hug.js",
  "htdocs\dashboard\modules\tagebuch.js",
  "htdocs\dashboard\modules\todo.js",
  "htdocs\dashboard\modules\vip.js"
)

foreach ($file in $syntaxFiles) {
  if (Test-Path $file) {
    Run "node -c `"$file`"" "Syntaxfehler in $file."
  }
}

Write-Ok "Syntaxprüfung abgeschlossen."

Write-Step "Änderungen für Commit vormerken"

$addPaths = @(
  "backend",
  "htdocs",
  "config",
  "docs",
  "project-state",
  "tools",
  "check.cmd",
  "commit.cmd",
  "deploy.cmd",
  "pull.cmd",
  "restore.cmd",
  "status.cmd",
  "stepdone.cmd"
)

foreach ($path in $addPaths) {
  if (Test-Path $path) {
    git add $path 2>$null
    if ($LASTEXITCODE -ne 0) {
      Write-Warn "Konnte nicht vormerken: $path"
    }
  }
}

Write-Step "Sicherheitscheck gegen Secrets/DB/Backups"
if (Has-StagedBlockedFiles) {
  git reset
  Fail "Abbruch: Es wurden blockierte Dateien staged. Nichts wurde committed."
}
Write-Ok "Keine blockierten Dateien staged."

Write-Step "Commit und Push"

$staged = git diff --cached --name-only
if ($null -eq $staged -or [string]::IsNullOrWhiteSpace(($staged -join ""))) {
  Write-Warn "Keine Änderungen zum Commit gefunden. Commit/Push wird übersprungen."
} else {
  Run "git status --short" "git status fehlgeschlagen."
  Run "git commit -m `"$CommitMessage`"" "git commit fehlgeschlagen."
  Run "git push origin dev" "git push fehlgeschlagen."
  Write-Ok "Commit und Push abgeschlossen."
}

Write-Step "Live aus GitHub/dev aktualisieren"

if (!(Test-Path "tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd")) {
  Fail "Deploy-Script nicht gefunden: tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd"
}

Run "tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd" "Live-Deploy fehlgeschlagen."

Write-Step "Abschlussstatus"
Run "git status --short --untracked-files=all" "git status Abschluss fehlgeschlagen."

Write-Ok "Fertig. Wenn Backend-Dateien geändert wurden und dein Deploy-Script Node nicht automatisch neu startet, Backend jetzt neu starten."
