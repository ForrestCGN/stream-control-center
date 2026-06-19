<# 
  Loyalty Giveaway Wheel Interactive Test
  STEP: LWG TESTSCRIPT 1.2 - Interactive Giveaway Wheel Systemtest

  Zweck:
  - Testet ein kopiertes Giveaway von Anfang bis Ende.
  - 1 gesperrter User wird per API hinzugefügt.
  - 3 erlaubte User treten per Chat mit !ticket bei.
  - Es wird so lange ausgelost, bis kein eligible User mehr vorhanden ist.
  - Jeder Gewinner muss selbst im Chat !wheel oder !rad ausführen.
  - Das Script führt KEINEN automatischen Wheel-Claim-Fallback per API aus.
  - Jeder Schritt wird ausführlich geloggt.

  Standard-Test-Giveaway:
  - giveaway_1781865593438_453d331727fe47d6
#>

[CmdletBinding()]
param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$GiveawayUid = "giveaway_1781865593438_453d331727fe47d6",
  [string]$BlockedUser = "una_solala",
  [int]$ExpectedChatUsers = 3,
  [switch]$SkipOpenDrawBlockTest,
  [switch]$NoPause
)

Set-StrictMode -Off
$ErrorActionPreference = "Stop"
# Kein StrictMode: API-Antworten liefern je nach Route camelCase/snake_case und teils fehlende Felder.
# Fehlende Eigenschaften sollen im Testscript als $null behandelt werden, nicht als Script-Abbruch.

$Script:ApiCounter = 0
$Script:Result = "RUNNING"
$Script:Failures = New-Object System.Collections.Generic.List[string]
$Script:Warnings = New-Object System.Collections.Generic.List[string]
$Script:Steps = New-Object System.Collections.Generic.List[object]
$Script:Rounds = New-Object System.Collections.Generic.List[object]

function Get-RepoRoot {
  $scriptDir = Split-Path -Parent $MyInvocation.ScriptName
  if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
  $candidate = Resolve-Path (Join-Path $scriptDir "..\..") -ErrorAction SilentlyContinue
  if ($candidate) { return $candidate.Path }
  return (Get-Location).Path
}

$RepoRoot = Get-RepoRoot
$RunStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogRoot = Join-Path $RepoRoot "test-logs\loyalty_giveaway_wheel_interactive_$RunStamp"
$ApiDir = Join-Path $LogRoot "api"
New-Item -ItemType Directory -Path $ApiDir -Force | Out-Null

$LogFile = Join-Path $LogRoot "run.log"
$JsonFile = Join-Path $LogRoot "run.json"
$SummaryFile = Join-Path $LogRoot "summary.txt"

function ConvertTo-JsonSafe {
  param([object]$Value, [int]$Depth = 80)
  try {
    return ($Value | ConvertTo-Json -Depth $Depth)
  } catch {
    return (@{ ok = $false; serializationError = $_.Exception.Message; valueType = if ($null -eq $Value) { "null" } else { $Value.GetType().FullName } } | ConvertTo-Json -Depth 10)
  }
}

function Write-Log {
  param(
    [string]$Level,
    [string]$Message,
    [object]$Data = $null
  )

  $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"), $Level, $Message
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding UTF8

  if ($null -ne $Data) {
    $json = ConvertTo-JsonSafe $Data 40
    Add-Content -Path $LogFile -Value $json -Encoding UTF8
  }
}

function Add-Step {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Message,
    [object]$Data = $null
  )
  $Script:Steps.Add([pscustomobject]@{
    at = (Get-Date).ToUniversalTime().ToString("o")
    name = $Name
    status = $Status
    message = $Message
    data = $Data
  }) | Out-Null
}

function Pass {
  param([string]$Name, [string]$Message, [object]$Data = $null)
  Write-Log "PASS" $Message $Data
  Add-Step $Name "PASS" $Message $Data
}

function Warn {
  param([string]$Name, [string]$Message, [object]$Data = $null)
  $Script:Warnings.Add($Message) | Out-Null
  Write-Log "WARN" $Message $Data
  Add-Step $Name "WARN" $Message $Data
}

function Fail {
  param([string]$Name, [string]$Message, [object]$Data = $null, [switch]$Stop)
  $Script:Failures.Add($Message) | Out-Null
  Write-Log "FAIL" $Message $Data
  Add-Step $Name "FAIL" $Message $Data
  if ($Stop) {
    $Script:Result = "FAIL"
    throw $Message
  }
}

function Save-Api {
  param(
    [string]$Name,
    [object]$Data
  )
  $Script:ApiCounter++
  $safeName = ($Name -replace '[^a-zA-Z0-9_\-\.]', '_')
  $file = Join-Path $ApiDir ("{0:000}_{1}.json" -f $Script:ApiCounter, $safeName)
  ConvertTo-JsonSafe $Data 90 | Set-Content -Path $file -Encoding UTF8
  return $file
}

