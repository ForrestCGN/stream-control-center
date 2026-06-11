<#
LWG-4O.4 Auto-Claim-Test fuer Giveaway/Wheel
Ziel: ForrestCGN wird sicher Gewinner, weil nur ForrestCGN ein Ticket bekommt.

Voraussetzung:
- Backend laeuft auf http://127.0.0.1:8080
- LWG-4O.4 ist eingespielt
- Twitch-Chat-Events laufen zentral ueber twitch.chat/message
- Der Twitch-Account ForrestCGN schreibt beim Claim-Schritt eine Nachricht in den Chat

Start:
  powershell -ExecutionPolicy Bypass -File .\tools\tests\LWG-4O4_auto_claim_test_ForrestCGN.ps1

Optional:
  powershell -ExecutionPolicy Bypass -File .\tools\tests\LWG-4O4_auto_claim_test_ForrestCGN.ps1 -BaseUrl "http://127.0.0.1:8080" -ClaimTimeoutSeconds 90 -SpinAfterClaim:$true
#>

param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$WinnerLogin = "forrestcgn",
  [string]$WinnerDisplayName = "ForrestCGN",
  [int]$ClaimTimeoutSeconds = 90,
  [bool]$SpinAfterClaim = $true,
  [int]$SpinDurationMs = 7000
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

