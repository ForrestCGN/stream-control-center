param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$GiveawayUid = "",
  [string]$ExclusionList = "",
  [switch]$OpenOverlay,
  [switch]$OpenDashboard,
  [switch]$NoWrite
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$log = Join-Path (Get-Location) "LWG_EVENING_FULL_FLOW_TEST_$ts.log"

function Log($msg = "") {
  $line = if ($msg -is [string]) { $msg } else { ($msg | ConvertTo-Json -Depth 16) }
  Add-Content -Path $log -Encoding UTF8 -Value $line
  Write-Host $line
}

function Section($title) {
  Log ""
  Log "============================================================"
  Log $title
  Log "============================================================"
}

function ApiGet($path) {
  $uri = "$BaseUrl$path"
  Log "GET $uri"
  $r = Invoke-RestMethod -Method Get -Uri $uri
  Add-Content -Path $log -Encoding UTF8 -Value ($r | ConvertTo-Json -Depth 24)
  return $r
}

function ApiPost($path, $body = @{}) {
  $uri = "$BaseUrl$path"
  Log "POST $uri"
  Add-Content -Path $log -Encoding UTF8 -Value ($body | ConvertTo-Json -Depth 16)
  $json = $body | ConvertTo-Json -Depth 16
  $r = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $json
  Add-Content -Path $log -Encoding UTF8 -Value ($r | ConvertTo-Json -Depth 24)
  return $r
}

function AskYes($question, [bool]$default = $false) {
  $suffix = if ($default) { "[J/n]" } else { "[j/N]" }
  $answer = Read-Host "$question $suffix"
  if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
  return @("j","ja","y","yes") -contains $answer.Trim().ToLowerInvariant()
}

function Fail($msg) {
  Log "FEHLER: $msg"
  throw $msg
}

function Select-Giveaway() {
  Section "Giveaway-Auswahl"
  $list = ApiGet "/api/loyalty/giveaways?limit=50"
  $rows = @($list.rows)
  if (-not $rows -or $rows.Count -eq 0) { Fail "Keine Giveaways gefunden." }
  for ($i = 0; $i -lt $rows.Count; $i++) {
    $g = $rows[$i]
    Write-Host ("[{0}] {1} | {2} | wheel={3} | ready={4} | {5}" -f ($i+1), $g.title, $g.status, $g.wheelEnabled, $g.canOpen, $g.giveawayUid)
  }
  do {
    $sel = Read-Host "Nummer des zu testenden Giveaways"
    $idx = [int]$sel - 1
  } while ($idx -lt 0 -or $idx -ge $rows.Count)
  return $rows[$idx].giveawayUid
}

Section "Start"
Log "LWG Evening Full Flow Test"
Log "Gestartet: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Log "BaseUrl: $BaseUrl"
Log "Log: $log"
Log "NoWrite: $NoWrite"

if ($OpenDashboard) {
  Start-Process "$BaseUrl/dashboard"
  Log "Dashboard geöffnet."
}
if ($OpenOverlay) {
  Start-Process "$BaseUrl/overlays/loyalty/wheel_overlay.html"
  Log "Glücksrad-Overlay im Browser geöffnet. In OBS sollte die Browserquelle trotzdem über Bus/Visibility nur beim Spin sichtbar sein."
}

Section "Status-Checks"
$core = ApiGet "/api/loyalty/status"
$games = ApiGet "/api/loyalty/games/status"
$giveaways = ApiGet "/api/loyalty/giveaways/status"
if (-not $core.ok) { Fail "Loyalty Core nicht ok" }
if (-not $games.ok) { Fail "Loyalty Games nicht ok" }
if (-not $giveaways.ok) { Fail "Loyalty Giveaways nicht ok" }
Log "OK: Core/Games/Giveaways laufen."

if ([string]::IsNullOrWhiteSpace($GiveawayUid)) {
  $GiveawayUid = Select-Giveaway
}
Log "Ausgewähltes Giveaway: $GiveawayUid"

