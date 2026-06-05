param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [int]$Limit = 20,
  [switch]$Clear,
  [switch]$Json
)

$ErrorActionPreference = "Stop"
$uri = "$BaseUrl/api/clip-shoutout/debug/intake-trace?limit=$Limit"
if ($Clear) { $uri += "&clear=1" }

$result = Invoke-RestMethod $uri
if ($Json) {
  $result | ConvertTo-Json -Depth 20
  exit 0
}

Write-Host "Clip-Shoutout Intake-Trace"
Write-Host "URL: $uri"
Write-Host "Modul: $($result.module) $($result.moduleVersion)"
Write-Host "Eintraege: $($result.count) | Cleared: $($result.cleared)"
Write-Host ""

if (-not $result.traces -or $result.traces.Count -eq 0) {
  Write-Host "Keine Intake-Traces vorhanden. Jetzt im Chat !so / !vso testen und danach dieses Tool erneut ausführen."
  exit 0
}

$rows = @()
foreach ($t in $result.traces) {
  $parse = $null
  $target = ""
  $trigger = ""
  $queueId = ""
  $reason = ""
  foreach ($s in @($t.stages)) {
    if ($s.step -eq "wrapper.parse_result") {
      $parse = $s.data
      if ($parse.parsedCommand) {
        $trigger = [string]$parse.parsedCommand.trigger
        $target = [string]$parse.parsedCommand.target
      }
    }
    if ($s.step -eq "wrapper.handleRun_result") {
      if ($s.data.displayQueueId) { $queueId = [string]$s.data.displayQueueId }
      if ($s.data.reason) { $reason = [string]$s.data.reason }
    }
    if ($s.step -eq "finish") {
      if ($s.data.reason) { $reason = [string]$s.data.reason }
      if ($s.data.displayQueueId) { $queueId = [string]$s.data.displayQueueId }
    }
  }

  $rows += [pscustomobject]@{
    CreatedAt = $t.createdAt
    Outcome = $t.outcome
    Trigger = $trigger
    Target = $target
    User = $t.userLogin
    QueueId = $queueId
    Reason = $reason
    RawMessage = $t.rawMessage
  }
}

$rows | Format-Table -AutoSize
Write-Host ""
Write-Host "Detailansicht als JSON:"
Write-Host "powershell -ExecutionPolicy Bypass -File .\tools\show_clip_shoutout_intake_trace.ps1 -Json"
