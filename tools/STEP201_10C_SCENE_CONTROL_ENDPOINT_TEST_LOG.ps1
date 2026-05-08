$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_10C_SCENE_CONTROL_ENDPOINT_TEST_$timestamp.log"

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
    [bool]$Expected404 = $false,
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
      expected404 = $Expected404
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

    $isExpected = ($Expected404 -and $statusCode -eq 404) -or ($Expected400 -and $statusCode -eq 400)

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
      expected400 = $Expected400
      error = $(if ($isExpected) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP201.10c Scene-Control Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"
Write-Log ""

$tests = @(
  @{ name="scene status"; url="http://127.0.0.1:8080/api/scene/status"; method="GET"; expected404=$false; expected400=$false },
  @{ name="scene config"; url="http://127.0.0.1:8080/api/scene/config"; method="GET"; expected404=$false; expected400=$false },
  @{ name="scene settings"; url="http://127.0.0.1:8080/api/scene/settings"; method="GET"; expected404=$false; expected400=$false },
  @{ name="scene routes"; url="http://127.0.0.1:8080/api/scene/routes"; method="GET"; expected404=$false; expected400=$false },
  @{ name="scene integration-check"; url="http://127.0.0.1:8080/api/scene/integration-check"; method="GET"; expected404=$false; expected400=$false },
  @{ name="scene reload"; url="http://127.0.0.1:8080/api/scene/reload"; method="POST"; expected404=$false; expected400=$false },

  @{ name="legacy scene health"; url="http://127.0.0.1:8080/api/scene/health"; method="GET"; expected404=$false; expected400=$false },
  @{ name="legacy scene list"; url="http://127.0.0.1:8080/api/scene/list"; method="GET"; expected404=$false; expected400=$false },
  @{ name="legacy scene set missing input"; url="http://127.0.0.1:8080/api/scene/set"; method="GET"; expected404=$false; expected400=$true },

  @{ name="scene-control alias status"; url="http://127.0.0.1:8080/api/scene-control/status"; method="GET"; expected404=$true; expected400=$false },
  @{ name="scene_control alias status"; url="http://127.0.0.1:8080/api/scene_control/status"; method="GET"; expected404=$true; expected400=$false },
  @{ name="scenes alias status"; url="http://127.0.0.1:8080/api/scenes/status"; method="GET"; expected404=$true; expected400=$false }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-Endpoint `
    -Name $test.name `
    -Url $test.url `
    -Method $test.method `
    -Expected404 $test.expected404 `
    -Expected400 $test.expected400
}

$standardNames = @(
  "scene status",
  "scene config",
  "scene settings",
  "scene routes",
  "scene integration-check",
  "scene reload"
)

$standardResults = @($results | Where-Object { $standardNames -contains $_.name })
$okCount = @($standardResults | Where-Object { $_.ok }).Count

$integrationResponse = ($results | Where-Object { $_.name -eq "scene integration-check" } | Select-Object -First 1).response
$integrationSummary = $null
if ($integrationResponse -and $integrationResponse.summary) {
  $integrationSummary = $integrationResponse.summary
}

$reloadResponse = ($results | Where-Object { $_.name -eq "scene reload" } | Select-Object -First 1).response
$reloadData = $reloadResponse

$apiMatrix = [ordered]@{
  endpoints = @("status","config","settings","routes","integration-check","reload")
  summary = @(
    [ordered]@{
      key = "scene-control"
      base = "/api/scene"
      okCount = $okCount
      total = 6
      complete = ($okCount -eq 6)
      missing = @($standardResults | Where-Object { -not $_.ok } | ForEach-Object { $_.name -replace '^scene ', '' })
      integrationSummary = $integrationSummary
    },
    [ordered]@{
      key = "scene-control-alias"
      base = "/api/scene-control"
      intentionallyNotRegistered = $true
      status = "expected_404"
    },
    [ordered]@{
      key = "scene_control-alias"
      base = "/api/scene_control"
      intentionallyNotRegistered = $true
      status = "expected_404"
    },
    [ordered]@{
      key = "scenes-alias"
      base = "/api/scenes"
      intentionallyNotRegistered = $true
      status = "expected_404"
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
    expected404 = $_.expected404
    expected400 = $_.expected400
    error = $_.error
  }
})

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.10c Scene-Control Endpoint Test"
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
