param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [int]$TraceSeconds = 135,
  [int]$IntervalMs = 500,

  [int]$GapAfterAlert1Ms = 1000,
  [int]$GapAfterSoundAlert1Ms = 500,
  [int]$GapAfterMod1Ms = 500,
  [int]$GapAfterTts1Ms = 1000,
  [int]$GapAfterAlert2Ms = 1000,
  [int]$GapAfterMod2Ms = 500,
  [int]$GapAfterTts2Ms = 500,
  [int]$GapAfterSoundAlert2Ms = 500,

  [string]$SoundAlert1File = "soundalerts/audio/madchen.mp3",
  [string]$SoundAlert2File = "soundalerts/audio/madchen.mp3",

  [string]$Mod1Login = "araglor",
  [string]$Mod1DisplayName = "Araglor",
  [string]$Mod2Login = "drudchen_cgn",
  [string]$Mod2DisplayName = "Drudchen_CGN",

  [string]$ActorLogin = "forrestcgn",
  [string]$ActorDisplayName = "ForrestCGN"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  $ts = Get-Date -Format "HH:mm:ss.fff"
  Write-Host "[$ts] $Message"
}

function Invoke-JsonPost {
  param(
    [string]$Url,
    [object]$Body
  )
  $json = $Body | ConvertTo-Json -Depth 40
  Write-Step "POST $Url"
  return Invoke-RestMethod -Method Post -Uri $Url -ContentType "application/json" -Body $json
}

function Invoke-JsonGet {
  param([string]$Url)
  Write-Step "GET $Url"
  return Invoke-RestMethod -Method Get -Uri $Url
}

function Add-Event {
  param(
    [System.Collections.ArrayList]$Events,
    [string]$RunLog,
    [string]$Name,
    [string]$Kind,
    [object]$Response
  )
  $entry = [ordered]@{
    at = (Get-Date).ToString("o")
    name = $Name
    kind = $Kind
    response = $Response
  }
  [void]$Events.Add($entry)
  $Events | ConvertTo-Json -Depth 50 | Set-Content -Path $RunLog -Encoding UTF8
}

function Trigger-AlertBits {
  param(
    [string]$BaseUrl,
    [string]$Name,
    [string]$Login,
    [string]$Message
  )
  $msg = [uri]::EscapeDataString($Message)
  $url = "$BaseUrl/api/alerts/twitch/bits?user=$Name&login=$Login&user_login=$Login&amount=100&message=$msg"
  return Invoke-JsonGet -Url $url
}

function Trigger-SoundAlert {
  param(
    [string]$BaseUrl,
    [string]$File,
    [string]$Label,
    [string]$RequestedBy
  )
  return Invoke-JsonPost -Url "$BaseUrl/api/sound/play" -Body @{
    file = $File
    label = $Label
    category = "channel_reward"
    priority = 70
    outputTarget = "device"
    target = "stream"
    volume = 100
    source = "trace_soundalert_realfile"
    requestedBy = $RequestedBy
    queueIfBusy = $true
    parallelAllowed = $false
    meta = @{
      traceScenario = "full_order_v5_real_mod"
      traceKind = "soundalert"
    }
  }
}

function Trigger-RealModSound {
  param(
    [string]$BaseUrl,
    [string]$TargetLogin,
    [string]$TargetDisplayName,
    [string]$ActorLogin,
    [string]$ActorDisplayName,
    [string]$StepName
  )

  # ECHTER VIP-/MOD-FLOW:
  # /api/vip-sound/admin/test geht durch vip_sound_overlay.js,
  # erzeugt Overlay-State und queueVipSoundInSoundSystem().
  # consumeDaily=false => Admin-/Override-Test, damit der Tagesverbrauch nicht blockiert.
  return Invoke-JsonPost -Url "$BaseUrl/api/vip-sound/admin/test" -Body @{
    targetLogin = $TargetLogin
    targetDisplayName = $TargetDisplayName
    login = $ActorLogin
    userLogin = $ActorLogin
    userName = $ActorLogin
    user = $ActorDisplayName
    displayName = $ActorDisplayName
    actorLogin = $ActorLogin
    actorDisplayName = $ActorDisplayName
    actorIsBroadcaster = "true"
    isBroadcaster = "true"
    source = "trace_v5_real_mod"
    trigger = "!modsound-trace"
    soundType = "mod"
    consumeDaily = $false
    selfTrigger = $false
    writeDailyUsage = $false
    meta = @{
      traceScenario = "full_order_v5_real_mod"
      traceKind = "real_mod_sound"
      traceStep = $StepName
    }
  }
}

