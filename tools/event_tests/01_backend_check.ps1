. "$PSScriptRoot\_common.ps1"

Write-Step "Backend Status"
$status = Invoke-Evs -Method GET -Path "/status"
$status | ConvertTo-Json -Depth 8

Write-Step "Routen vorhanden?"
$routes = Invoke-Evs -Method GET -Path "/routes"
$needed = @(
  "/api/stream-events/chat-runtime/create-stealth-test-event",
  "/api/stream-events/chat-runtime/test-chat",
  "/api/stream-events/sound-runtime/next-round",
  "/api/stream-events/events/:eventUid/finish",
  "/api/stream-events/events/:eventUid/finale/start",
  "/api/stream-events/winner-finale/demo-random"
)
foreach ($n in $needed) {
  $found = ($routes.routes | Where-Object { $_.path -eq $n })
  if ($found) { Write-Ok "$n" } else { Write-WarnLine "Route nicht gefunden: $n" }
}