function Invoke-SccJson {
  param(
    [ValidateSet("GET","POST","PUT","DELETE")]
    [string]$Method = "GET",
    [string]$Url,
    [object]$Body = $null,
    [string]$ApiName = "api"
  )

  $fullUrl = if ($Url -match '^https?://') { $Url } else { "$BaseUrl$Url" }
  Write-Log "API" "$Method $fullUrl"

  try {
    if ($null -ne $Body) {
      $jsonBody = ConvertTo-JsonSafe $Body 50
      $result = Invoke-RestMethod -Method $Method -Uri $fullUrl -ContentType "application/json; charset=utf-8" -Body $jsonBody
    } else {
      $result = Invoke-RestMethod -Method $Method -Uri $fullUrl
    }

    $file = Save-Api $ApiName $result
    Write-Log "API" "Response gespeichert: $file"
    return $result
  } catch {
    $payload = [ordered]@{
      ok = $false
      exception = $_.Exception.Message
      url = $fullUrl
      method = $Method
    }

    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      $payload.raw = [string]$_.ErrorDetails.Message
      try {
        $parsedDetails = ([string]$_.ErrorDetails.Message) | ConvertFrom-Json
        $payload.parsed = $parsedDetails
        if ($parsedDetails.error) { $payload.error = $parsedDetails.error }
        if ($parsedDetails.message) { $payload.message = $parsedDetails.message }
      } catch {
        $payload.errorDetailsParseError = $_.Exception.Message
      }
    }

    $resp = $_.Exception.Response
    if ($resp) {
      try {
        $payload.statusCode = [int]$resp.StatusCode
        $payload.statusDescription = [string]$resp.StatusDescription
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $text = $reader.ReadToEnd()
        $payload.raw = $text
        try {
          $parsed = $text | ConvertFrom-Json
          $payload.parsed = $parsed
          if ($parsed.error) { $payload.error = $parsed.error }
          if ($parsed.message) { $payload.message = $parsed.message }
        } catch {
          $payload.parseError = $_.Exception.Message
        }
      } catch {
        $payload.responseReadError = $_.Exception.Message
      }
    }

    $obj = [pscustomobject]$payload
    $file = Save-Api $ApiName $obj
    Write-Log "API_ERROR" "Fehlerantwort gespeichert: $file" $obj
    return $obj
  }
}

function Get-ApiError {
  param([object]$Response)
  if ($null -eq $Response) { return "" }
  if ($Response.error) { return "$($Response.error)" }
  if ($Response.parsed -and $Response.parsed.error) { return "$($Response.parsed.error)" }
  if ($Response.raw) {
    try {
      $parsedRaw = "$($Response.raw)" | ConvertFrom-Json
      if ($parsedRaw.error) { return "$($parsedRaw.error)" }
    } catch { }
    if ("$($Response.raw)" -match 'giveaway_draw_requires_closed_entries') { return "giveaway_draw_requires_closed_entries" }
    if ("$($Response.raw)" -match 'no_weighted_entries') { return "no_weighted_entries" }
    if ("$($Response.raw)" -match 'giveaway_no_eligible_entries') { return "giveaway_no_eligible_entries" }
  }
  if ($Response.exception -and "$($Response.exception)" -match 'giveaway_draw_requires_closed_entries') { return "giveaway_draw_requires_closed_entries" }
  return ""
}

function Prompt-Continue {
  param([string]$Message)
  Write-Log "WAIT" $Message
  if ($NoPause) {
    Write-Log "CONFIRM" "NoPause aktiv, automatische Fortsetzung."
    return $true
  }

  $answer = Read-Host "$Message`nWeiter mit ENTER, Abbruch mit N"
  Add-Step "manual_confirm" "CONFIRM" $Message @{ answer = $answer }
  Write-Log "CONFIRM" "Antwort: $answer"
  if ($answer -match '^(n|no|nein|abbruch|stop)$') {
    $Script:Result = "STOPPED"
    throw "Manuell abgebrochen: $Message"
  }
  return $true
}

function Prompt-YesNo {
  param([string]$Message, [bool]$DefaultYes = $true)
  Write-Log "WAIT" $Message
  if ($NoPause) {
    Write-Log "CONFIRM" "NoPause aktiv, Default=$DefaultYes."
    return $DefaultYes
  }

  $suffix = if ($DefaultYes) { "[J/n]" } else { "[j/N]" }
  $answer = Read-Host "$Message $suffix"
  Add-Step "manual_yes_no" "CONFIRM" $Message @{ answer = $answer; defaultYes = $DefaultYes }
  Write-Log "CONFIRM" "Antwort: $answer"

  if ([string]::IsNullOrWhiteSpace($answer)) { return $DefaultYes }
  return ($answer -match '^(j|ja|y|yes)$')
}

function Get-DataRows {
  param([object]$Response)
  if ($null -eq $Response) { return @() }
  $rows = Get-PropValue $Response @("rows") $null
  if ($null -ne $rows) { return @($rows) }
  $entries = Get-PropValue $Response @("entries") $null
  if ($null -ne $entries) { return @($entries) }
  $winners = Get-PropValue $Response @("winners") $null
  if ($null -ne $winners) { return @($winners) }
  $fields = Get-PropValue $Response @("fields") $null
  if ($null -ne $fields) { return @($fields) }
  $data = Get-PropValue $Response @("data") $null
  if ($null -ne $data) {
    $dataRows = Get-PropValue $data @("rows") $null
    if ($null -ne $dataRows) { return @($dataRows) }
  }
  return @()
}

