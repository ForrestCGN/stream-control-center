param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$Targets = "pretos1,together_not_alone",
  [switch]$NoForce,
  [switch]$Chat,
  [switch]$Process,
  [switch]$Cleanup,
  [int]$HoldMs = 600000
)

$ErrorActionPreference = "Stop"

$forceValue = if ($NoForce) { 0 } else { 1 }
$chatValue = if ($Chat) { 1 } else { 0 }
$processValue = if ($Process) { 1 } else { 0 }
$cleanupValue = if ($Cleanup) { 1 } else { 0 }

$uri = "$BaseUrl/api/clip-shoutout/debug/test-queue?targets=$([uri]::EscapeDataString($Targets))&force=$forceValue&chat=$chatValue&process=$processValue&cleanup=$cleanupValue&holdMs=$HoldMs"

Write-Host "Clip-Shoutout Queue-Test" -ForegroundColor Cyan
Write-Host "URL: $uri"
Write-Host ""

$result = Invoke-RestMethod $uri

Write-Host "Modul: $($result.module) $($result.moduleVersion)"
Write-Host "OK: $($result.ok)"
Write-Host "Angefragt: $($result.summary.requested) | Eingereiht: $($result.summary.queued) | Blockiert: $($result.summary.blocked) | Nicht eingereiht: $($result.summary.notQueued) | Silent Drops: $($result.summary.silentDrops)"
Write-Host "Erstellte Queue-IDs: $($result.summary.createdIds -join ', ')"
if ($Cleanup) {
  Write-Host "Cleanup: $($result.summary.cleanup.removed) Eintraege entfernt"
}
Write-Host ""

$rows = @()
foreach ($r in $result.results) {
  $rows += [pscustomobject]@{
    Target = $r.target
    Queued = $r.queued
    Blocked = $r.blocked
    SilentDrop = $r.silentDropDetected
    QueueId = $r.displayQueueId
    Status = if ($r.row) { $r.row.status } else { "-" }
    AvailableAt = if ($r.row) { $r.row.availableAt } else { "-" }
    WaitTime = if ($r.notice) { $r.notice.waitTime } else { "-" }
    Reason = $r.reason
  }
}

$rows | Format-Table -AutoSize

Write-Host ""
Write-Host "Queue nach dem Test:" -ForegroundColor Cyan
$queueRows = @()
foreach ($q in $result.after.queue) {
  $queueRows += [pscustomobject]@{
    Id = $q.id
    Target = $q.targetLogin
    Status = $q.status
    AvailableAt = $q.availableAt
    LastError = $q.lastError
    Force = $q.overrideUsed
  }
}
$queueRows | Format-Table -AutoSize

Write-Host ""
if ($result.summary.silentDrops -gt 0) {
  Write-Host "FEHLER: Mindestens ein Request wurde still verworfen." -ForegroundColor Red
  exit 2
}
if ($result.summary.notQueued -gt 0) {
  Write-Host "HINWEIS: Mindestens ein Request wurde nicht eingereiht. Grund siehe Tabelle." -ForegroundColor Yellow
  exit 1
}
Write-Host "PASS: Alle Requests wurden eingereiht oder sauber behandelt." -ForegroundColor Green
