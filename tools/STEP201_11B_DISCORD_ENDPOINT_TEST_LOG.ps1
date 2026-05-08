$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_11B_DISCORD_ENDPOINT_TEST_$timestamp.log"

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
    [bool]$Expected400 = $false
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
      expected400 = $Expected400
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

    $isExpected = $Expected400 -and $statusCode -eq 400

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
      expected400 = $Expected400
      error = $(if ($isExpected) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP201.11b Discord Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"
Write-Log ""

$tests = @(
  @{ name="discord status"; url="http://127.0.0.1:8080/api/discord/status"; method="GET"; expected400=$false },
  @{ name="discord config"; url="http://127.0.0.1:8080/api/discord/config"; method="GET"; expected400=$false },
  @{ name="discord settings"; url="http://127.0.0.1:8080/api/discord/settings"; method="GET"; expected400=$false },
  @{ name="discord routes"; url="http://127.0.0.1:8080/api/discord/routes"; method="GET"; expected400=$false },
  @{ name="discord integration-check"; url="http://127.0.0.1:8080/api/discord/integration-check"; method="GET"; expected400=$false },
  @{ name="discord reload"; url="http://127.0.0.1:8080/api/discord/reload"; method="POST"; expected400=$false },

  @{ name="discord queue status"; url="http://127.0.0.1:8080/api/discord/queue/status"; method="GET"; expected400=$false },
  @{ name="discord play missing key"; url="http://127.0.0.1:8080/api/discord/play"; method="GET"; expected400=$true },
  @{ name="discord legacy status"; url="http://127.0.0.1:8080/discord/status"; method="GET"; expected400=$false },
  @{ name="discord legacy queue status"; url="http://127.0.0.1:8080/discord/queue/status"; method="GET"; expected400=$false }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-Endpoint `
    -Name $test.name `
    -Url $test.url `
    -Method $test.method `
    -Expected400 $test.expected400
}

$standardNames = @(
  "discord status",
  "discord config",
  "discord settings",
  "discord routes",
  "discord integration-check",
  "discord reload"
)

$standardResults = @($results | Where-Object { $standardNames -contains $_.name })
$okCount = @($standardResults | Where-Object { $_.ok }).Count

$integrationResponse = ($results | Where-Object { $_.name -eq "discord integration-check" } | Select-Object -First 1).response
$integrationSummary = $null
if ($integrationResponse -and $integrationResponse.data -and $integrationResponse.data.summary) {
  $integrationSummary = $integrationResponse.data.summary
}

$reloadResponse = ($results | Where-Object { $_.name -eq "discord reload" } | Select-Object -First 1).response
$reloadData = $null
if ($reloadResponse -and $reloadResponse.data) {
  $reloadData = $reloadResponse.data
}

$apiMatrix = [ordered]@{
  endpoints = @("status","config","settings","routes","integration-check","reload")
  summary = @(
    [ordered]@{
      key = "discord"
      base = "/api/discord"
      okCount = $okCount
      total = 6
      complete = ($okCount -eq 6)
      missing = @($standardResults | Where-Object { -not $_.ok } | ForEach-Object { $_.name -replace '^discord ', '' })
      integrationSummary = $integrationSummary
    },
    [ordered]@{
      key = "discord-legacy"
      base = "/discord"
      stillAvailable = (($results | Where-Object { $_.name -eq "discord legacy status" } | Select-Object -First 1).ok)
      queueStatusStillAvailable = (($results | Where-Object { $_.name -eq "discord legacy queue status" } | Select-Object -First 1).ok)
      purpose = "legacy compatibility"
    }
  )
}

$summary = @($results | ForEach-Object {
  [ordered]@{
    name = $_.name
    method = $_.method
    url = $_.url
    ok = $_.ok
    http = $_.http
    expected400 = $_.expected400
    error = $_.error
  }
})

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.11b Discord Endpoint Test"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  apiMatrix = $apiMatrix
  integrationSummary = $integrationSummary
  reload = $reloadData
  summary = $summary
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
