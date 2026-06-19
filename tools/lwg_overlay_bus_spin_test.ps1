param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$GiveawayUid = "",
  [switch]$OpenOverlay
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$log = Join-Path (Get-Location) "LWG_OVERLAY_BUS_SPIN_TEST_$ts.log"
function Log($m="") { Add-Content -Path $log -Encoding UTF8 -Value ($m | Out-String); Write-Host $m }
function ApiGet($p) { $u="$BaseUrl$p"; Log "GET $u"; $r=Invoke-RestMethod -Method Get -Uri $u; Add-Content -Path $log -Encoding UTF8 -Value ($r|ConvertTo-Json -Depth 20); return $r }
function ApiPost($p,$b=@{}) { $u="$BaseUrl$p"; Log "POST $u"; $j=$b|ConvertTo-Json -Depth 20; Add-Content -Path $log -Encoding UTF8 -Value $j; $r=Invoke-RestMethod -Method Post -Uri $u -ContentType "application/json" -Body $j; Add-Content -Path $log -Encoding UTF8 -Value ($r|ConvertTo-Json -Depth 20); return $r }

if ($OpenOverlay) { Start-Process "$BaseUrl/overlays/loyalty/wheel_overlay.html" }
if ([string]::IsNullOrWhiteSpace($GiveawayUid)) { $GiveawayUid = Read-Host "GiveawayUid für Bound-Wheel-Felder" }

Log "Overlay Bus Spin Test: $GiveawayUid"
$fieldsResult = ApiGet "/api/loyalty/giveaways/$GiveawayUid/wheel/bound/fields"
$fields = @()
if ($fieldsResult.fields) { $fields = @($fieldsResult.fields) } elseif ($fieldsResult.rows) { $fields = @($fieldsResult.rows) }
if ($fields.Count -lt 1) { throw "Keine Bound-Wheel-Felder gefunden." }
Log "Felder: $($fields.Count)"

$body = @{
  source = "overlay_bus_test"
  sourceRefUid = $GiveawayUid
  userLogin = "overlay_test"
  userDisplayName = "Overlay_Test"
  durationMs = 4500
  extraTurns = 5
  minVisibleSlots = 12
  boundWheelFields = $fields
  metadata = @{ test = "overlay_bus_spin"; giveawayUid = $GiveawayUid }
}
$r = ApiPost "/api/loyalty/games/wheel/spin" $body
Log "Spin gestartet: ok=$($r.ok) session=$($r.sessionUid) result=$($r.selectedFieldLabel)"
Start-Sleep -Seconds 8
$status = ApiGet "/api/loyalty/games/wheel/status"
Log "Wheel running nach Wartezeit: $($status.running)"
ApiPost "/api/loyalty/games/wheel/reset" @{ source="overlay_bus_test_reset" } | Out-Null
Log "Reset gesendet. Overlay sollte wieder ausgeblendet/transparent sein."
Log "Log-Datei: $log"
Write-Host "Fertig. Log-Datei: $log"
