param(
  [string]$OverlayPath = ".\htdocs\overlays\_overlay-alerts-v2.html"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $OverlayPath)) {
  throw "Overlay file not found: $OverlayPath"
}

$content = Get-Content -Path $OverlayPath -Raw
$checks = [ordered]@{
  stepMarker = $content.Contains("STEP371_ALERT_BUS_SHADOW_ADAPTER")
  busHello = $content.Contains("type: 'bus_hello'")
  busAck = $content.Contains("type: 'bus_ack'")
  normalizer = $content.Contains("function normalizeAlertTransportMessage")
  visualAlertChannel = $content.Contains("channel !== 'visual.alert'")
  legacyStillPresent = $content.Contains("op: 'alert_system', client: 'overlay', event: 'hello'")
  legacyFinishedStillPresent = $content.Contains("op: 'alert_system', client: 'overlay', event: 'finished'")
}

[pscustomobject]$checks | Format-List

$failed = @($checks.GetEnumerator() | Where-Object { $_.Value -ne $true })
if ($failed.Count -gt 0) {
  Write-Host "RESULT=FAILED" -ForegroundColor Red
  exit 1
}

Write-Host "RESULT=OK STEP371 alert bus shadow adapter is present and legacy path is still present." -ForegroundColor Green