function Normalize-Login {
  param([string]$Login)
  return ([string]$Login).Trim().TrimStart("@").ToLowerInvariant()
}

function Get-PropValue {
  param(
    [object]$Object,
    [string[]]$Names,
    [object]$Default = $null
  )
  if ($null -eq $Object) { return $Default }
  foreach ($name in $Names) {
    try {
      $prop = $Object.PSObject.Properties[$name]
      if ($null -ne $prop) { return $prop.Value }
    } catch {}
  }
  return $Default
}

function Test-IsDeletedFlag {
  param([object]$Object)
  $v = Get-PropValue $Object @("deletedAt", "deleted_at", "deleted") $null
  if ($null -eq $v) { return $false }
  if ($v -is [bool]) { return $v }
  $s = ([string]$v).Trim()
  return -not [string]::IsNullOrWhiteSpace($s)
}

function Get-NumberValue {
  param([object]$Object, [string[]]$Names, [double]$Default = 0)
  $v = Get-PropValue $Object $Names $null
  if ($null -eq $v) { return $Default }
  try { return [double]$v } catch { return $Default }
}


function Get-Giveaway {
  param([string]$StepName = "giveaway")
  $r = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/$GiveawayUid" -ApiName $StepName
  $g = Get-PropValue $r @("giveaway") $null
  if ($null -ne $g) { return $g }
  return $r
}

function Get-Entries {
  param([string]$StepName = "entries")
  $r = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/$GiveawayUid/entries?limit=500" -ApiName $StepName
  return @(Get-DataRows $r)
}

function Get-Winners {
  param([string]$StepName = "winners")
  $r = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/$GiveawayUid/winners?limit=500" -ApiName $StepName
  return @(Get-DataRows $r)
}

function Get-Permissions {
  param([string]$StepName = "permissions")
  $r = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/$GiveawayUid/wheel/permissions?limit=500" -ApiName $StepName
  return @(Get-DataRows $r)
}

function Get-BoundFields {
  param([string]$StepName = "bound_fields")
  $r = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/$GiveawayUid/wheel/bound/fields?limit=500" -ApiName $StepName
  return @(Get-DataRows $r)
}

function Get-AvailableFields {
  param([array]$Fields)
  return @($Fields | Where-Object {
    $enabled = Get-PropValue $_ @("enabled") $false
    $weight = Get-NumberValue $_ @("weight") 0
    $quantityRemaining = Get-NumberValue $_ @("quantityRemaining", "quantity_remaining") 0
    $quantityTotal = Get-NumberValue $_ @("quantityTotal", "quantity_total") 0
    (($enabled -eq $true) -or ($enabled -eq 1) -or ([string]$enabled -eq "true")) -and
    -not (Test-IsDeletedFlag $_) -and
    ($weight -gt 0) -and
    (($quantityRemaining -gt 0) -or ($quantityTotal -eq 0))
  })
}

function Get-ActiveEntries {
  param([array]$Entries)
  return @($Entries | Where-Object { "$($_.status)" -eq "active" })
}

function Find-WinnerByUid {
  param([array]$Winners, [string]$WinnerUid)
  return $Winners | Where-Object { "$($_.winnerUid)" -eq $WinnerUid -or "$($_.winner_uid)" -eq $WinnerUid } | Select-Object -First 1
}

function Get-WinnerUid {
  param([object]$Winner)
  if ($null -eq $Winner) { return "" }
  if ($Winner.winnerUid) { return "$($Winner.winnerUid)" }
  if ($Winner.winner_uid) { return "$($Winner.winner_uid)" }
  return ""
}

function Get-WinnerLogin {
  param([object]$Winner)
  if ($null -eq $Winner) { return "" }
  if ($Winner.userLogin) { return Normalize-Login "$($Winner.userLogin)" }
  if ($Winner.user_login) { return Normalize-Login "$($Winner.user_login)" }
  return ""
}

function Get-WinnerDisplayName {
  param([object]$Winner)
  if ($null -eq $Winner) { return "" }
  if ($Winner.userDisplayName) { return "$($Winner.userDisplayName)" }
  if ($Winner.user_display_name) { return "$($Winner.user_display_name)" }
  $login = Get-WinnerLogin $Winner
  return $login
}

function Get-WinnerStatus {
  param([object]$Winner)
  if ($null -eq $Winner) { return "" }
  if ($Winner.status) { return "$($Winner.status)" }
  return ""
}

function Get-ExclusionInfo {
  param([object]$DrawResponse)
  if ($DrawResponse.exclusionInfo) { return $DrawResponse.exclusionInfo }
  if ($DrawResponse.winner -and $DrawResponse.winner.metadata -and $DrawResponse.winner.metadata.fairness -and $DrawResponse.winner.metadata.fairness.exclusionInfo) {
    return $DrawResponse.winner.metadata.fairness.exclusionInfo
  }
  if ($DrawResponse.winner -and $DrawResponse.winner.metadata -and $DrawResponse.winner.metadata.exclusionInfo) {
    return $DrawResponse.winner.metadata.exclusionInfo
  }
  return $null
}

