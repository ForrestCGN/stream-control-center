# collect_live_sound_trace.ps1
# Sammelt Live-Status fuer Sound-System, Alerts, VIP-Sound und SoundAlerts.
# Zweck: Timing-/Queue-/Overlay-Ueberschneidungen nachvollziehen.
#
# Ausfuehren:
#   cd D:\Git\stream-control-center
#   powershell -ExecutionPolicy Bypass -File .\collect_live_sound_trace.ps1
#
# Optional:
#   powershell -ExecutionPolicy Bypass -File .\collect_live_sound_trace.ps1 -DurationSeconds 120 -IntervalMs 500
#
# Wichtig:
# Starte dieses Script kurz VOR dem Test, dann waehrenddessen Alert/VIP/SoundAlert ausloesen.

param(
    [int]$DurationSeconds = 90,
    [int]$IntervalMs = 1000,
    [string]$ApiBase = "http://localhost:8080",
    [string]$RepoPath = "D:\Git\stream-control-center"
)

$ErrorActionPreference = "Continue"

$OutDir = Join-Path $RepoPath "_trace"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$JsonlOut = Join-Path $OutDir "live_sound_trace_$Timestamp.jsonl"
$SummaryOut = Join-Path $OutDir "live_sound_trace_$Timestamp.summary.txt"
$FinalJsonOut = Join-Path $OutDir "live_sound_trace_$Timestamp.final.json"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-ApiSafe {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Depth = 50
    )

    try {
        $data = Invoke-RestMethod -Uri $Url -TimeoutSec 5
        return [ordered]@{
            ok = $true
            name = $Name
            url = $Url
            data = $data
            error = ""
        }
    } catch {
        return [ordered]@{
            ok = $false
            name = $Name
            url = $Url
            data = $null
            error = $_.Exception.Message
        }
    }
}

function Compact-SoundStatus {
    param($data)

    if ($null -eq $data) { return $null }

    return [ordered]@{
        ok = $data.ok
        current = if ($data.current) {
            [ordered]@{
                requestId = $data.current.requestId
                soundId = $data.current.soundId
                label = $data.current.label
                category = $data.current.category
                priority = $data.current.priority
                outputTarget = $data.current.outputTarget
                source = $data.current.source
                file = $data.current.file
                durationMs = $data.current.durationMs
                startedAt = $data.current.startedAt
                endsAt = $data.current.endsAt
                requestedBy = $data.current.requestedBy
                visualModule = $data.current.visual.module
                visualType = $data.current.visual.type
            }
        } else { $null }
        queuedCount = $data.queuedCount
        queue = @($data.queue | ForEach-Object {
            [ordered]@{
                requestId = $_.requestId
                soundId = $_.soundId
                label = $_.label
                category = $_.category
                priority = $_.priority
                outputTarget = $_.outputTarget
                source = $_.source
                file = $_.file
                durationMs = $_.durationMs
                requestedBy = $_.requestedBy
                visualModule = $_.visual.module
                visualType = $_.visual.type
            }
        })
        parallelCount = $data.parallelCount
        parallel = @($data.parallel | ForEach-Object {
            [ordered]@{
                requestId = $_.requestId
                label = $_.label
                category = $_.category
                priority = $_.priority
                outputTarget = $_.outputTarget
                source = $_.source
                durationMs = $_.durationMs
            }
        })
        stats = $data.stats
        device = [ordered]@{
            lastOk = $data.device.lastOk
            lastAt = $data.device.lastAt
            lastError = $data.device.lastError
            lastFile = $data.device.lastResult.file
            lastDurationMs = $data.device.lastResult.durationMs
        }
        client = $data.client
    }
}

function Compact-AlertsQueue {
    param($data)

    if ($null -eq $data) { return $null }

    return [ordered]@{
        ok = $data.ok
        queueLength = $data.queueLength
        current = if ($data.current) {
            [ordered]@{
                eventUid = $data.current.eventUid
                source = $data.current.source
                type = $data.current.type_key
                user = $data.current.user_display
                status = $data.current.status
                startedAt = $data.current.started_at
                effectiveDurationMs = $data.current.effectiveDurationMs
                soundSystem = $data.current.soundSystem
                alertTts = $data.current.alertTts
            }
        } else { $null }
        queue = @($data.queue | ForEach-Object {
            [ordered]@{
                eventUid = $_.eventUid
                source = $_.source
                type = $_.type_key
                user = $_.user_display
                status = $_.status
                effectiveDurationMs = $_.effectiveDurationMs
            }
        })
    }
}

function Compact-VipStatus {
    param($data)

    if ($null -eq $data) { return $null }

    return [ordered]@{
        ok = $data.ok
        version = $data.version
        phase = $data.phase
        visible = $data.visible
        isActive = $data.isActive
        queuedCount = $data.queuedCount
        requestId = $data.requestId
        lastFinishedAt = $data.lastFinishedAt
        client = $data.client
        dbEventsRows = $data.db.eventsRows
        dbLastError = $data.db.lastError
    }
}

