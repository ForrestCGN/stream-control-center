$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_6_1_CHALLENGE_OVERLAY_PATH_FIX_TEST_$timestamp.log"

function Write-Log { param([string]$Text = "") $Text | Tee-Object -FilePath $logPath -Append }
function Invoke-Endpoint {
  param([string]$Name,[string]$Url,[string]$Method="GET")
  Write-Log ""
  Write-Log "TEST: $Name"
  Write-Log "$Method $Url"
  try {
    if ($Method -eq "POST") { $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 8 }
    else { $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 8 }
    Write-Log "RESULT: OK"
    Write-Log ($response | ConvertTo-Json -Depth 40)
    return [ordered]@{ name=$Name; method=$Method; url=$Url; ok=$true; http=200; error=""; response=$response }
  } catch {
    $statusCode = $null; $body = ""
    try {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
      }
    } catch {}
    Write-Log "RESULT: ERROR"
    Write-Log "HTTP: $statusCode"
    Write-Log "ERROR: $($_.Exception.Message)"
    return [ordered]@{ name=$Name; method=$Method; url=$Url; ok=$false; http=$statusCode; error=$_.Exception.Message; responseBody=$body }
  }
}

Write-Log "STEP201.6.1 Challenge Overlay Path Fix Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log ""
Write-Log "Git head:"
@(git log -1 --oneline 2>&1) | ForEach-Object { Write-Log $_.ToString() }
Write-Log ""
Write-Log "Git status:"
@(git status --short 2>&1) | ForEach-Object { Write-Log $_.ToString() }

$results = @()
$results += Invoke-Endpoint -Name "challenge integration-check" -Url "http://127.0.0.1:8080/api/challenge/integration-check"
$results += Invoke-Endpoint -Name "challenge routes" -Url "http://127.0.0.1:8080/api/challenge/routes"

$integration = $results | Where-Object { $_.name -eq "challenge integration-check" } | Select-Object -First 1
$overlayCheck = $null
if ($integration.ok -and $integration.response -and $integration.response.checks) {
  $overlayCheck = $integration.response.checks | Where-Object { $_.name -eq "overlay_status_file" } | Select-Object -First 1
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.6.1 Challenge overlay path fix test"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  overlayStatusFileCheck = $overlayCheck
  summary = @($results | ForEach-Object { [ordered]@{ name=$_.name; method=$_.method; url=$_.url; ok=$_.ok; http=$_.http; error=$_.error } })
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "Overlay check:"
Write-Log ($overlayCheck | ConvertTo-Json -Depth 20)
Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