function Write-FinalFiles {
  param([object]$FinalState = $null)

  $summary = New-Object System.Collections.Generic.List[string]
  $summary.Add("TEST RESULT: $Script:Result") | Out-Null
  $summary.Add("GiveawayUid: $GiveawayUid") | Out-Null
  $summary.Add("BlockedUser: $BlockedUser") | Out-Null
  $summary.Add("ExpectedChatUsers: $ExpectedChatUsers") | Out-Null
  $summary.Add("Started log folder: $LogRoot") | Out-Null
  $summary.Add("") | Out-Null
  $summary.Add("Failures:") | Out-Null
  if ($Script:Failures.Count -eq 0) { $summary.Add("- keine") | Out-Null } else { foreach ($f in $Script:Failures) { $summary.Add("- $f") | Out-Null } }
  $summary.Add("") | Out-Null
  $summary.Add("Warnings:") | Out-Null
  if ($Script:Warnings.Count -eq 0) { $summary.Add("- keine") | Out-Null } else { foreach ($w in $Script:Warnings) { $summary.Add("- $w") | Out-Null } }
  $newline = [System.Environment]::NewLine
  ($summary -join $newline) | Set-Content -Path $SummaryFile -Encoding UTF8

  $run = [ordered]@{
    result = $Script:Result
    giveawayUid = $GiveawayUid
    blockedUser = $BlockedUser
    expectedChatUsers = $ExpectedChatUsers
    baseUrl = $BaseUrl
    logRoot = $LogRoot
    startedAt = $Script:StartedAt
    finishedAt = (Get-Date).ToUniversalTime().ToString("o")
    steps = @($Script:Steps)
    rounds = @($Script:Rounds)
    failures = @($Script:Failures)
    warnings = @($Script:Warnings)
    finalState = $FinalState
  }
  ConvertTo-JsonSafe ([pscustomobject]$run) 100 | Set-Content -Path $JsonFile -Encoding UTF8
}

$Script:StartedAt = (Get-Date).ToUniversalTime().ToString("o")

