param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string[]]$Logins = @(
    "una_solala",
    "crazy_gamming_network",
    "profi_dieb_muerte",
    "feuerstern_56",
    "ninety8nine",
    "ursulaaaaaana",
    "fresche_gedanken",
    "scavliwei",
    "psychologin_ttv",
    "sangre_roja_que_fluye"
  ),
  [string]$OutFile = ""
)

$ErrorActionPreference = "Continue"

if (-not $OutFile) {
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $OutFile = Join-Path (Get-Location) "lwg_excluded_winners_resolved_$stamp.json"
}

$items = @()

foreach ($loginRaw in $Logins) {
  $login = ($loginRaw -replace '^@','').Trim().ToLowerInvariant()
  if (-not $login) { continue }

  Write-Host "Resolve Twitch User:" $login
  try {
    $url = "$BaseUrl/api/twitch/user/resolve?login=$([uri]::EscapeDataString($login))"
    $r = Invoke-RestMethod -Method GET -Uri $url

    $items += [PSCustomObject]@{
      login = if ($r.login) { "$($r.login)".ToLowerInvariant() } else { $login }
      displayName = if ($r.displayName) { "$($r.displayName)" } elseif ($r.display_name) { "$($r.display_name)" } else { $login }
      twitchUserId = if ($r.id) { "$($r.id)" } elseif ($r.userId) { "$($r.userId)" } elseif ($r.user_id) { "$($r.user_id)" } else { "" }
      input = $loginRaw
      ok = [bool]$r.ok
      resolvedAt = (Get-Date).ToUniversalTime().ToString("o")
      error = ""
    }
  } catch {
    $items += [PSCustomObject]@{
      login = $login
      displayName = $login
      twitchUserId = ""
      input = $loginRaw
      ok = $false
      resolvedAt = (Get-Date).ToUniversalTime().ToString("o")
      error = $_.Exception.Message
    }
  }
}

$result = [PSCustomObject]@{
  ok = $true
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  count = $items.Count
  items = $items
  note = "Diese Liste dient als Gewinn-Ausschlussliste. User duerfen teilnehmen, sollen aber beim Ziehen nicht gewinnen."
}

$result | ConvertTo-Json -Depth 8 | Set-Content -Path $OutFile -Encoding UTF8

Write-Host ""
Write-Host "Fertig:"
Write-Host $OutFile
Write-Host ""
Write-Host "Nicht aufgeloest:"
$items | Where-Object { -not $_.twitchUserId } | Select-Object login,error | Format-Table -AutoSize