function Compact-SoundAlertsStatus {
    param($data)

    if ($null -eq $data) { return $null }

    return [ordered]@{
        ok = $data.ok
        module = $data.module
        version = $data.version
        wsConnected = $data.wsConnected
        stats = $data.stats
        lastEvent = if ($data.lastEvent) {
            [ordered]@{
                at = $data.lastEvent.at
                eventUid = $data.lastEvent.eventUid
                triggerUserDisplay = $data.lastEvent.triggerUserDisplay
                soundAlertName = $data.lastEvent.soundAlertName
                status = $data.lastEvent.status
                matchedRuleId = $data.lastEvent.matchedRuleId
                soundRequestId = $data.lastEvent.soundRequestId
                mediaType = $data.lastEvent.mediaType
                file = $data.lastEvent.file
                soundResult = $data.lastEvent.meta.soundResult
            }
        } else { $null }
    }
}

$start = Get-Date
$end = $start.AddSeconds($DurationSeconds)

$header = @"
Live Sound Trace
Start:        $($start.ToString("s"))
Duration:     $DurationSeconds seconds
IntervalMs:   $IntervalMs
ApiBase:      $ApiBase
JsonlOut:     $JsonlOut
SummaryOut:   $SummaryOut

Starte jetzt deinen Test im Stream-System.
"@

Write-Host $header
Set-Content -Path $SummaryOut -Value $header -Encoding UTF8

$samples = @()
$index = 0

while ((Get-Date) -lt $end) {
    $index++
    $now = Get-Date

    $sound = Get-ApiSafe -Name "sound" -Url "$ApiBase/api/sound/status"
    $alerts = Get-ApiSafe -Name "alerts" -Url "$ApiBase/api/alerts/queue"
    $vip = Get-ApiSafe -Name "vip" -Url "$ApiBase/api/vip-sound-overlay/status"
    $soundalerts = Get-ApiSafe -Name "soundalerts" -Url "$ApiBase/api/soundalerts/status"

    $entry = [ordered]@{
        sample = $index
        ts = $now.ToString("o")
        elapsedMs = [int]((New-TimeSpan -Start $start -End $now).TotalMilliseconds)
        compact = [ordered]@{
            sound = Compact-SoundStatus $sound.data
            alerts = Compact-AlertsQueue $alerts.data
            vip = Compact-VipStatus $vip.data
            soundalerts = Compact-SoundAlertsStatus $soundalerts.data
        }
        raw = [ordered]@{
            sound = $sound
            alerts = $alerts
            vip = $vip
            soundalerts = $soundalerts
        }
    }

    $samples += $entry
    ($entry | ConvertTo-Json -Depth 80 -Compress) | Add-Content -Path $JsonlOut -Encoding UTF8

    $soundCurrent = $entry.compact.sound.current
    $soundQueueCount = $entry.compact.sound.queuedCount
    $alertCurrent = $entry.compact.alerts.current
    $vipPhase = $entry.compact.vip.phase
    $saLast = $entry.compact.soundalerts.lastEvent

    $line = "[{0:HH:mm:ss}] sample={1} soundCurrent={2} soundQueue={3} alertCurrent={4} vip={5} soundalertsLast={6}" -f `
        $now, `
        $index, `
        ($(if ($soundCurrent) { "$($soundCurrent.category):$($soundCurrent.label)" } else { "-" })), `
        $soundQueueCount, `
        ($(if ($alertCurrent) { "$($alertCurrent.source):$($alertCurrent.type):$($alertCurrent.user)" } else { "-" })), `
        $vipPhase, `
        ($(if ($saLast) { "$($saLast.status):$($saLast.soundAlertName)" } else { "-" }))

    Write-Host $line
    Add-Content -Path $SummaryOut -Value $line -Encoding UTF8

    Start-Sleep -Milliseconds $IntervalMs
}

$final = [ordered]@{
    ok = $true
    startedAt = $start.ToString("o")
    finishedAt = (Get-Date).ToString("o")
    durationSeconds = $DurationSeconds
    intervalMs = $IntervalMs
    apiBase = $ApiBase
    sampleCount = $samples.Count
    jsonlOut = $JsonlOut
    summaryOut = $SummaryOut
    samples = $samples
}

$final | ConvertTo-Json -Depth 100 | Set-Content -Path $FinalJsonOut -Encoding UTF8

$footer = @"

Fertig.

Dateien:
JSONL:   $JsonlOut
JSON:    $FinalJsonOut
Summary: $SummaryOut

Bitte lade am besten die JSON-Datei hoch:
$FinalJsonOut
"@

Write-Host $footer
Add-Content -Path $SummaryOut -Value $footer -Encoding UTF8
