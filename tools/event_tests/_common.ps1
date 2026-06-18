param()

$ErrorActionPreference = "Stop"

if (-not $script:BaseUrl) {
  $script:BaseUrl = if ($env:EVS_BASE_URL) { $env:EVS_BASE_URL.TrimEnd("/") } else { "http://127.0.0.1:8080" }
}
$script:ApiBase = "$script:BaseUrl/api/stream-events"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "=== $Text ===" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Text)
  Write-Host "OK: $Text" -ForegroundColor Green
}

function Write-WarnLine {
  param([string]$Text)
  Write-Host "WARN: $Text" -ForegroundColor Yellow
}

function Invoke-Evs {
  param(
    [Parameter(Mandatory=$true)][ValidateSet("GET","POST","PUT","DELETE")][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [object]$Body = $null,
    [int]$Depth = 10
  )

  $url = if ($Path.StartsWith("http")) { $Path } else { "$script:ApiBase$Path" }
  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth $Depth
    return Invoke-RestMethod -Method $Method -Uri $url -ContentType "application/json; charset=utf-8" -Body $json
  }
  return Invoke-RestMethod -Method $Method -Uri $url
}

function Save-EvsState {
  param([Parameter(Mandatory=$true)][object]$State)
  $path = Join-Path $PSScriptRoot "_last_event_test_state.json"
  $State | ConvertTo-Json -Depth 20 | Set-Content -Path $path -Encoding UTF8
  Write-Ok "State gespeichert: $path"
}

function Load-EvsState {
  $path = Join-Path $PSScriptRoot "_last_event_test_state.json"
  if (-not (Test-Path $path)) {
    throw "Kein Test-State gefunden. Erst 02_create_combined_test_event.ps1 oder 09_full_flow_test.ps1 ausführen."
  }
  return Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-EvsEventUid {
  param([string]$EventUid = "")
  if ($EventUid) { return $EventUid }
  $state = Load-EvsState
  if (-not $state.eventUid) { throw "Im Test-State fehlt eventUid." }
  return [string]$state.eventUid
}

function Show-EvsJson {
  param([object]$Value, [int]$Depth = 10)
  $Value | ConvertTo-Json -Depth $Depth
}

function Add-EvsManualPoints {
  param(
    [Parameter(Mandatory=$true)][string]$EventUid,
    [Parameter(Mandatory=$true)][string]$UserLogin,
    [Parameter(Mandatory=$true)][string]$DisplayName,
    [Parameter(Mandatory=$true)][int]$Points,
    [string]$Reason = "event_test_manual_points"
  )
  return Invoke-Evs -Method POST -Path "/events/$EventUid/points" -Body @{
    userLogin = $UserLogin
    userDisplayName = $DisplayName
    points = $Points
    sourceType = "test_script"
    sourceUid = "ps_test_$UserLogin"
    reason = $Reason
    createdBy = "event_test_script"
  }
}

function Invoke-EvsChat {
  param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$UserLogin = "testuser",
    [string]$DisplayName = "",
    [string]$EventUid = ""
  )
  if (-not $DisplayName) { $DisplayName = $UserLogin }
  $body = @{
    message = $Message
    userLogin = $UserLogin
    userDisplayName = $DisplayName
    messageId = "ps_test_$([guid]::NewGuid().ToString('N'))"
  }
  if ($EventUid) { $body.eventUid = $EventUid }
  return Invoke-Evs -Method POST -Path "/chat-runtime/test-chat" -Body $body
}
