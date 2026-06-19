<#
LWG Evening Giveaway/Wheel Test
- Interaktiver Testlauf fuer Loyalty Giveaways + Gluecksrad
- Schreibt lange Antworten in ein Log
- Oeffnet Dashboard/Gluecksrad-Overlay optional im Browser

Ausfuehren:
  powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_giveaway_wheel_test.ps1

Optional:
  powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_giveaway_wheel_test.ps1 -ApiBase "http://127.0.0.1:8080" -ExclusionList ".\lwg_excluded_winners_resolved_YYYYMMDD_HHMMSS.json"
#>
param(
  [string]$ApiBase = "http://127.0.0.1:8080",
  [string]$ExclusionList = "",
  [switch]$NoBrowser
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path (Get-Location) "LWG_EVENING_TEST_$timestamp.log"

function Write-Log {
  param([object]$Text = "")
  $out = if ($null -eq $Text) { "" } else { $Text | Out-String }
  Add-Content -Path $logFile -Value $out -Encoding UTF8
}

function Section {
  param([string]$Title)
  $line = "============================================================"
  Write-Host "`n$line" -ForegroundColor Cyan
  Write-Host $Title -ForegroundColor Cyan
  Write-Host $line -ForegroundColor Cyan
  Write-Log ""
  Write-Log $line
  Write-Log $Title
  Write-Log $line
}

function Ask-YesNo {
  param([string]$Question, [bool]$Default = $true)
  $suffix = if ($Default) { "J/n" } else { "j/N" }
  $answer = Read-Host "$Question [$suffix]"
  if ([string]::IsNullOrWhiteSpace($answer)) { return $Default }
  return @("j","ja","y","yes") -contains $answer.Trim().ToLower()
}

function To-JsonLog {
  param([object]$Value, [int]$Depth = 14)
  try { return ($Value | ConvertTo-Json -Depth $Depth) } catch { return ($Value | Out-String) }
}

function Invoke-LwgApi {
  param(
    [string]$Title,
    [string]$Method = "GET",
    [string]$Path,
    [object]$Body = $null,
    [int]$Depth = 14
  )
  Section $Title
  $uri = if ($Path -match '^https?://') { $Path } else { "$ApiBase$Path" }
  Write-Host "$Method $uri"
  Write-Log "$Method $uri"
  try {
    if ($null -ne $Body) {
      $jsonBody = $Body | ConvertTo-Json -Depth 12
      Write-Log "--- REQUEST BODY ---"
      Write-Log $jsonBody
      $result = Invoke-RestMethod -Method $Method -Uri $uri -ContentType "application/json" -Body $jsonBody
    } else {
      $result = Invoke-RestMethod -Method $Method -Uri $uri
    }
    Write-Log "--- RESPONSE JSON ---"
    Write-Log (To-JsonLog $result $Depth)
    return @{ ok = $true; result = $result }
  } catch {
    Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    Write-Log "FEHLER:"
    Write-Log $_.Exception.Message
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      Write-Log "--- ErrorDetails ---"
      Write-Log $_.ErrorDetails.Message
    }
    return @{ ok = $false; error = $_ }
  }
}

function Short-Status {
  param([object]$Response)
  if (-not $Response.ok) { return }
  $r = $Response.result
  $r | Select-Object ok,module,moduleVersion,moduleBuild,version,lastError | Format-List | Tee-Object -FilePath $logFile -Append
}

function Open-Url {
  param([string]$Url)
  if ($NoBrowser) { return }
  try {
    Start-Process $Url | Out-Null
    Write-Log "Browser geoeffnet: $Url"
  } catch {
    Write-Host "Konnte Browser nicht oeffnen: $Url" -ForegroundColor Yellow
    Write-Log "Browser-Open fehlgeschlagen: $Url"
  }
}

