param(
  [switch]$Apply,
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Invoke-ClipApi {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [string]$Method = "GET",
    [object]$Body = $null
  )

  $uri = "$BaseUrl$Path"

  if ($Method -eq "GET") {
    return Invoke-RestMethod -Uri $uri -Method GET
  }

  $json = $Body | ConvertTo-Json -Depth 30
  return Invoke-RestMethod -Uri $uri -Method $Method -ContentType "application/json; charset=utf-8" -Body $json
}

$desired = @(
  @{
    key="chatClipActivated"; category="chat"; variants=@(
      "/me 📋 Vorgang aufgenommen. Die Heimaufsicht sichert Beweismaterial.",
      "/me 🎬 Beweise werden gesichert. Die Heimaufsicht ist dran."
    )
  },
  @{
    key="chatClipCreated"; category="chat"; variants=@(
      "/me ✅ Beweismaterial gesichert: {clipUrl}",
      "/me 📋 Vorgang abgeschlossen. Clip liegt vor: {clipUrl}"
    )
  },
  @{
    key="chatClipCreatedWithoutUrl"; category="errors"; variants=@(
      "/me ⚠️ Twitch hat den Vorgang angenommen, aber der Clip-Link ist noch nicht bereit.",
      "/me 📋 Clip-Sicherung läuft, aber die URL fehlt noch. Die Heimaufsicht wartet."
    )
  },
  @{
    key="chatClipFailed"; category="errors"; variants=@(
      "/me ❌ Die Heimaufsicht konnte den Clip gerade nicht sichern.",
      "/me ⚠️ Clip-Sicherung fehlgeschlagen. Der Vorgang wurde notiert."
    )
  },
  @{
    key="chatLocalReplayMissing"; category="errors"; variants=@(
      "/me ⚠️ Twitch-Clip verarbeitet, aber keine lokale Aufnahme gefunden.",
      "/me 📼 Lokales Beweismaterial fehlt. Die Heimaufsicht prüft den Replay-Ordner."
    )
  },
  @{
    key="chatLocalReplayInvalidDir"; category="errors"; variants=@(
      "/me ⚠️ Replay-Ordner ungültig: {clipsDir}",
      "/me 🚧 Die Heimaufsicht findet den Aufnahmeordner nicht: {clipsDir}"
    )
  },
  @{
    key="chatReplaySaved"; category="chat"; variants=@(
      "/me 📼 Lokale Aufnahme wurde gesichert.",
      "/me 🗂️ Beweismaterial wurde lokal archiviert."
    )
  },
  @{
    key="chatClipDuplicate"; category="chat"; variants=@(
      "/me ℹ️ Dieser Vorgang liegt der Heimaufsicht bereits vor.",
      "/me 📋 Doppelte Meldung erkannt. Beweismaterial wurde schon gesichert."
    )
  },
  @{
    key="discordClipPost"; category="discord"; variants=@(
      "🎬 **Heimaufsicht: Beweismaterial gesichert**`n`n**Titel:** {clipTitle}`n**Spiel:** {gameName}`n**Ausgelöst von:** {triggerUser}`n`n{clipUrl}",
      "📼 **Neue Aufnahme im CGN-Archiv**`n`nDie Heimaufsicht hat einen Clip gesichert.`n`n**Titel:** {clipTitle}`n**Spiel:** {gameName}`n**Gemeldet von:** {triggerUser}`n`n{clipUrl}"
    )
  },
  @{
    key="discordClipPartial"; category="discord"; variants=@(
      "⚠️ **Heimaufsicht: Clip teilweise verarbeitet**`n`n**Titel:** {clipTitle}`n**Status:** {status}`n**Grund:** {reason}`n`n{clipUrl}",
      "📋 **Hinweis der Heimaufsicht**`n`nDer Clip wurde nicht vollständig verarbeitet.`n`n**Titel:** {clipTitle}`n**Spiel:** {gameName}`n**Grund:** {reason}`n`n{clipUrl}"
    )
  },
  @{
    key="discordClipFailed"; category="discord"; variants=@(
      "❌ **Heimaufsicht: Clip-Sicherung fehlgeschlagen**`n`n**Titel:** {clipTitle}`n**Spiel:** {gameName}`n**Grund:** {reason}",
      "🚨 **Aufnahme konnte nicht gesichert werden**`n`nDie Heimaufsicht konnte den Clip nicht vollständig verarbeiten.`n`n**Titel:** {clipTitle}`n**Fehler:** {reason}"
    )
  },
  @{
    key="systemDisabled"; category="system"; variants=@(
      "Die Heimaufsicht ist für Clips aktuell deaktiviert."
    )
  },
  @{
    key="systemBackendNotReady"; category="system"; variants=@(
      "Clip-Backend ist nicht bereit. Die Heimaufsicht kann nicht arbeiten."
    )
  },
  @{
    key="systemTwitchScopeMissing"; category="system"; variants=@(
      "Der Heimaufsicht fehlt die Twitch-Berechtigung clips:edit."
    )
  },
  @{
    key="systemObsReplayNotReady"; category="system"; variants=@(
      "OBS Replay Buffer ist nicht aktiv. Lokale Aufnahmen können nicht gesichert werden."
    )
  },
  @{
    key="systemStreamNotLive"; category="system"; variants=@(
      "Die Heimaufsicht clippt nur im Live-Betrieb. Vorgang wurde übersprungen."
    )
  }
)

