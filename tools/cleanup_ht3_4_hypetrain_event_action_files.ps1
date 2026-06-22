# HT3.4 Cleanup: remove old separated HypeTrain Event-Actions dashboard files
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$targets = @(
  Join-Path $root "htdocs\dashboard\modules\hypetrain_event_actions.js",
  Join-Path $root "htdocs\dashboard\modules\hypetrain_event_actions.css"
)
foreach ($target in $targets) {
  if (Test-Path $target) {
    Remove-Item $target -Force
    Write-Host "Entfernt: $target"
  } else {
    Write-Host "Nicht vorhanden: $target"
  }
}
