param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $ProjectRoot "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$candidates = @(
  "_live_copy_backup",
  "backend/modules/birthday.js.step275b.bak",
  "backend/modules/media.js.step275a.bak",
  "backend/modules/sound_system.js.step275a.bak",
  "htdocs/dashboard/app.js.bak_STEP274B",
  "htdocs/dashboard/index.html.bak_STEP274B"
)

$reportPath = Join-Path $OutDir "step530_cleanup_batch1_dryrun.txt"
$report = @()
$report += "STEP530 Cleanup Batch 1 Dry Run"
$report += ("Generated: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$report += ("ProjectRoot: " + $ProjectRoot)
$report += ""
$report += "Regel:"
$report += "- Das ist nur ein Dry-Run."
$report += "- Es wird nichts gelöscht."
$report += "- Es werden nur sehr wahrscheinliche Altlasten geprüft."
$report += ""

foreach ($candidate in $candidates) {
  $full = Join-Path $ProjectRoot $candidate

  if (Test-Path $full) {
    $item = Get-Item $full
    if ($item.PSIsContainer) {
      $count = @(Get-ChildItem -Path $full -Recurse -File).Count
      $report += ("FOUND DIR  | " + $candidate + " | files=" + $count)
    } else {
      $report += ("FOUND FILE | " + $candidate + " | bytes=" + $item.Length)
    }
  } else {
    $report += ("MISSING    | " + $candidate)
  }
}

$report += ""
$report += "Nächster Schritt:"
$report += "Wenn diese Liste plausibel ist, kann Batch 1 als Quarantine-Cleanup ausgeführt werden."
$report += "Dabei werden die Kandidaten nicht endgültig gelöscht, sondern nach _cleanup_quarantine/STEP530 verschoben."

$report | Out-File $reportPath -Encoding utf8

Write-Host ""
Write-Host "Dry-Run fertig."
Write-Host ("Report: " + $reportPath)