Write-Host "Lese aktuelle Clip-Textvarianten von $BaseUrl ..." -ForegroundColor Cyan
$current = Invoke-ClipApi -Path "/api/clip/admin/texts"

if (-not $current.ok) {
  throw "Clip-Text-API antwortet nicht ok."
}

$keys = @()
if ($current.texts -and $current.texts.keys) {
  $keys = @($current.texts.keys)
}

Write-Host ""
Write-Host "STEP192 Clip Textvarianten Heimaufsicht FINAL" -ForegroundColor Cyan
Write-Host "Apply: $Apply"
Write-Host ""

foreach ($entry in $desired) {
  $key = [string]$entry.key
  $category = [string]$entry.category
  $targetTexts = @($entry.variants)

  $existingKey = $keys | Where-Object { $_.key -eq $key } | Select-Object -First 1
  $existingVariants = @()
  if ($existingKey -and $existingKey.variants) {
    $existingVariants = @($existingKey.variants)
  }

  Write-Host "Text-Key: $key ($category)" -ForegroundColor Yellow

  foreach ($variant in $existingVariants) {
    if ($variant.enabled -eq $true) {
      Write-Host "  deaktivieren: id=$($variant.id) $($variant.value)" -ForegroundColor DarkYellow

      if ($Apply) {
        Invoke-ClipApi -Path "/api/clip/admin/texts" -Method "POST" -Body @{
          action = "saveVariant"
          variant = @{
            id = [int]$variant.id
            key = $key
            category = $category
            value = [string]$variant.value
            enabled = $false
            weight = [int]($variant.weight -as [int])
          }
        } | Out-Null
      }
    }
  }

  foreach ($text in $targetTexts) {
    $match = $existingVariants | Where-Object { [string]$_.value -eq [string]$text } | Select-Object -First 1

    if ($match) {
      Write-Host "  aktivieren: id=$($match.id) $text" -ForegroundColor Green

      if ($Apply) {
        Invoke-ClipApi -Path "/api/clip/admin/texts" -Method "POST" -Body @{
          action = "saveVariant"
          variant = @{
            id = [int]$match.id
            key = $key
            category = $category
            value = [string]$text
            enabled = $true
            weight = 1
          }
        } | Out-Null
      }
    } else {
      Write-Host "  neu anlegen: $text" -ForegroundColor Green

      if ($Apply) {
        Invoke-ClipApi -Path "/api/clip/admin/texts" -Method "POST" -Body @{
          action = "saveVariant"
          variant = @{
            key = $key
            category = $category
            value = [string]$text
            enabled = $true
            weight = 1
          }
        } | Out-Null
      }
    }
  }

  Write-Host ""
}

if (-not $Apply) {
  Write-Host "DRY-RUN: Es wurde nichts gespeichert." -ForegroundColor Magenta
  Write-Host "Zum Anwenden ausführen:" -ForegroundColor Magenta
  Write-Host "powershell -ExecutionPolicy Bypass -File .\tools\clip_textvariants_step192_heimaufsicht_final.ps1 -Apply" -ForegroundColor Magenta
} else {
  Write-Host "Gespeichert. Prüfe Ergebnis..." -ForegroundColor Cyan
  $after = Invoke-ClipApi -Path "/api/clip/admin/texts"
  $summary = $after.texts.categories | Select-Object id,label,keyCount,variantCount
  $summary | Format-Table -AutoSize
  Write-Host "Fertig." -ForegroundColor Green
}
