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

$data = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$endpoint = "$BaseUrl/api/clip-shoutout/texts"

Write-Host ""
Write-Host "CGN Shoutout-Textimport CAN-44.21.13"
Write-Host "Endpoint: $endpoint"
Write-Host "DryRun: $DryRun"
Write-Host ""

$updated = 0
$failed = 0

foreach ($prop in $data.PSObject.Properties) {
  $key = [string]$prop.Name
  $item = $prop.Value
  $category = [string]$item.category
  $variants = @($item.variants | ForEach-Object { [string]$_ } | Where-Object { $_.Trim().Length -gt 0 })

  if ($variants.Count -lt 1) {
    Write-Warning "Überspringe $key, keine Varianten."
    continue
  }

  Write-Host "[$key] $($variants.Count) Varianten -> $category"

  if ($DryRun) {
    continue
  }

  $body = @{
    action = "replaceKeyVariants"
    key = $key
    category = $category
    variants = $variants
  } | ConvertTo-Json -Depth 10

  try {
    $result = Invoke-RestMethod -Method POST -Uri $endpoint -ContentType "application/json; charset=utf-8" -Body $body
    if ($result.ok -eq $false) {
      $failed++
      Write-Warning "Fehler bei ${key}: $($result.error)"
    } else {
      $updated++
    }
  } catch {
    $failed++
    Write-Warning "Fehler bei ${key}: $($_.Exception.Message)"
  }
}

Write-Host ""
if ($DryRun) {
  Write-Host "DryRun fertig. Es wurde nichts gespeichert."
} else {
  Write-Host "Import fertig. Gespeichert: $updated, Fehler: $failed"
}

Write-Host ""
Write-Host "Prüfen:"
Write-Host 'Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts" | ConvertTo-Json -Depth 30'