function Select-GiveawayUid {
  Section "Giveaways laden und auswaehlen"
  $resp = Invoke-LwgApi -Title "Giveaway-Liste" -Path "/api/loyalty/giveaways?limit=50" -Depth 10
  if (-not $resp.ok) { return "" }
  $rows = @($resp.result.rows)
  if (-not $rows -or $rows.Count -eq 0) {
    Write-Host "Keine Giveaways gefunden." -ForegroundColor Yellow
    return ""
  }

  for ($i = 0; $i -lt $rows.Count; $i++) {
    $g = $rows[$i]
    $setup = if ($g.setupComplete) { "setup=ok" } else { "setup=offen" }
    $wheel = if ($g.wheelEnabled) { "wheel=ja" } else { "wheel=nein" }
    Write-Host ("[{0}] {1} | {2} | {3} | {4} | {5}" -f ($i+1), $g.title, $g.status, $wheel, $setup, $g.giveawayUid)
  }
  $manual = Read-Host "Nummer waehlen oder Giveaway-UID direkt einfuegen"
  if ($manual -match '^\d+$') {
    $idx = [int]$manual - 1
    if ($idx -ge 0 -and $idx -lt $rows.Count) { return [string]$rows[$idx].giveawayUid }
  }
  return $manual.Trim()
}

Section "LWG Evening Giveaway/Wheel Test gestartet"
Write-Host "Log-Datei: $logFile"
Write-Log "Gestartet: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Log "Arbeitsordner: $(Get-Location)"
Write-Log "ApiBase: $ApiBase"
Write-Log "ExclusionList: $ExclusionList"

if (Ask-YesNo "Dashboard oeffnen?" $true) { Open-Url "$ApiBase/dashboard" }
if (Ask-YesNo "Gluecksrad-Overlay oeffnen?" $true) { Open-Url "$ApiBase/overlays/loyalty/wheel_overlay.html" }

Short-Status (Invoke-LwgApi -Title "Loyalty Core Status" -Path "/api/loyalty/status" -Depth 10)
Short-Status (Invoke-LwgApi -Title "Loyalty Games Status" -Path "/api/loyalty/games/status" -Depth 10)
Short-Status (Invoke-LwgApi -Title "Loyalty Giveaways Status" -Path "/api/loyalty/giveaways/status" -Depth 12)

$uid = Select-GiveawayUid
if ([string]::IsNullOrWhiteSpace($uid)) {
  Write-Host "Abbruch: Keine Giveaway-UID." -ForegroundColor Red
  exit 1
}
Write-Host "Ausgewaehltes Giveaway: $uid" -ForegroundColor Green
Write-Log "Ausgewaehltes Giveaway: $uid"

$detail = Invoke-LwgApi -Title "Giveaway Details" -Path "/api/loyalty/giveaways/$uid" -Depth 16
if ($detail.ok) {
  $g = $detail.result.giveaway
  Write-Host ("Status: {0} | Wheel: {1} | SetupComplete: {2} | CanOpen: {3}" -f $g.status,$g.wheelEnabled,$g.setupComplete,$g.canOpen)
  if ($g.setupIssues -and @($g.setupIssues).Count -gt 0) {
    Write-Host "Setup-Issues gefunden. Details stehen im Log." -ForegroundColor Yellow
    $g.setupIssues | Format-Table code,field,severity,message -AutoSize | Tee-Object -FilePath $logFile -Append
  }
}

Invoke-LwgApi -Title "Bound Wheel" -Path "/api/loyalty/giveaways/$uid/wheel/bound" -Depth 14 | Out-Null
Invoke-LwgApi -Title "Bound Wheel Fields" -Path "/api/loyalty/giveaways/$uid/wheel/bound/fields" -Depth 14 | Out-Null
Invoke-LwgApi -Title "Entries vorher" -Path "/api/loyalty/giveaways/$uid/entries?includeCancelled=true&limit=100" -Depth 12 | Out-Null

if (Ask-YesNo "Test-Entries hinzufuegen? (forrest_test + una_solala)" $false) {
  Invoke-LwgApi -Title "Entry forrest_test" -Method "POST" -Path "/api/loyalty/giveaways/$uid/entries" -Body @{ userLogin = "forrest_test"; userDisplayName = "Forrest_Test"; ticketCount = 1; source = "evening_test" } -Depth 12 | Out-Null
  Invoke-LwgApi -Title "Entry una_solala" -Method "POST" -Path "/api/loyalty/giveaways/$uid/entries" -Body @{ userLogin = "una_solala"; userDisplayName = "una_solala"; ticketCount = 1; source = "evening_test" } -Depth 12 | Out-Null
  Invoke-LwgApi -Title "Entries nach Test-Entry" -Path "/api/loyalty/giveaways/$uid/entries?includeCancelled=true&limit=100" -Depth 12 | Out-Null
}

