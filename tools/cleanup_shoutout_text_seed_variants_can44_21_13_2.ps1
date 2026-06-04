param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptDir "shoutout_text_variants_cgn_altersheim_can44_21_13.json"

if (!(Test-Path $jsonPath)) {
  throw "JSON-Datei nicht gefunden: $jsonPath"
}

$approved = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$endpoint = "$BaseUrl/api/clip-shoutout/texts"

Write-Host ""
Write-Host "CAN-44.21.13.2 - Shoutout Text Seed Cleanup"
Write-Host "Endpoint: $endpoint"
Write-Host "DryRun: $DryRun"
Write-Host ""

$result = Invoke-RestMethod -Method GET -Uri $endpoint
if ($result.ok -eq $false) {
  throw "GET /api/clip-shoutout/texts meldet ok=false"
}

$keys = @($result.texts.keys)
$disabled = 0
$kept = 0
$checked = 0

foreach ($keyItem in $keys) {
  $key = [string]$keyItem.key
  if (-not $approved.PSObject.Properties.Name.Contains($key)) {
    continue
  }

  $approvedItem = $approved.$key
  $approvedValues = @($approvedItem.variants | ForEach-Object { [string]$_ })

  foreach ($variant in @($keyItem.variants)) {
    $checked++
    $value = [string]$variant.value
    $isApproved = $approvedValues -contains $value
    $isEnabled = [bool]$variant.enabled

    if ($isApproved -and $isEnabled) {
      $kept++
      continue
    }

    if (-not $isEnabled) {
      continue
    }

    $label = "[{0}] id={1} source={2}" -f $key, $variant.id, $variant.source
    Write-Host "Deaktiviere $label"
    Write-Host "  $value"

    if (-not $DryRun) {
      $body = @{
        action = "saveVariant"
        variant = @{
          id = $variant.id
          key = $key
          category = [string]$variant.category
          value = $value
          enabled = $false
          weight = if ($variant.weight) { [int]$variant.weight } else { 1 }
          sortOrder = if ($null -ne $variant.sortOrder) { [int]$variant.sortOrder } else { 0 }
          description = [string]$variant.description
        }
      } | ConvertTo-Json -Depth 12

      $save = Invoke-RestMethod -Method POST -Uri $endpoint -ContentType "application/json; charset=utf-8" -Body $body
      if ($save.ok -eq $false) {
        Write-Warning "Konnte Variante $($variant.id) nicht deaktivieren."
      } else {
        $disabled++
      }
    } else {
      $disabled++
    }
  }
}

Write-Host ""
Write-Host "Geprüft: $checked"
Write-Host "Behalten aktiv: $kept"
if ($DryRun) {
  Write-Host "Würde deaktivieren: $disabled"
  Write-Host "DryRun fertig. Es wurde nichts gespeichert."
} else {
  Write-Host "Deaktiviert: $disabled"
  Write-Host "Cleanup fertig."
}

Write-Host ""
Write-Host "Danach prüfen:"
Write-Host 'Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts" | ConvertTo-Json -Depth 30'
