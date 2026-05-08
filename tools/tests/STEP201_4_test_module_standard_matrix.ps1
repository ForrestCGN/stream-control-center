$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Modules = @(
  @{ key="alerts"; base="/api/alerts" },
  @{ key="soundalerts"; base="/api/soundalerts" },
  @{ key="tagebuch"; base="/api/tagebuch" },
  @{ key="todo"; base="/api/todo" },
  @{ key="messages"; base="/api/messages" },
  @{ key="message-rotator"; base="/api/message-rotator" },
  @{ key="sound"; base="/api/sound" },
  @{ key="tts"; base="/api/tts" },
  @{ key="vip"; base="/api/vip" },
  @{ key="vip-sound-overlay"; base="/api/vip-sound-overlay" },
  @{ key="vip-sound"; base="/api/vip-sound" },
  @{ key="challenge"; base="/api/challenge" },
  @{ key="clip"; base="/api/clip" },
  @{ key="credits"; base="/api/credits" },
  @{ key="deathcounter"; base="/api/deathcounter" },
  @{ key="obs"; base="/api/obs" },
  @{ key="scene-control"; base="/api/scene-control" },
  @{ key="discord"; base="/api/discord" },
  @{ key="twitch"; base="/api/twitch" },
  @{ key="twitch-presence"; base="/api/twitch/presence" }
)

$Endpoints = @("status","config","settings","routes","integration-check","reload")

function Invoke-Endpoint {
  param(
    [string]$Url,
    [string]$Method = "GET"
  )

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 8
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 8
    }

    return [ordered]@{
      ok = $true
      http = 200
      url = $Url
      error = ""
      response = $response
    }
  } catch {
    $statusCode = $null
    $body = ""
    try {
      $statusCode = [int]$_.Exception.Response.StatusCode
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $reader.ReadToEnd()
    } catch {}

    return [ordered]@{
      ok = $false
      http = $statusCode
      url = $Url
      error = $_.Exception.Message
      responseBody = $body
    }
  }
}

$Results = @()

foreach ($m in $Modules) {
  $entry = [ordered]@{
    key = $m.key
    base = $m.base
    endpoints = [ordered]@{}
  }

  foreach ($ep in $Endpoints) {
    $url = "http://127.0.0.1:8080$($m.base)/$ep"
    $method = "GET"
    if ($ep -eq "reload") { $method = "POST" }
    $entry.endpoints[$ep] = Invoke-Endpoint -Url $url -Method $method
  }

  $Results += $entry
}

$Summary = @()
foreach ($r in $Results) {
  $okCount = 0
  foreach ($ep in $Endpoints) {
    if ($r.endpoints[$ep].ok) { $okCount++ }
  }
  $Summary += [ordered]@{
    key = $r.key
    base = $r.base
    okCount = $okCount
    total = $Endpoints.Count
    complete = ($okCount -eq $Endpoints.Count)
    missing = @($Endpoints | Where-Object { -not $r.endpoints[$_].ok })
  }
}

$Output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  git = [ordered]@{
    status = @(git status --short)
    head = (git log -1 --oneline)
  }
  endpoints = $Endpoints
  summary = $Summary
  modules = $Results
}

$Output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