function Write-Step($Text) {
  Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Write-Ok($Text) {
  Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Warn($Text) {
  Write-Host "[WARN] $Text" -ForegroundColor Yellow
}

function Write-Fail($Text) {
  Write-Host "[FAIL] $Text" -ForegroundColor Red
}

function To-JsonBody($Body) {
  if ($null -eq $Body) { return $null }
  return ($Body | ConvertTo-Json -Depth 20 -Compress)
}

function Invoke-CgnApi {
  param(
    [Parameter(Mandatory=$true)][ValidateSet("GET","POST","PUT","DELETE")][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [object]$Body = $null
  )

  $url = if ($Path.StartsWith("http")) { $Path } else { "$BaseUrl$Path" }
  try {
    if ($null -eq $Body) {
      return Invoke-RestMethod -Method $Method -Uri $url
    }
    return Invoke-RestMethod -Method $Method -Uri $url -ContentType "application/json" -Body (To-JsonBody $Body)
  } catch {
    Write-Fail "$Method $url fehlgeschlagen"
    if ($_.Exception.Response) {
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $text = $reader.ReadToEnd()
        Write-Host $text -ForegroundColor DarkYellow
      } catch {}
    } else {
      Write-Host $_.Exception.Message -ForegroundColor DarkYellow
    }
    throw
  }
}

function First-ExistingValue {
  param([object]$Obj, [string[]]$Names)
  foreach ($name in $Names) {
    if ($null -ne $Obj -and $Obj.PSObject.Properties.Name -contains $name) {
      $value = $Obj.$name
      if ($null -ne $value -and "$value" -ne "") { return $value }
    }
  }
  return $null
}

function Get-GiveawayUidFromResponse($Response) {
  $direct = First-ExistingValue $Response @("giveawayUid", "uid")
  if ($direct) { return "$direct" }
  if ($Response.giveaway) {
    $nested = First-ExistingValue $Response.giveaway @("giveawayUid", "giveaway_uid", "uid")
    if ($nested) { return "$nested" }
  }
  throw "Konnte giveawayUid aus Create-Response nicht erkennen."
}

function Get-WinnerUidFromResponse($Response) {
  if ($Response.winner) {
    $nested = First-ExistingValue $Response.winner @("winnerUid", "winner_uid", "uid")
    if ($nested) { return "$nested" }
  }
  $direct = First-ExistingValue $Response @("winnerUid", "winner_uid")
  if ($direct) { return "$direct" }
  throw "Konnte winnerUid aus Draw-Response nicht erkennen."
}

function Get-WinnerRows($GiveawayUid) {
  $res = Invoke-CgnApi GET "/api/loyalty/giveaways/$GiveawayUid/winners"
  if ($res.rows) { return @($res.rows) }
  if ($res.winners) { return @($res.winners) }
  return @()
}

function Get-ClaimStatusForWinner($GiveawayUid, $WinnerUid) {
  $rows = Get-WinnerRows $GiveawayUid
  $winner = $rows | Where-Object { ($_.winnerUid -eq $WinnerUid) -or ($_.winner_uid -eq $WinnerUid) } | Select-Object -First 1
  if (-not $winner) { return @{ found = $false; status = "winner_missing"; winner = $null } }

  $metadata = $winner.metadata
  if (-not $metadata -and $winner.metadataJson) {
    try { $metadata = $winner.metadataJson | ConvertFrom-Json -ErrorAction Stop } catch { $metadata = $null }
  }
  if (-not $metadata -and $winner.metadata_json) {
    try { $metadata = $winner.metadata_json | ConvertFrom-Json -ErrorAction Stop } catch { $metadata = $null }
  }

  $claim = $null
  if ($metadata -and ($metadata.PSObject.Properties.Name -contains "chatClaim")) { $claim = $metadata.chatClaim }
  $status = if ($claim -and ($claim.PSObject.Properties.Name -contains "status")) { "$($claim.status)" } else { "missing" }
  return @{ found = $true; status = $status; winner = $winner; claim = $claim }
}

Write-Step "1. Modulstatus pruefen"
$status = Invoke-CgnApi GET "/api/loyalty/giveaways/chat-claim/status"
$status | ConvertTo-Json -Depth 12
if ($status.moduleBuild -ne "STEP_LWG_4O_4") {
  Write-Warn "Erwartet STEP_LWG_4O_4, gefunden: $($status.moduleBuild)"
}
if (-not $status.subscriber.registered) {
  throw "Chat-Claim-Subscriber ist nicht registered. Abbruch."
}
Write-Ok "Claim-Subscriber ist aktiv."

Write-Step "2. Test-Giveaway mit gebundenem Gluecksrad erstellen"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$createBody = @{
  title = "LWG-4O.4 Auto-Claim-Test ForrestCGN $stamp"
  description = "Automatischer Test: ForrestCGN soll Gewinner sein; das Claim-Fenster muss automatisch beim Draw entstehen."
  mode = "wheel_single"
  wheelEnabled = $true
  winnerCount = 1
  maxTicketsPerUser = 1
  costAmount = 0
  firstTicketFree = $true
  chatClaim = @{
    enabled = $true
    mode = "any_message"
    timeoutSeconds = $ClaimTimeoutSeconds
    activateWheelAfterClaim = $true
  }
  actor = "LWG-4O.4-test-script"
  metadata = @{
    test = $true
    step = "LWG-4O.4"
    intendedWinner = $WinnerDisplayName
  }
}
$create = Invoke-CgnApi POST "/api/loyalty/giveaways" $createBody
$giveawayUid = Get-GiveawayUidFromResponse $create
Write-Ok "Giveaway erstellt: $giveawayUid"

Write-Step "3. Bound-Wheel-Felder anlegen"
$fieldA = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/wheel/bound/fields" @{
  label = "Test-Gewinn A"
  subLabel = "Claim-Test"
  weight = 1
  quantityTotal = 1
  quantityRemaining = 1
  removeAfterWin = $true
  rewardType = "test"
  rewardValue = "A"
  colorA = "#7c3aed"
  colorB = "#22d3ee"
  metadata = @{ test = $true; step = "LWG-4O.4" }
}
$fieldB = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/wheel/bound/fields" @{
  label = "Test-Gewinn B"
  subLabel = "Claim-Test"
  weight = 1
  quantityTotal = 1
  quantityRemaining = 1
  removeAfterWin = $true
  rewardType = "test"
  rewardValue = "B"
  colorA = "#2563eb"
  colorB = "#a855f7"
  metadata = @{ test = $true; step = "LWG-4O.4" }
}
$fields = Invoke-CgnApi GET "/api/loyalty/giveaways/$giveawayUid/wheel/bound/fields"
Write-Ok "Felder vorhanden: $($fields.fieldCount)"

Write-Step "4. Giveaway oeffnen"
$open = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/open" @{ actor = "LWG-4O.4-test-script" }
Write-Ok "Giveaway Status nach Open: $($open.giveaway.status)"

Write-Step "5. Ticket fuer ForrestCGN erstellen"
$entry = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/entries" @{
  userLogin = $WinnerLogin
  userDisplayName = $WinnerDisplayName
  ticketCount = 1
  isSubscriber = $false
  source = "LWG-4O.4-test-script"
}
Write-Ok "Entry erstellt fuer $WinnerDisplayName"

Write-Step "6. Teilnahme schliessen"
$close = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/close-entries" @{
  actor = "LWG-4O.4-test-script"
  silent = $true
}
Write-Ok "Giveaway Status nach Close: $($close.giveaway.status)"

Write-Step "7. Gewinner ziehen"
$draw = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/draw" @{
  actor = "LWG-4O.4-test-script"
}
$winnerUid = Get-WinnerUidFromResponse $draw
$drawnLogin = $draw.winner.userLogin
$drawnDisplay = $draw.winner.userDisplayName
Write-Ok "Gezogener Gewinner: $drawnDisplay ($drawnLogin) / winnerUid=$winnerUid"

