param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$BackupRoot = "D:\Git\stream-control-center_BACKUPS",
  [switch]$IncludeNodeModules
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$projectName = Split-Path $ProjectRoot -Leaf
$backupDir = Join-Path $BackupRoot ("STEP530_FULL_BACKUP_" + $projectName + "_" + $timestamp)
$backupZip = $backupDir + ".zip"
$manifestPath = Join-Path $BackupRoot ("STEP530_BACKUP_MANIFEST_" + $timestamp + ".txt")

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$excludeDirs = @(".git", "node_modules")
if ($IncludeNodeModules) {
  $excludeDirs = @(".git")
}

Write-Host "Backup startet..."
Write-Host ("Quelle: " + $ProjectRoot)
Write-Host ("Ziel:   " + $backupZip)

$robocopyArgs = @(
  $ProjectRoot,
  $backupDir,
  "/MIR",
  "/R:1",
  "/W:1",
  "/NFL",
  "/NDL",
  "/NP",
  "/XD"
) + $excludeDirs

& robocopy @robocopyArgs | Out-Null
$code = $LASTEXITCODE

if ($code -ge 8) {
  throw ("Robocopy fehlgeschlagen. ExitCode: " + $code)
}

if (Test-Path $backupZip) {
  Remove-Item $backupZip -Force
}

Compress-Archive -Path (Join-Path $backupDir "*") -DestinationPath $backupZip -Force

$files = Get-ChildItem -Path $ProjectRoot -Recurse -File |
  Where-Object {
    $_.FullName -notmatch "\\node_modules\\"
  }

$manifest = @()
$manifest += "STEP530 Full Backup Manifest"
$manifest += ("Created: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$manifest += ("ProjectRoot: " + $ProjectRoot)
$manifest += ("BackupDir: " + $backupDir)
$manifest += ("BackupZip: " + $backupZip)
$manifest += ("IncludeNodeModules: " + [bool]$IncludeNodeModules)
$manifest += ("FileCountWithoutNodeModules: " + @($files).Count)
$manifest += ""
$manifest += "Hinweis:"
$manifest += "- .git wird bewusst nicht kopiert."
$manifest += "- node_modules wird standardmäßig nicht kopiert."
$manifest += "- Repo-Stand ist über Git/GitHub wiederherstellbar."
$manifest += "- Dieses Backup dient als Sicherheitskopie vor Cleanup Batch 1."

$manifest | Out-File $manifestPath -Encoding utf8

Write-Host ""
Write-Host "Backup fertig."
Write-Host ("ZIP: " + $backupZip)
Write-Host ("Manifest: " + $manifestPath)
