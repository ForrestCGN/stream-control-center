$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_8_DEATHCOUNTER_ENDPOINT_TEST_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Tee-Object -FilePath $logPath -Append
}

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [int]$Depth = 30,
    [bool]$Expected404 = $false
  )

  Write-Log ""
  Write-Log "TEST: $Name"
  Write-Log "$Method $Url"

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 10
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 10
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

    $isExpected404 = $Expected404 -and $statusCode -eq 404

    Write-Log ("RESULT: " + ($(if ($isExpected404) { "EXPECTED_404" } else { "ERROR" })))
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
      ok = $isExpected404
      http = $statusCode
      expected404 = $Expected404
      error = $(if ($isExpected404) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP201.8 Deathcounter Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"
Write-Log ""

$tests = @(
  @{ name="deathcounter status"; url="http://127.0.0.1:8080/api/deathcounter/v2/status"; method="GET"; depth=30; expected404=$false },
  @{ name="deathcounter config"; url="http://127.0.0.1:8080/api/deathcounter/v2/config"; method="GET"; depth=30; expected404=$false },
  @{ name="deathcounter settings"; url="http://127.0.0.1:8080/api/deathcounter/v2/settings"; method="GET"; depth=30; expected404=$false },
  @{ name="deathcounter routes"; url="http://127.0.0.1:8080/api/deathcounter/v2/routes"; method="GET"; depth=30; expected404=$false },
  @{ name="deathcounter integration-check"; url="http://127.0.0.1:8080/api/deathcounter/v2/integration-check"; method="GET"; depth=40; expected404=$false },
  @{ name="deathcounter reload"; url="http://127.0.0.1:8080/api/deathcounter/v2/reload"; method="POST"; depth=30; expected404=$false },
  @{ name="deathcounter alias status"; url="http://127.0.0.1:8080/api/deathcounter/status"; method="GET"; depth=10; expected404=$true },
  @{ name="deathcounter-v2 alias status"; url="http://127.0.0.1:8080/api/deathcounter-v2/status"; method="GET"; depth=10; expected404=$true }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-Endpoint `
    -Name $test.name `
    -Url $test.url `
    -Method $test.method `
    -Depth $test.depth `
    -Expected404 $test.expected404
}

$standardNames = @(
  "deathcounter status",
  "deathcounter config",
  "deathcounter settings",
  "deathcounter routes",
  "deathcounter integration-check",
  "deathcounter reload"
)

$standardResults = @($results | Where-Object { $standardNames -contains $_.name })
$okCount = @($standardResults | Where-Object { $_.ok }).Count

$apiMatrix = [ordered]@{
  endpoints = @("status","config","settings","routes","integration-check","reload")
  summary = @(
    [ordered]@{
      key = "deathcounter_v2"
      base = "/api/deathcounter/v2"
      okCount = $okCount
      total = 6
      complete = ($okCount -eq 6)
      missing = @($standardResults | Where-Object { -not $_.ok } | ForEach-Object { $_.name -replace '^deathcounter ', '' })
    },
    [ordered]@{
      key = "deathcounter"
      base = "/api/deathcounter"
      intentionallyNotRegistered = $true
      status = "expected_404"
    },
    [ordered]@{
      key = "deathcounter-v2"
      base = "/api/deathcounter-v2"
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
    error = $_.error
  }
})

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.8 Deathcounter Endpoint Test"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  apiMatrix = $apiMatrix
  summary = $summary
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "API Matrix:"
$apiMatrix.summary | Format-Table key,base,okCount,total,complete,status -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