if (("$drawnLogin").ToLower() -ne $WinnerLogin.ToLower()) {
  throw "Unerwarteter Gewinner: $drawnLogin. Erwartet: $WinnerLogin"
}

Write-Step "8. Automatisch geoeffnetes Chat-Claim-Fenster pruefen"
$claimInfo = Get-ClaimStatusForWinner $giveawayUid $winnerUid
if ($claimInfo.status -ne "pending") {
  throw "Erwarteter ClaimStatus nach Draw: pending. Gefunden: $($claimInfo.status)"
}
Write-Ok "Claim-Fenster wurde automatisch geoeffnet fuer $WinnerDisplayName. Timeout: $ClaimTimeoutSeconds Sekunden."

if ($draw.wheelPermission -and $draw.wheelPermission.permissionUid) {
  Write-Warn "Draw hat bereits eine Wheel-Permission geliefert. Erwartet war bei Claim-Pflicht eigentlich Freigabe erst nach Chat-Claim."
} else {
  Write-Ok "Wheel-Permission wird korrekt bis zur Chat-Bestaetigung zurueckgehalten."
}

Write-Host "`nJETZT TESTEN:" -ForegroundColor Magenta
Write-Host "Schreibe bitte als $WinnerDisplayName irgendeine Nachricht in den Twitch-Chat." -ForegroundColor Magenta
Write-Host "Das Script wartet automatisch auf metadata.chatClaim.status = confirmed." -ForegroundColor Magenta

$deadline = (Get-Date).AddSeconds($ClaimTimeoutSeconds + 20)
$confirmed = $false
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 3
  $claimStatus = Get-ClaimStatusForWinner $giveawayUid $winnerUid
  $globalStatus = Invoke-CgnApi GET "/api/loyalty/giveaways/chat-claim/status"
  Write-Host ("ClaimStatus={0} | seen={1} matched={2} confirmed={3} skipped={4} lastUser={5}" -f `
    $claimStatus.status, `
    $globalStatus.subscriber.seen, `
    $globalStatus.subscriber.matched, `
    $globalStatus.subscriber.confirmed, `
    $globalStatus.subscriber.skipped, `
    $globalStatus.subscriber.lastUserLogin)

  if ($claimStatus.status -eq "confirmed") {
    $confirmed = $true
    break
  }
}

if (-not $confirmed) {
  Write-Fail "Claim wurde nicht bestaetigt. Pruefe, ob Twitch-Chat-Events ueber twitch.chat/message eingehen und ob die Nachricht wirklich von $WinnerLogin kam."
  Write-Host "GiveawayUid: $giveawayUid"
  Write-Host "WinnerUid:   $winnerUid"
  exit 2
}

Write-Ok "Claim bestaetigt: $WinnerDisplayName wurde im Chat erkannt."

if ($SpinAfterClaim) {
  Write-Step "9. Optional: Wheel-Claim/Spin fuer ForrestCGN ausloesen"
  $spin = Invoke-CgnApi POST "/api/loyalty/giveaways/$giveawayUid/wheel/claim" @{
    userLogin = $WinnerLogin
    userDisplayName = $WinnerDisplayName
    durationMs = $SpinDurationMs
    source = "LWG-4O.4-test-script"
  }
  Write-Ok "Wheel-Claim/Spin ausgeloest."
  $spin | ConvertTo-Json -Depth 20
} else {
  Write-Warn "SpinAfterClaim=false, Rad-Drehung wurde nicht ausgeloest."
}

Write-Step "10. Abschlussdaten"
$finalGiveaway = Invoke-CgnApi GET "/api/loyalty/giveaways/$giveawayUid"
$finalWinners = Invoke-CgnApi GET "/api/loyalty/giveaways/$giveawayUid/winners"
$finalClaimStatus = Invoke-CgnApi GET "/api/loyalty/giveaways/chat-claim/status"

Write-Host "GiveawayUid: $giveawayUid"
Write-Host "WinnerUid:   $winnerUid"
Write-Host "Status:      $($finalGiveaway.giveaway.status)"
Write-Host "Claim seen:  $($finalClaimStatus.subscriber.seen)"
Write-Host "Claim match: $($finalClaimStatus.subscriber.matched)"
Write-Host "Claim conf.: $($finalClaimStatus.subscriber.confirmed)"

Write-Ok "Kompletter LWG-4O.4 Auto-Claim-Test abgeschlossen."