Section "Giveaway prüfen"
$detail = ApiGet "/api/loyalty/giveaways/$GiveawayUid"
$g = $detail.giveaway
if (-not $g) { Fail "Giveaway nicht gefunden: $GiveawayUid" }
Log ("Titel: {0}" -f $g.title)
Log ("Status: {0}" -f $g.status)
Log ("WheelEnabled: {0}" -f $g.wheelEnabled)
Log ("SetupComplete: {0}" -f $g.setupComplete)
Log ("CanOpen: {0}" -f $g.canOpen)
if ($g.setupIssues -and @($g.setupIssues).Count -gt 0) {
  Log "Setup-Issues:"
  Log ($g.setupIssues | ConvertTo-Json -Depth 8)
}
if (-not $g.wheelEnabled) { Fail "Dieses Giveaway ist kein Glücksrad-Giveaway." }

Section "Bound-Wheel prüfen"
$bound = ApiGet "/api/loyalty/giveaways/$GiveawayUid/wheel/bound"
$fields = ApiGet "/api/loyalty/giveaways/$GiveawayUid/wheel/bound/fields"
$fieldCount = if ($fields.fields) { @($fields.fields).Count } elseif ($fields.rows) { @($fields.rows).Count } else { 0 }
Log ("BoundWheel: {0}" -f $bound.boundWheel.boundWheelUid)
Log ("Felder: {0}" -f $fieldCount)
if ($fieldCount -lt 1) { Fail "Bound-Wheel hat keine Felder. Nicht weiter testen." }
if (-not $g.canOpen -and $g.status -eq "draft") { Fail "Giveaway ist nicht startbereit." }

if ($NoWrite) {
  Section "NoWrite Ende"
  Log "NoWrite gesetzt: keine Open/Entry/Close/Draw Aktionen ausgeführt."
  Write-Host "Log-Datei: $log"
  exit 0
}

Section "Optional: Giveaway öffnen"
if ($g.status -eq "draft") {
  if (AskYes "Giveaway jetzt öffnen/starten?" $true) {
    $open = ApiPost "/api/loyalty/giveaways/$GiveawayUid/open" @{ actor="evening_test"; reason="evening_full_flow_test" }
    $g = $open.giveaway
    Log ("Neuer Status: {0}" -f $g.status)
  } else { Fail "Ohne Öffnen geht der Flow-Test nicht weiter." }
} elseif ($g.status -eq "open") {
  Log "Giveaway ist bereits offen."
} else {
  Log "Giveaway ist nicht draft/open, aktueller Status: $($g.status)"
}

Section "Entries prüfen / optional Test-Entries"
$entriesBefore = ApiGet "/api/loyalty/giveaways/$GiveawayUid/entries?includeCancelled=true&limit=200"
Log ("Entries vorher: {0}" -f $entriesBefore.count)
if (AskYes "Test-Entries hinzufügen? Nur bei Test-Kopie empfohlen." $false) {
  $namesRaw = Read-Host "Logins kommagetrennt (Standard: forrest_test,una_solala)"
  if ([string]::IsNullOrWhiteSpace($namesRaw)) { $namesRaw = "forrest_test,una_solala" }
  $names = $namesRaw.Split(",") | ForEach-Object { $_.Trim().TrimStart("@").ToLowerInvariant() } | Where-Object { $_ }
  foreach ($name in $names) {
    try {
      $body = @{ userLogin=$name; userDisplayName=$name; ticketCount=1; source="evening_test" }
      $r = ApiPost "/api/loyalty/giveaways/$GiveawayUid/entries" $body
      Log ("Entry für {0}: ok={1}" -f $name, $r.ok)
    } catch {
      Log ("Entry für {0} fehlgeschlagen: {1}" -f $name, $_.Exception.Message)
    }
  }
}