try {
  Write-Log "START" "Loyalty Giveaway Wheel Interactive Test gestartet."
  Write-Log "INFO" "GiveawayUid: $GiveawayUid"
  Write-Log "INFO" "BlockedUser: $BlockedUser"
  Write-Log "INFO" "ExpectedChatUsers: $ExpectedChatUsers"
  Write-Log "INFO" "BaseUrl: $BaseUrl"
  Write-Log "INFO" "LogRoot: $LogRoot"

  Write-Host ""
  Write-Host "============================================================"
  Write-Host " CGN Loyalty Giveaway/Wheel interaktiver Komplett-Test"
  Write-Host "============================================================"
  Write-Host "Giveaway: $GiveawayUid"
  Write-Host "Gesperrter API-Entry: $BlockedUser"
  Write-Host "Chat-Teilnehmer per !ticket: $ExpectedChatUsers"
  Write-Host "Dreh-Befehl fuer Gewinner: !wheel oder !rad"
  Write-Host "Log: $LogFile"
  Write-Host "============================================================"
  Write-Host ""

  Prompt-Continue "Start bestaetigen. Das Script fuehrt nur den gesperrten API-Entry automatisch aus. Die Gewinner drehen per Chat."

  $status = Invoke-SccJson -Method GET -Url "/api/_status" -ApiName "status_root"
  if ($status.ok -eq $false) { Fail "backend_status" "Backend-Status meldet Fehler." $status -Stop }
  Pass "backend_status" "Backend erreichbar."

  $giveawayStatus = Invoke-SccJson -Method GET -Url "/api/loyalty/giveaways/status" -ApiName "giveaways_status"
  if ($giveawayStatus.ok -eq $false) { Fail "giveaways_status" "loyalty_giveaways Status meldet Fehler." $giveawayStatus -Stop }
  Pass "giveaways_status" "loyalty_giveaways Status gelesen." @{
    moduleVersion = $giveawayStatus.moduleVersion
    moduleBuild = $giveawayStatus.moduleBuild
    exclusionStatus = $giveawayStatus.giveawayExclusions
  }

  $gamesStatus = Invoke-SccJson -Method GET -Url "/api/loyalty/games/status" -ApiName "games_status"
  if ($gamesStatus.ok -eq $false) {
    Warn "games_status" "loyalty_games Status konnte nicht gelesen werden. Test laeuft weiter, weil Wheel-Claim spaeter ueber Giveaway-State geprueft wird." $gamesStatus
  } else {
    Pass "games_status" "loyalty_games Status gelesen." @{
      moduleVersion = $gamesStatus.moduleVersion
      moduleBuild = $gamesStatus.moduleBuild
    }
  }

  $ex = $giveawayStatus.giveawayExclusions
  if ($null -eq $ex) {
    Warn "exclusions_status" "Keine giveawayExclusions im Status gefunden."
  } elseif ($ex.enabled -ne $true) {
    Fail "exclusions_status" "Sperrliste ist nicht enabled." $ex -Stop
  } elseif ($ex.loaded -eq $false -or ($ex.lastError -and "$($ex.lastError)" -ne "")) {
    Fail "exclusions_status" "Sperrliste ist nicht sauber geladen." $ex -Stop
  } else {
    Pass "exclusions_status" "Sperrliste ist geladen." $ex
  }

  $g0 = Get-Giveaway "giveaway_initial"
  if (-not $g0.giveawayUid -and -not $g0.giveaway_uid) { Fail "giveaway_load" "Giveaway konnte nicht geladen werden." $g0 -Stop }

  $initialStatus = "$($g0.status)"
  $wheelEnabled = ($g0.wheelEnabled -eq $true -or $g0.wheel_enabled -eq $true)
  if (-not $wheelEnabled) { Fail "giveaway_wheel" "Giveaway ist nicht wheelEnabled." $g0 -Stop }
  if ($g0.setupComplete -ne $true -and $g0.setup_complete -ne $true) { Fail "giveaway_setup" "Giveaway ist nicht setupComplete." $g0 -Stop }

  $fields0 = Get-BoundFields "fields_initial"
  $available0 = Get-AvailableFields $fields0
  if (@($available0).Count -lt 3) { Fail "fields_initial" "Zu wenig verfuegbare Wheel-Felder fuer den Kompletttest." @{ available = @($available0).Count; fields = $fields0 } -Stop }
  Pass "giveaway_initial" "Giveaway geladen und geeignet." @{
    status = $initialStatus
    wheelEnabled = $wheelEnabled
    setupComplete = $g0.setupComplete
    canOpen = $g0.canOpen
    fields = @($fields0).Count
    availableFields = @($available0).Count
  }

  if ($initialStatus -eq "draft") {
    if (Prompt-YesNo "Giveaway ist draft. Jetzt oeffnen?" $true) {
      $open = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/open" -Body @{ actor = "interactive_test"; silent = $true } -ApiName "giveaway_open"
      if ($open.ok -eq $false) { Fail "giveaway_open" "Giveaway konnte nicht geoeffnet werden." $open -Stop }
      Pass "giveaway_open" "Giveaway geoeffnet."
    } else {
      $Script:Result = "STOPPED"
      throw "Giveaway-Oeffnen manuell abgebrochen."
    }
  } elseif ($initialStatus -eq "open") {
    Warn "giveaway_open" "Giveaway war bereits open. Test laeuft weiter."
  } else {
    Fail "giveaway_status_initial" "Giveaway muss fuer diesen Test draft oder open sein." @{ status = $initialStatus } -Stop
  }

  $gOpen = Get-Giveaway "giveaway_after_open"
  if ("$($gOpen.status)" -ne "open") { Fail "giveaway_open_status" "Status nach Open ist nicht open." $gOpen -Stop }
  Pass "giveaway_open_status" "Giveaway status=open."

  $blockedLogin = Normalize-Login $BlockedUser
  $entriesBeforeBlocked = Get-Entries "entries_before_blocked_user"
  $blockedExisting = @($entriesBeforeBlocked | Where-Object {
    (Normalize-Login "$($_.userLogin)") -eq $blockedLogin -or (Normalize-Login "$($_.user_login)") -eq $blockedLogin
  })
  if (@($blockedExisting).Count -gt 0) {
    Warn "blocked_entry" "Gesperrter User war bereits als Entry vorhanden." $blockedExisting
  } else {
    if (Prompt-YesNo "Gesperrten User per API hinzufuegen: $blockedLogin ?" $true) {
      $entryBody = @{
        userLogin = $blockedLogin
        userDisplayName = $BlockedUser
        ticketCount = 1
        source = "interactive_test_blocked_user"
      }
      $entryResp = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/entries" -Body $entryBody -ApiName "entry_blocked_user"
      if ($entryResp.ok -eq $false) { Fail "blocked_entry" "Gesperrter User konnte nicht als Entry hinzugefuegt werden." $entryResp -Stop }
      Pass "blocked_entry" "Gesperrter User wurde als Entry hinzugefuegt." $entryResp.entry
    } else {
      $Script:Result = "STOPPED"
      throw "Hinzufuegen des gesperrten Users manuell abgebrochen."
    }
  }

  Prompt-Continue "Jetzt bitte $ExpectedChatUsers erlaubte Testuser im Chat !ticket schreiben lassen. Danach hier bestaetigen."

  $entriesAfterJoin = Get-Entries "entries_after_chat_ticket"
  $activeEntries = Get-ActiveEntries $entriesAfterJoin
  $blockedEntries = @($activeEntries | Where-Object {
    (Normalize-Login "$($_.userLogin)") -eq $blockedLogin -or (Normalize-Login "$($_.user_login)") -eq $blockedLogin
  })
  $expectedTotalEntries = $ExpectedChatUsers + 1

  if (@($activeEntries).Count -ne $expectedTotalEntries) {
    Fail "entries_count" "Aktive Entries entsprechen nicht der Erwartung." @{
      expected = $expectedTotalEntries
      actual = @($activeEntries).Count
      entries = $activeEntries
    }
    if (-not (Prompt-YesNo "Trotz falscher Entry-Anzahl weiter testen?" $false)) {
      $Script:Result = "STOPPED"
      throw "Test wegen falscher Entry-Anzahl gestoppt."
    }
  } else {
    Pass "entries_count" "Aktive Entries korrekt: $expectedTotalEntries."
  }

  if (@($blockedEntries).Count -lt 1) {
    Fail "blocked_entry_present" "Gesperrter User ist nicht unter den aktiven Entries." @{ blockedUser = $blockedLogin; entries = $activeEntries } -Stop
  } else {
    Pass "blocked_entry_present" "Gesperrter User ist sichtbar unter den Entries."
  }

  if (-not $SkipOpenDrawBlockTest) {
    if (Prompt-YesNo "Optionalen Test ausfuehren: Draw aus OPEN muss blockiert werden?" $true) {
      $drawOpen = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/draw" -Body @{ actor = "interactive_test"; reason = "open_block_test" } -ApiName "draw_open_block_test"
      $err = Get-ApiError $drawOpen
      if ($err -ne "giveaway_draw_requires_closed_entries") {
        Fail "draw_open_block" "Draw aus OPEN wurde nicht wie erwartet blockiert." $drawOpen -Stop
      } else {
        Pass "draw_open_block" "Draw aus OPEN korrekt blockiert."
      }
    }
  }

  if (Prompt-YesNo "Giveaway jetzt fuer Entries schliessen?" $true) {
    $close = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/close" -Body @{ actor = "interactive_test"; silent = $true } -ApiName "giveaway_close_entries"
    if ($close.ok -eq $false) { Fail "giveaway_close" "Giveaway konnte nicht geschlossen werden." $close -Stop }
    Pass "giveaway_close" "Giveaway geschlossen."
  } else {
    $Script:Result = "STOPPED"
    throw "Close manuell abgebrochen."
  }

  $gClosed = Get-Giveaway "giveaway_after_close"
  if ("$($gClosed.status)" -ne "closed_for_entries") { Fail "giveaway_closed_status" "Status ist nicht closed_for_entries." $gClosed -Stop }
  Pass "giveaway_closed_status" "Giveaway status=closed_for_entries."

  $completedWinnerLogins = New-Object System.Collections.Generic.HashSet[string]
  $availableStart = @($available0).Count
  $roundIndex = 0

  while ($true) {
    $roundIndex++
    Write-Log "ROUND" "Starte Draw-Runde $roundIndex."

    $gBeforeDraw = Get-Giveaway "round_${roundIndex}_giveaway_before_draw"
    if ("$($gBeforeDraw.status)" -ne "closed_for_entries") {
      Fail "round_${roundIndex}_status_before_draw" "Giveaway ist vor Draw nicht closed_for_entries." $gBeforeDraw -Stop
    }

    $fieldsBeforeRound = Get-BoundFields "round_${roundIndex}_fields_before_draw"
    $availableBeforeRound = Get-AvailableFields $fieldsBeforeRound
    $draw = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/draw" -Body @{ actor = "interactive_test"; reason = "interactive_round_$roundIndex" } -ApiName "round_${roundIndex}_draw"

    if ($draw.ok -eq $false) {
      $err = Get-ApiError $draw
      if ($roundIndex -gt $ExpectedChatUsers -and ($err -eq "no_weighted_entries" -or $err -eq "giveaway_no_eligible_entries")) {
        Pass "final_no_eligible" "Kein eligible User mehr vorhanden. Erwartetes Ende." $draw
        break
      }

      if ($err -eq "no_weighted_entries" -or $err -eq "giveaway_no_eligible_entries") {
        Fail "round_${roundIndex}_draw" "Keine eligible Entries frueher als erwartet." $draw -Stop
      }

      Fail "round_${roundIndex}_draw" "Draw fehlgeschlagen." $draw -Stop
    }

    $winner = $draw.winner
    if ($null -eq $winner) { Fail "round_${roundIndex}_winner" "Draw lieferte keinen Winner." $draw -Stop }

    $winnerUid = Get-WinnerUid $winner
    $winnerLogin = Get-WinnerLogin $winner
    $winnerDisplay = Get-WinnerDisplayName $winner

    if ($winnerLogin -eq $blockedLogin) {
      Fail "round_${roundIndex}_blocked_winner" "Gesperrter User wurde gezogen. Das darf nicht passieren." $draw -Stop
    }

    $exInfo = Get-ExclusionInfo $draw
    if ($roundIndex -eq 1 -and $null -ne $exInfo) {
      $rawEntries = [int]($exInfo.rawEntriesCount)
      $excludedEntries = [int]($exInfo.excludedEntriesCount)
      $eligibleEntries = if ($draw.winner.metadata -and $draw.winner.metadata.fairness) { [int]$draw.winner.metadata.fairness.eligibleEntriesCount } else { [int]$draw.eligibleEntriesCount }
      if ($rawEntries -ne $expectedTotalEntries -or $excludedEntries -ne 1) {
        Fail "round_1_exclusion_info" "ExclusionInfo passt in Runde 1 nicht zur Erwartung." $exInfo -Stop
      } else {
        Pass "round_1_exclusion_info" "ExclusionInfo in Runde 1 korrekt." $exInfo
      }
    } elseif ($roundIndex -eq 1) {
      Warn "round_1_exclusion_info" "Keine ExclusionInfo im Draw-Response gefunden. Events/API wurden trotzdem gespeichert."
    }

    $Script:Rounds.Add([pscustomobject]@{
      round = $roundIndex
      winnerUid = $winnerUid
      winnerLogin = $winnerLogin
      winnerDisplayName = $winnerDisplay
      draw = $draw
      availableFieldsBefore = @($availableBeforeRound).Count
    }) | Out-Null

    Pass "round_${roundIndex}_draw" "Gewinner Runde ${roundIndex}: $winnerDisplay ($winnerLogin)." @{
      winnerUid = $winnerUid
      winnerLogin = $winnerLogin
      winnerDisplayName = $winnerDisplay
      availableFieldsBefore = @($availableBeforeRound).Count
    }

    $permsAfterDraw = Get-Permissions "round_${roundIndex}_permissions_after_draw"
    $pendingForWinner = @($permsAfterDraw | Where-Object {
      ("$($_.winnerUid)" -eq $winnerUid -or "$($_.winner_uid)" -eq $winnerUid) -and "$($_.status)" -eq "pending"
    })
    if (@($pendingForWinner).Count -lt 1) {
      Fail "round_${roundIndex}_permission_pending" "Keine pending Wheel-Permission fuer Gewinner gefunden." @{ winnerUid = $winnerUid; permissions = $permsAfterDraw } -Stop
    }
    Pass "round_${roundIndex}_permission_pending" "Pending Wheel-Permission fuer Gewinner vorhanden."

    $overlayUrl = "$BaseUrl/overlays/loyalty/wheel_overlay.html"
    Write-Host ""
    Write-Host "============================================================"
    Write-Host " GEWINNER RUNDE $roundIndex"
    Write-Host "============================================================"
    Write-Host "Gewinner: $winnerDisplay ($winnerLogin)"
    Write-Host ""
    Write-Host "Bitte diesen User jetzt im Chat schreiben lassen:"
    Write-Host "  !wheel"
    Write-Host ""
    Write-Host "Alternativ:"
    Write-Host "  !rad"
    Write-Host ""
    Write-Host "Overlay beobachten:"
    Write-Host "  $overlayUrl"
    Write-Host "============================================================"
    Write-Host ""

    Prompt-Continue "Wenn $winnerDisplay fertig gedreht hat und der Gewinn sichtbar war, hier bestaetigen."

    $winnersAfterSpin = Get-Winners "round_${roundIndex}_winners_after_chat_wheel"
    $winnerAfterSpin = Find-WinnerByUid $winnersAfterSpin $winnerUid
    $winnerStatusAfterSpin = Get-WinnerStatus $winnerAfterSpin

    $permsAfterSpin = Get-Permissions "round_${roundIndex}_permissions_after_chat_wheel"
    $permForWinnerAfterSpin = $permsAfterSpin | Where-Object {
      "$($_.winnerUid)" -eq $winnerUid -or "$($_.winner_uid)" -eq $winnerUid
    } | Select-Object -First 1

    $fieldsAfterRound = Get-BoundFields "round_${roundIndex}_fields_after_chat_wheel"
    $availableAfterRound = Get-AvailableFields $fieldsAfterRound

    $permissionStatus = if ($permForWinnerAfterSpin) { "$($permForWinnerAfterSpin.status)" } else { "" }
    $spinUid = if ($permForWinnerAfterSpin -and $permForWinnerAfterSpin.spinUid) { "$($permForWinnerAfterSpin.spinUid)" } elseif ($permForWinnerAfterSpin -and $permForWinnerAfterSpin.spin_uid) { "$($permForWinnerAfterSpin.spin_uid)" } else { "" }

    if ($winnerStatusAfterSpin -ne "wheel_completed" -or $permissionStatus -ne "used" -or [string]::IsNullOrWhiteSpace($spinUid)) {
      Fail "round_${roundIndex}_wheel_chat_claim" "Kein erfolgreicher Wheel-Claim nach !wheel/!rad erkannt. Kein API-Fallback wird ausgefuehrt." @{
        winnerUid = $winnerUid
        winnerLogin = $winnerLogin
        winnerStatus = $winnerStatusAfterSpin
        permissionStatus = $permissionStatus
        spinUid = $spinUid
        hint = "!wheel/!rad ist im aktuellen Code moeglicherweise noch deaktiviert oder nicht an den Runtime-Command angebunden."
      } -Stop
    }

    $expectedAvailableAfter = @($availableBeforeRound).Count - 1
    if (@($availableAfterRound).Count -ne $expectedAvailableAfter) {
      Fail "round_${roundIndex}_field_consumption" "Feldverbrauch passt nicht." @{
        availableBefore = @($availableBeforeRound).Count
        expectedAfter = $expectedAvailableAfter
        actualAfter = @($availableAfterRound).Count
      } -Stop
    }

    $completedWinnerLogins.Add($winnerLogin) | Out-Null
    Pass "round_${roundIndex}_wheel_chat_claim" "Wheel-Claim durch Chat erkannt: $winnerDisplay." @{
      winnerStatus = $winnerStatusAfterSpin
      permissionStatus = $permissionStatus
      spinUid = $spinUid
      fieldsBefore = @($availableBeforeRound).Count
      fieldsAfter = @($availableAfterRound).Count
    }

    if ($roundIndex -ge $ExpectedChatUsers) {
      Write-Log "INFO" "Erwartete Anzahl erlaubter Gewinner erreicht: $ExpectedChatUsers. Finaler No-Eligible-Draw wird getestet."
      $finalDraw = Invoke-SccJson -Method POST -Url "/api/loyalty/giveaways/$GiveawayUid/draw" -Body @{ actor = "interactive_test"; reason = "final_no_eligible_check" } -ApiName "final_no_eligible_draw"
      $finalErr = if ($finalDraw.error) { "$($finalDraw.error)" } elseif ($finalDraw.parsed -and $finalDraw.parsed.error) { "$($finalDraw.parsed.error)" } else { "" }
      if ($finalErr -eq "no_weighted_entries" -or $finalErr -eq "giveaway_no_eligible_entries") {
        Pass "final_no_eligible" "Nach $ExpectedChatUsers Gewinnern ist kein eligible User mehr vorhanden."
        break
      } else {
        Fail "final_no_eligible" "Nach erwarteten Gewinnern war noch ein weiterer Draw moeglich oder anderer Fehler." $finalDraw -Stop
      }
    }
  }

  $finalGiveaway = Get-Giveaway "final_giveaway"
  $finalEntries = Get-Entries "final_entries"
  $finalWinners = Get-Winners "final_winners"
  $finalPermissions = Get-Permissions "final_permissions"
  $finalFields = Get-BoundFields "final_fields"
  $finalAvailable = Get-AvailableFields $finalFields

  $expectedFinalAvailable = $availableStart - $ExpectedChatUsers
  if (@($finalAvailable).Count -ne $expectedFinalAvailable) {
    Warn "final_field_count" "Finale verfuegbare Felder entsprechen nicht der Erwartung." @{
      expected = $expectedFinalAvailable
      actual = @($finalAvailable).Count
      start = $availableStart
      winnersExpected = $ExpectedChatUsers
    }
  } else {
    Pass "final_field_count" "Finale verfuegbare Felder korrekt: $availableStart -> $(@($finalAvailable).Count)."
  }

  $completedWinners = @($finalWinners | Where-Object { "$($_.status)" -eq "wheel_completed" })
  if (@($completedWinners).Count -lt $ExpectedChatUsers) {
    Fail "final_completed_winners" "Zu wenige wheel_completed Gewinner." @{
      expected = $ExpectedChatUsers
      actual = @($completedWinners).Count
      winners = $finalWinners
    } -Stop
  } else {
    Pass "final_completed_winners" "Alle erwarteten Gewinner sind wheel_completed."
  }

  $Script:Result = if ($Script:Failures.Count -eq 0) { "PASS" } else { "FAIL" }

  $finalState = [ordered]@{
    giveaway = $finalGiveaway
    entries = $finalEntries
    winners = $finalWinners
    permissions = $finalPermissions
    fields = $finalFields
    availableFields = @($finalAvailable).Count
  }
  Write-FinalFiles $finalState

  Write-Host ""
  Write-Host "============================================================"
  Write-Host " TEST ABGESCHLOSSEN: $Script:Result"
  Write-Host "============================================================"
  Write-Host "Log:     $LogFile"
  Write-Host "JSON:    $JsonFile"
  Write-Host "Summary: $SummaryFile"
  Write-Host "API:     $ApiDir"
  Write-Host "============================================================"
  Write-Host ""
}
catch {
  if ($Script:Result -eq "RUNNING") { $Script:Result = "FAIL" }
  Write-Log "STOP" $_.Exception.Message

  try {
    $finalGiveaway = Get-Giveaway "stop_final_giveaway"
    $finalEntries = Get-Entries "stop_final_entries"
    $finalWinners = Get-Winners "stop_final_winners"
    $finalPermissions = Get-Permissions "stop_final_permissions"
    $finalFields = Get-BoundFields "stop_final_fields"
    $finalState = [ordered]@{
      giveaway = $finalGiveaway
      entries = $finalEntries
      winners = $finalWinners
      permissions = $finalPermissions
      fields = $finalFields
    }
    Write-FinalFiles $finalState
  } catch {
    Write-Log "WARN" "Final-State konnte nach Fehler nicht vollstaendig gelesen werden: $($_.Exception.Message)"
    Write-FinalFiles @{ finalReadError = $_.Exception.Message }
  }

  Write-Host ""
  Write-Host "============================================================"
  Write-Host " TEST GESTOPPT: $Script:Result"
  Write-Host "============================================================"
  Write-Host "Fehler:  $($_.Exception.Message)"
  Write-Host "Log:     $LogFile"
  Write-Host "JSON:    $JsonFile"
  Write-Host "Summary: $SummaryFile"
  Write-Host "API:     $ApiDir"
  Write-Host "============================================================"
  Write-Host ""

  exit 1
}
