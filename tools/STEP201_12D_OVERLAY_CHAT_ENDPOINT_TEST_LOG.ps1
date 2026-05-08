$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_12D_OVERLAY_CHAT_ENDPOINT_TEST_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Out-File -FilePath $logPath -Append -Encoding UTF8
}

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [int]$Depth = 40,
    [bool]$Expected404 = $false
  )

  Write-Log ""
  Write-Log "TEST: $Name"
  Write-Log "$Method $Url"

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 12
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 12
    }

    $json = $response | ConvertTo-Json -Depth $Depth
    Write-Log "RESULT: OK"
    Write-Log $json

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $true
      http = 200
      expected404 = $Expected404
      error = ""
      response = $response
    }
  } catch {
    $statusCode = $null
    $body = ""

    try {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
      }
    } catch {}

    $isExpected = $Expected404 -and $statusCode -eq 404

    Write-Log ("RESULT: " + ($(if ($isExpected) { "EXPECTED" } else { "ERROR" })))
    Write-Log "HTTP: $statusCode"
    Write-Log "ERROR: $($_.Exception.Message)"
    if ($body) {
      Write-Log "RESPONSE BODY:"
      Write-Log $body
    }

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $isExpected
      http = $statusCode
      expected404 = $Expected404
      error = $(if ($isExpected) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP201.12d Overlay-Chat Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"
Write-Log ""

$tests = @(
  @{ name="overlay chat status"; url="http://127.0.0.1:8080/api/overlay/chat/status"; method="GET"; expected404=$false },
  @{ name="overlay chat config"; url="http://127.0.0.1:8080/api/overlay/chat/config"; method="GET"; expected404=$false },
  @{ name="overlay chat settings"; url="http://127.0.0.1:8080/api/overlay/chat/settings"; method="GET"; expected404=$false },
  @{ name="overlay chat routes"; url="http://127.0.0.1:8080/api/overlay/chat/routes"; method="GET"; expected404=$false },
  @{ name="overlay chat integration-check"; url="http://127.0.0.1:8080/api/overlay/chat/integration-check"; method="GET"; expected404=$false },
  @{ name="overlay chat reload"; url="http://127.0.0.1:8080/api/overlay/chat/reload"; method="POST"; expected404=$false },

  @{ name="overlay chat debug"; url="http://127.0.0.1:8080/api/overlay/chat/debug"; method="GET"; expected404=$false },
  @{ name="overlay chat emotes status"; url="http://127.0.0.1:8080/api/overlay/chat/emotes/status"; method="GET"; expected404=$false },
  @{ name="overlay start-chat irc status"; url="http://127.0.0.1:8080/api/overlay/start-chat/irc/status"; method="GET"; expected404=$false },
  @{ name="twitch-chat-overlay alias status"; url="http://127.0.0.1:8080/api/twitch-chat-overlay/status"; method="GET"; expected404=$true },
  @{ name="chat-overlay alias status"; url="http://127.0.0.1:8080/api/chat-overlay/status"; method="GET"; expected404=$true }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-Endpoint `
    -Name $test.name `
    -Url $test.url `
    -Method $test.method `
    -Expected404 $test.expected404
}

$standardNames = @(
  "overlay chat status",
  "overlay chat config",
  "overlay chat settings",
  "overlay chat routes",
  "overlay chat integration-check",
  "overlay chat reload"
)

$standardResults = @($results | Where-Object { $standardNames -contains $_.name })
$okCount = @($standardResults | Where-Object { $_.ok }).Count

$integrationResponse = ($results | Where-Object { $_.name -eq "overlay chat integration-check" } | Select-Object -First 1).response
$integrationSummary = $null
if ($integrationResponse -and $integrationResponse.data -and $integrationResponse.data.summary) {
  $integrationSummary = $integrationResponse.data.summary
}

$reloadResponse = ($results | Where-Object { $_.name -eq "overlay chat reload" } | Select-Object -First 1).response
$reloadData = $null
if ($reloadResponse -and $reloadResponse.data) {
  $reloadData = $reloadResponse.data
}

$apiMatrix = [ordered]@{
  endpoints = @("status","config","settings","routes","integration-check","reload")
  summary = @(
    [ordered]@{
      key = "overlay-chat"
      base = "/api/overlay/chat"
      okCount = $okCount
      total = 6
      complete = ($okCount -eq 6)
      missing = @($standardResults | Where-Object { -not $_.ok } | ForEach-Object { $_.name -replace '^overlay chat ', '' })
      integrationSummary = $integrationSummary
    },
    [ordered]@{
      key = "overlay-start-chat-irc"
      base = "/api/overlay/start-chat/irc"
      stillAvailable = (($results | Where-Object { $_.name -eq "overlay start-chat irc status" } | Select-Object -First 1).ok)
      purpose = "legacy compatibility"
    },
    [ordered]@{
      key = "twitch-chat-overlay-alias"
      base = "/api/twitch-chat-overlay"
      intentionallyNotRegistered = $true
      status = "expected_404"
    },
    [ordered]@{
      key = "chat-overlay-alias"
      base = "/api/chat-overlay"
      intentionallyNotRegistered = $true
      status = "expected_404"
    }
  )
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.12d Overlay-Chat Endpoint Test"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  apiMatrix = $apiMatrix
  integrationSummary = $integrationSummary
  reload = $reloadData
  summary = @($results | ForEach-Object {
    [ordered]@{
      name = $_.name
      method = $_.method
      url = $_.url
      ok = $_.ok
      http = $_.http
      expected404 = $_.expected404
      error = $_.error
    }
  })
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "API Matrix:"
($apiMatrix.summary | ConvertTo-Json -Depth 20) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