if ([string]::IsNullOrWhiteSpace($ExclusionList)) {
  $maybe = Read-Host "Pfad zur Exclusion-JSON eintragen oder leer lassen"
  if (-not [string]::IsNullOrWhiteSpace($maybe)) { $ExclusionList = $maybe.Trim('"') }
}

if (-not [string]::IsNullOrWhiteSpace($ExclusionList)) {
  if (Test-Path $ExclusionList) {
    if (Ask-YesNo "Gewinn-Ausschluss zuerst als Dry-Run ausfuehren?" $true) {
      Section "Gewinn-Ausschluss Dry-Run"
      $cmd = "node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=$uid --list=`"$ExclusionList`" --dry-run"
      Write-Host $cmd
      Write-Log $cmd
      cmd /c $cmd 2>&1 | Tee-Object -FilePath $logFile -Append
    }
    if (Ask-YesNo "Gewinn-Ausschluss WIRKLICH anwenden?" $false) {
      Section "Gewinn-Ausschluss anwenden"
      $cmd = "node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=$uid --list=`"$ExclusionList`""
      Write-Host $cmd
      Write-Log $cmd
      cmd /c $cmd 2>&1 | Tee-Object -FilePath $logFile -Append
      Invoke-LwgApi -Title "Entries nach Gewinn-Ausschluss" -Path "/api/loyalty/giveaways/$uid/entries?includeCancelled=true&limit=100" -Depth 12 | Out-Null
    }
  } else {
    Write-Host "Exclusion-Liste nicht gefunden: $ExclusionList" -ForegroundColor Yellow
    Write-Log "Exclusion-Liste nicht gefunden: $ExclusionList"
  }
}

if (Ask-YesNo "Giveaway oeffnen? Nur machen, wenn Test/Stream jetzt bereit ist." $false) {
  Invoke-LwgApi -Title "Giveaway oeffnen" -Method "POST" -Path "/api/loyalty/giveaways/$uid/open" -Body @{ actor = "evening_test"; reason = "evening_test_open" } -Depth 14 | Out-Null
  Invoke-LwgApi -Title "Giveaway nach Open" -Path "/api/loyalty/giveaways/$uid" -Depth 16 | Out-Null
}

if (Ask-YesNo "Vor Close/Draw Gewinn-Ausschluss nochmal anwenden?" $true) {
  if (-not [string]::IsNullOrWhiteSpace($ExclusionList) -and (Test-Path $ExclusionList)) {
    Section "Gewinn-Ausschluss direkt vor Close/Draw"
    $cmd = "node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=$uid --list=`"$ExclusionList`""
    Write-Host $cmd
    Write-Log $cmd
    cmd /c $cmd 2>&1 | Tee-Object -FilePath $logFile -Append
  } else {
    Write-Host "Keine gueltige Exclusion-Liste vorhanden. Uebersprungen." -ForegroundColor Yellow
  }
}

if (Ask-YesNo "Giveaway schliessen?" $false) {
  Invoke-LwgApi -Title "Giveaway schliessen" -Method "POST" -Path "/api/loyalty/giveaways/$uid/close" -Body @{ actor = "evening_test"; reason = "evening_test_close"; silent = $true } -Depth 14 | Out-Null
  Invoke-LwgApi -Title "Giveaway nach Close" -Path "/api/loyalty/giveaways/$uid" -Depth 16 | Out-Null
}

if (Ask-YesNo "Gewinner ziehen?" $false) {
  $draw = Invoke-LwgApi -Title "Draw Winner" -Method "POST" -Path "/api/loyalty/giveaways/$uid/draw" -Body @{ actor = "evening_test"; reason = "evening_test_draw" } -Depth 16
  if ($draw.ok -and $draw.result.winner) {
    Write-Host ("Gewinner: {0} ({1})" -f $draw.result.winner.userDisplayName,$draw.result.winner.userLogin) -ForegroundColor Green
  }
  Invoke-LwgApi -Title "Wheel Permissions nach Draw" -Path "/api/loyalty/giveaways/$uid/wheel/permissions" -Depth 14 | Out-Null
}

Section "Fertig"
Write-Host "Fertig. Log-Datei:" -ForegroundColor Green
Write-Host $logFile -ForegroundColor Green
Write-Log "Beendet: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