if (-not [string]::IsNullOrWhiteSpace($ExclusionList)) {
  Section "Ausschlussliste anwenden"
  if (-not (Test-Path $ExclusionList)) { Fail "Ausschlussliste nicht gefunden: $ExclusionList" }
  if (Test-Path ".\tools\lwg_apply_winner_exclusion_to_entries.js") {
    Log "Dry-Run Ausschlussliste"
    & node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=$GiveawayUid --list=$ExclusionList --dry-run 2>&1 | Tee-Object -FilePath $log -Append
    if (AskYes "Ausschlussliste jetzt wirklich anwenden?" $true) {
      & node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=$GiveawayUid --list=$ExclusionList 2>&1 | Tee-Object -FilePath $log -Append
    }
  } else {
    Log "WARNUNG: tools/lwg_apply_winner_exclusion_to_entries.js fehlt. Ausschluss wird übersprungen."
  }
} else {
  Log "Keine Ausschlussliste angegeben."
}

$entriesAfter = ApiGet "/api/loyalty/giveaways/$GiveawayUid/entries?includeCancelled=true&limit=200"
Log ("Entries nach Vorbereitung: {0}" -f $entriesAfter.count)
$eligible = @($entriesAfter.rows | Where-Object { $_.status -ne "cancelled" -and [int]$_.ticketWeight -gt 0 })
Log ("Gewinnberechtigte Entries ticketWeight>0: {0}" -f $eligible.Count)
if ($eligible.Count -lt 1) { Fail "Keine gewinnberechtigten Entries vorhanden." }

Section "Close"
if (AskYes "Giveaway jetzt schließen?" $true) {
  $close = ApiPost "/api/loyalty/giveaways/$GiveawayUid/close" @{ actor="evening_test"; reason="evening_full_flow_test_close"; silent=$true }
  Log ("Close Status: {0}" -f $close.giveaway.status)
} else { Fail "Ohne Close ist Draw nicht erlaubt." }

Section "Draw"
if (AskYes "Jetzt Gewinner ziehen?" $true) {
  $draw = ApiPost "/api/loyalty/giveaways/$GiveawayUid/draw" @{ actor="evening_test"; reason="evening_full_flow_test_draw" }
  $winner = $draw.winner
  Log ("Winner: {0} / {1}" -f $winner.userLogin, $winner.userDisplayName)
  if ($draw.wheelPermission) { Log ("WheelPermission: {0}" -f $draw.wheelPermission.permissionUid) }
} else { Fail "Draw übersprungen." }

Section "Wheel-Permission prüfen"
$perms = ApiGet "/api/loyalty/giveaways/$GiveawayUid/wheel/permissions"
$pending = @($perms.rows | Where-Object { $_.status -eq "pending" })
Log ("Pending Wheel-Permissions: {0}" -f $pending.Count)
if ($pending.Count -gt 0) {
  $p = $pending[0]
  Log ("Pending für: {0} / {1}" -f $p.userLogin, $p.userDisplayName)
  if (AskYes "Wheel-Claim/Spin jetzt über Bus auslösen? Overlay sollte jetzt sichtbar werden." $true) {
    $claim = ApiPost "/api/loyalty/giveaways/$GiveawayUid/wheel/claim" @{ userLogin=$p.userLogin; userDisplayName=$p.userDisplayName; source="evening_test" }
    Log ("Claim ok: {0}" -f $claim.ok)
    $dur = 9000
    try { if ($claim.spin.durationMs) { $dur = [int]$claim.spin.durationMs + 3000 } } catch {}
    Log "Warte auf Spin-Ende: $dur ms"
    Start-Sleep -Milliseconds $dur
    $wheelStatus = ApiGet "/api/loyalty/games/wheel/status"
    Log ("Wheel running: {0}" -f $wheelStatus.running)
    Log "Sende Wheel reset. Danach sollte Overlay/OBS wieder ausgeblendet oder transparent sein."
    try { ApiPost "/api/loyalty/games/wheel/reset" @{ source="evening_test_reset" } | Out-Null } catch { Log "Reset fehlgeschlagen: $($_.Exception.Message)" }
  }
} else {
  Log "Keine pending Wheel-Permission gefunden. Prüfe Draw-Ausgabe."
}

Section "Finale Statusabfrage"
ApiGet "/api/loyalty/giveaways/$GiveawayUid" | Out-Null
ApiGet "/api/loyalty/games/wheel/status" | Out-Null
Log "Fertig. Log-Datei: $log"
Write-Host ""
Write-Host "Fertig. Log-Datei:" $log
