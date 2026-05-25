param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function Get-Json([string]$Url) {
  try {
    return Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 8
  } catch {
    Log "WARN request failed url=$Url error=$($_.Exception.Message)"
    return $null
  }
}

function Test-Url([string]$Url) {
  try {
    $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method GET -TimeoutSec 8
    return [int]$res.StatusCode
  } catch {
    return 0
  }
}

Log "STEP398 VIP current state audit started"
Log "BaseUrl=$BaseUrl"

$overlayUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html"
$overlayDebugUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html?debug=1"
$statusCode = Test-Url $overlayUrl
Log "VipOverlayUrlStatus=$statusCode url=$overlayUrl"

$routes = Get-Json "$BaseUrl/api/vip-sound/routes"
if ($routes) {
  Log "VipRoutes ok=$($routes.ok) module=$($routes.module) version=$($routes.version) canonicalPrefix=$($routes.canonicalPrefix) count=$($routes.count)"
  if ($routes.intentionallyNotRegistered) {
    Log "VipIntentionallyNotRegistered=$($routes.intentionallyNotRegistered -join ',')"
  }
} else {
  Log "VipRoutes unavailable"
}

$integration = Get-Json "$BaseUrl/api/vip-sound/integration-check"
if ($integration) {
  Log "VipIntegration ok=$($integration.ok) module=$($integration.module) version=$($integration.version) schemaVersion=$($integration.schemaVersion)"
  if ($integration.summary) {
    Log "VipIntegrationSummary total=$($integration.summary.total) ok=$($integration.summary.ok) warnings=$($integration.summary.warnings) errors=$($integration.summary.errors)"
  }
} else {
  Log "VipIntegration unavailable"
}

$status = Get-Json "$BaseUrl/api/vip-sound/status"
if ($status) {
  Log "VipStatus ok=$($status.ok) module=$($status.module) version=$($status.version)"
  if ($status.state) {
    Log "VipState isActive=$($status.state.isActive) queueLength=$($status.state.queueLength)"
  }
}

$summary = Get-Json "$BaseUrl/api/vip-sound/admin/summary"
if ($summary) {
  Log "VipAdminSummary ok=$($summary.ok)"
  if ($summary.status) {
    Log "VipAdminStatus enabled=$($summary.status.enabled) active=$($summary.status.isActive) queueLength=$($summary.status.queueLength)"
  }
}

$sound = Get-Json "$BaseUrl/api/sound/status"
if ($sound) {
  $cur = $sound.current
  $queueCount = 0
  if ($sound.queue) { $queueCount = @($sound.queue).Count }
  Log "SoundStatus ok=$($sound.ok) module=$($sound.module) currentRequestId=$($cur.requestId) currentCategory=$($cur.category) queuedCount=$queueCount"
  if ($sound.soundBus) {
    Log "SoundBus enabled=$($sound.soundBus.enabled) channel=$($sound.soundBus.channel)"
  }
}

$comm = Get-Json "$BaseUrl/api/communication/status"
if ($comm -and $comm.status -and $comm.status.clients) {
  $clients = @($comm.status.clients)
  $vipClients = @($clients | Where-Object { $_.module -match 'vip' -or $_.id -match 'vip' })
  if ($vipClients.Count -gt 0) {
    foreach ($c in $vipClients) {
      Log "VipBusClient id=$($c.id) module=$($c.module) type=$($c.type) status=$($c.status)"
    }
  } else {
    Log "VipBusClient none_detected_expected_for_audit"
  }
} else {
  Log "CommunicationStatus unavailable_or_no_clients"
}

Log "STEP398_STATUS=COLLECTED"
Log "Next recommended step: STEP399 VIP overlay bus shadow registration, no production switch."
