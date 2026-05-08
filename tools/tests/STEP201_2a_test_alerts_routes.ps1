$ErrorActionPreference = "Continue"

cd D:\Git\stream-control-center
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Result = [ordered]@{}
$Result.createdAt = (Get-Date).ToString("s")
$Result.git = [ordered]@{
  status = (git status --short)
  head = (git log -1 --oneline)
}

$Result.nodeCheck = [ordered]@{
  ok = $false
  stdout = ""
  stderr = ""
}

try {
  $nodeOut = & node --check "backend\modules\alert_system.js" 2>&1
  $Result.nodeCheck.ok = ($LASTEXITCODE -eq 0)
  $Result.nodeCheck.stdout = ($nodeOut | Out-String)
} catch {
  $Result.nodeCheck.stderr = $_.Exception.Message
}

function Invoke-ApiTest {
  param([string]$Name, [string]$Url)

  try {
    $response = Invoke-RestMethod $Url -TimeoutSec 10
    return [ordered]@{
      ok = $true
      url = $Url
      response = $response
      error = ""
    }
  } catch {
    return [ordered]@{
      ok = $false
      url = $Url
      response = $null
      error = $_.Exception.Message
    }
  }
}

$Result.tests = [ordered]@{
  routes = Invoke-ApiTest "routes" "http://127.0.0.1:8080/api/alerts/routes"
  integrationCheck = Invoke-ApiTest "integration-check" "http://127.0.0.1:8080/api/alerts/integration-check"
  status = Invoke-ApiTest "status" "http://127.0.0.1:8080/api/alerts/status"
}

$Result | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"

Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
