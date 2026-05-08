$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

function Invoke-TestRequest {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET"
  )

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 12
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 12
    }

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

$nodeCheck = [ordered]@{
  ok = $false
  stdout = ""
  stderr = ""
}

try {
  $check = & node --check "backend\modules\todo.js" 2>&1
  $nodeCheck.ok = ($LASTEXITCODE -eq 0)
  $nodeCheck.stdout = ($check | Out-String)
} catch {
  $nodeCheck.ok = $false
  $nodeCheck.stderr = $_.Exception.Message
}

$Result = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  git = [ordered]@{
    status = @(git status --short)
    head = (git log -1 --oneline)
  }
  nodeCheck = $nodeCheck
  tests = [ordered]@{
    routes = Invoke-TestRequest -Name "routes" -Url "http://127.0.0.1:8080/api/todo/routes"
    integrationCheck = Invoke-TestRequest -Name "integrationCheck" -Url "http://127.0.0.1:8080/api/todo/integration-check"
    status = Invoke-TestRequest -Name "status" -Url "http://127.0.0.1:8080/api/todo/status"
    config = Invoke-TestRequest -Name "config" -Url "http://127.0.0.1:8080/api/todo/config"
    settings = Invoke-TestRequest -Name "settings" -Url "http://127.0.0.1:8080/api/todo/settings"
    adminSettings = Invoke-TestRequest -Name "adminSettings" -Url "http://127.0.0.1:8080/api/todo/admin/settings"
    adminTexts = Invoke-TestRequest -Name "adminTexts" -Url "http://127.0.0.1:8080/api/todo/admin/texts"
  }
}

$Result | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