function Trigger-NormalTts {
  param(
    [string]$BaseUrl,
    [string]$Text,
    [string]$User,
    [string]$DisplayName
  )
  return Invoke-JsonPost -Url "$BaseUrl/api/tts/say" -Body @{
    text = $Text
    user = $User
    login = $User
    userLogin = $User
    displayName = $DisplayName
    userDisplay = $DisplayName
    isBroadcaster = $true
    role = "broadcaster"
    source = "chat"
    mode = "chat"
    meta = @{
      traceScenario = "full_order_v5_real_mod"
      traceKind = "normal_tts"
    }
  }
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$TraceScript = Join-Path $RepoRoot "collect_live_sound_trace.ps1"
$TraceDir = Join-Path $RepoRoot "_trace"
$RunId = Get-Date -Format "yyyyMMdd_HHmmss"
$RunLog = Join-Path $TraceDir ("sound_queue_full_order_v5_real_mod_{0}.events.json" -f $RunId)

if (!(Test-Path $TraceScript)) {
  throw "Trace-Script nicht gefunden: $TraceScript"
}
if (!(Test-Path $TraceDir)) {
  New-Item -ItemType Directory -Path $TraceDir | Out-Null
}

$events = New-Object System.Collections.ArrayList

Write-Host ""
Write-Host "============================================================"
Write-Host " SOUND QUEUE FULL ORDER TRACE TEST V5 - REAL MOD"
Write-Host "============================================================"
Write-Host "RepoRoot:      $RepoRoot"
Write-Host "BaseUrl:       $BaseUrl"
Write-Host "TraceSeconds:  $TraceSeconds"
Write-Host "IntervalMs:    $IntervalMs"
Write-Host "EventLog:      $RunLog"
Write-Host ""
Write-Host "Sequenz:"
Write-Host "1 Alert, SoundAlert, Mod Araglor, TTS, 2 Alert, Mod Drudchen_CGN, TTS, SoundAlert, 3 Alert"
Write-Host "============================================================"
Write-Host ""

$traceArgs = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$TraceScript`"",
  "-DurationSeconds", "$TraceSeconds",
  "-IntervalMs", "$IntervalMs"
)

Write-Step "Starte Trace..."
$traceProcess = Start-Process -FilePath "powershell.exe" -ArgumentList $traceArgs -PassThru -WindowStyle Normal
Start-Sleep -Milliseconds 1500

try {
  # Vor dem Test Queue hart leeren.
  try {
    $clear = Invoke-JsonPost -Url "$BaseUrl/api/sound/clear" -Body @{}
    Add-Event -Events $events -RunLog $RunLog -Name "00_sound_clear" -Kind "system" -Response $clear
  } catch {
    Write-Step "WARN: /api/sound/clear fehlgeschlagen: $($_.Exception.Message)"
  }

  try {
    $stop = Invoke-JsonPost -Url "$BaseUrl/api/sound/stop?clearQueue=1" -Body @{}
    Add-Event -Events $events -RunLog $RunLog -Name "00_sound_stop_clear" -Kind "system" -Response $stop
  } catch {
    Write-Step "WARN: /api/sound/stop?clearQueue=1 fehlgeschlagen: $($_.Exception.Message)"
  }

  try {
    $ttsClear = Invoke-JsonPost -Url "$BaseUrl/api/tts/clear" -Body @{}
    Add-Event -Events $events -RunLog $RunLog -Name "00_tts_clear" -Kind "system" -Response $ttsClear
  } catch {
    Write-Step "WARN: /api/tts/clear fehlgeschlagen: $($_.Exception.Message)"
  }

  try {
    $vipReset = Invoke-JsonPost -Url "$BaseUrl/api/vip-sound/reset" -Body @{}
    Add-Event -Events $events -RunLog $RunLog -Name "00_vip_overlay_reset" -Kind "system" -Response $vipReset
  } catch {
    Write-Step "WARN: /api/vip-sound/reset fehlgeschlagen: $($_.Exception.Message)"
  }

  Start-Sleep -Milliseconds 750

  # 1 Alert
  $r = Trigger-AlertBits -BaseUrl $BaseUrl -Name "TraceAlertOne" -Login "tracealertone" -Message "V5 eins: erster Alert mit TTS."
  Add-Event -Events $events -RunLog $RunLog -Name "01_alert_1_bits_100_tts" -Kind "alert" -Response $r
  Start-Sleep -Milliseconds $GapAfterAlert1Ms

  # SoundAlert
  $r = Trigger-SoundAlert -BaseUrl $BaseUrl -File $SoundAlert1File -Label "V5 SoundAlert 1" -RequestedBy "TraceSoundAlertOne"
  Add-Event -Events $events -RunLog $RunLog -Name "02_soundalert_1" -Kind "soundalert" -Response $r
  Start-Sleep -Milliseconds $GapAfterSoundAlert1Ms

  # echter Mod-Sound Araglor
  $r = Trigger-RealModSound -BaseUrl $BaseUrl -TargetLogin $Mod1Login -TargetDisplayName $Mod1DisplayName -ActorLogin $ActorLogin -ActorDisplayName $ActorDisplayName -StepName "03_mod_araglor"
  Add-Event -Events $events -RunLog $RunLog -Name "03_real_mod_sound_araglor" -Kind "real_mod_sound" -Response $r
  Start-Sleep -Milliseconds $GapAfterMod1Ms

  # normales TTS
  $r = Trigger-NormalTts -BaseUrl $BaseUrl -Text "V5 normales TTS eins. Dieser Satz testet die normale TTS Queue." -User "trace_tts_one" -DisplayName "TraceTTSOne"
  Add-Event -Events $events -RunLog $RunLog -Name "04_normal_tts_1" -Kind "normal_tts" -Response $r
  Start-Sleep -Milliseconds $GapAfterTts1Ms

  # 2 Alert
  $r = Trigger-AlertBits -BaseUrl $BaseUrl -Name "TraceAlertTwo" -Login "tracealerttwo" -Message "V5 zwei: zweiter Alert mit TTS."
  Add-Event -Events $events -RunLog $RunLog -Name "05_alert_2_bits_100_tts" -Kind "alert" -Response $r
  Start-Sleep -Milliseconds $GapAfterAlert2Ms

  # echter Mod-Sound Drudchen_CGN
  $r = Trigger-RealModSound -BaseUrl $BaseUrl -TargetLogin $Mod2Login -TargetDisplayName $Mod2DisplayName -ActorLogin $ActorLogin -ActorDisplayName $ActorDisplayName -StepName "06_mod_drudchen_cgn"
  Add-Event -Events $events -RunLog $RunLog -Name "06_real_mod_sound_drudchen_cgn" -Kind "real_mod_sound" -Response $r
  Start-Sleep -Milliseconds $GapAfterMod2Ms

  # normales TTS
  $r = Trigger-NormalTts -BaseUrl $BaseUrl -Text "V5 normales TTS zwei. Dieser Satz testet die zweite normale TTS Queue." -User "trace_tts_two" -DisplayName "TraceTTSTwo"
  Add-Event -Events $events -RunLog $RunLog -Name "07_normal_tts_2" -Kind "normal_tts" -Response $r
  Start-Sleep -Milliseconds $GapAfterTts2Ms

  # SoundAlert
  $r = Trigger-SoundAlert -BaseUrl $BaseUrl -File $SoundAlert2File -Label "V5 SoundAlert 2" -RequestedBy "TraceSoundAlertTwo"
  Add-Event -Events $events -RunLog $RunLog -Name "08_soundalert_2" -Kind "soundalert" -Response $r
  Start-Sleep -Milliseconds $GapAfterSoundAlert2Ms

  # 3 Alert
  $r = Trigger-AlertBits -BaseUrl $BaseUrl -Name "TraceAlertThree" -Login "tracealertthree" -Message "V5 drei: dritter Alert mit TTS."
  Add-Event -Events $events -RunLog $RunLog -Name "09_alert_3_bits_100_tts" -Kind "alert" -Response $r

  Write-Step "Komplette V5-Sequenz abgeschickt. Warte auf Trace-Ende..."
  Wait-Process -Id $traceProcess.Id

  $latestFinal = Get-ChildItem $TraceDir -Filter "*.final.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

  Write-Host ""
  Write-Host "============================================================"
  Write-Host " TEST FERTIG"
  Write-Host "============================================================"
  Write-Host "EventLog: $RunLog"
  if ($latestFinal) {
    Write-Host "FinalTrace: $($latestFinal.FullName)"
  } else {
    Write-Host "FinalTrace: NICHT GEFUNDEN"
  }
  Write-Host "Bitte FinalTrace und EventLog hochladen."
  Write-Host "============================================================"
  Write-Host ""
}
catch {
  Write-Host ""
  Write-Host "[FEHLER] $($_.Exception.Message)" -ForegroundColor Red
  try {
    if ($traceProcess -and !$traceProcess.HasExited) {
      Write-Step "Trace-Prozess laeuft noch; warte kurz..."
      Wait-Process -Id $traceProcess.Id -Timeout 5 -ErrorAction SilentlyContinue
    }
  } catch {}
  throw
}
