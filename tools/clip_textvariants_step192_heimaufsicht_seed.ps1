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
      "/me 🎬 Die Heimaufsicht hat den Moment markiert. Clip wird gesichert.",
      "/me 🎥 Beweismaterial wird gesichert. Twitch-Clip und Replay laufen im Hintergrund.",
      "/me 📋 Vorgang aufgenommen. Die Heimaufsicht kümmert sich um den Clip."
    )
  },
  @{
    key="chatClipCreated"; category="chat"; variants=@(
      "/me 🎬 Clip gesichert: {clipUrl}",
      "/me 📺 Die Heimaufsicht meldet: Clip ist da! {clipUrl}",
      "/me ✅ Beweismaterial liegt vor: {clipUrl}"
    )
  },
  @{
    key="chatClipCreatedWithoutUrl"; category="errors"; variants=@(
      "/me ⚠️ Twitch hat den Clip angenommen, aber der Link ist noch nicht bereit.",
      "/me 📋 Clip-Vorgang läuft, aber die URL fehlt noch. Die Heimaufsicht prüft weiter."
    )
  },
  @{
    key="chatClipFailed"; category="errors"; variants=@(
      "/me ❌ Die Heimaufsicht konnte den Clip gerade nicht sichern.",
      "/me ⚠️ Clip-Erstellung fehlgeschlagen. Das wird im Protokoll vermerkt.",
      "/me 🚨 Clip konnte nicht erstellt werden. Twitch oder Backend stellt sich quer."
    )
  },
  @{
    key="chatLocalReplayMissing"; category="errors"; variants=@(
      "/me ⚠️ Twitch-Clip verarbeitet, aber kein frischer lokaler Replay-Clip gefunden.",
      "/me 📼 Lokale Aufnahme fehlt. Die Heimaufsicht hat nur den Twitch-Vorgang."
    )
  },
  @{
    key="chatLocalReplayInvalidDir"; category="errors"; variants=@(
      "/me ⚠️ Replay-Ordner ungültig: {clipsDir}",
      "/me 🚧 Die Heimaufsicht findet den Clip-Ordner nicht: {clipsDir}"
    )
  },
  @{
    key="chatReplaySaved"; category="chat"; variants=@(
      "/me ✅ Lokaler Replay-Clip wurde gespeichert.",
      "/me 📼 Lokales Beweismaterial wurde gesichert.",
      "/me ✅ Replay liegt im Archiv. Die Heimaufsicht ist zufrieden."
    )
  },
  @{
    key="chatClipDuplicate"; category="chat"; variants=@(
      "/me ℹ️ Dieser Clip wurde bereits verarbeitet.",
      "/me 📋 Vorgang existiert schon. Die Heimaufsicht macht nichts doppelt."
    )
  },
  @{
    key="discordClipPost"; category="discord"; variants=@(
      "🎬 **Neuer Clip aus der Heimaufsicht**`n`n**Titel:** {clipTitle}`n**Spiel:** {gameName}`n**Ausgelöst von:** {triggerUser}`n`n{clipUrl}",
      "📺 **Clip im CGN-Archiv**`n`n**{clipTitle}**`nSpiel: {gameName}`nGemeldet von: {triggerUser}`n`n{clipUrl}",
      "📋 **Heimaufsicht-Protokoll: Clip gesichert**`n`n**Titel:** {clipTitle}`n**Game:** {gameName}`n**Auslöser:** {triggerUser}`n`n{clipUrl}"
    )
  },
  @{
    key="discordClipPartial"; category="discord"; variants=@(
      "⚠️ **Clip teilweise verarbeitet**`n`n**Titel:** {clipTitle}`n**Status:** {status}`n**Grund:** {reason}`n`n{clipUrl}",
      "📋 **Heimaufsicht-Hinweis**`n`nDer Clip wurde nicht vollständig verarbeitet.`n`n**Titel:** {clipTitle}`n**Grund:** {reason}`n`n{clipUrl}"
    )
  },
  @{
    key="discordClipFailed"; category="discord"; variants=@(
      "❌ **Clip-Verarbeitung fehlgeschlagen**`n`n**Titel:** {clipTitle}`n**Grund:** {reason}",
      "🚨 **Heimaufsicht konnte den Clip nicht sichern**`n`n**Titel:** {clipTitle}`n**Fehler:** {reason}"
    )
  },
  @{
    key="systemDisabled"; category="system"; variants=@(
      "Clip-System ist deaktiviert.",
      "Die Heimaufsicht ist für Clips aktuell deaktiviert."
    )
  },
  @{
    key="systemBackendNotReady"; category="system"; variants=@(
      "Clip-Backend ist nicht bereit.",
      "Die Heimaufsicht kann nicht arbeiten: Clip-Backend ist nicht bereit."
    )
  },
  @{
    key="systemTwitchScopeMissing"; category="system"; variants=@(
      "Twitch-OAuth-Scope clips:edit fehlt.",
      "Der Heimaufsicht fehlt die Twitch-Berechtigung clips:edit."
    )
  },
  @{
    key="systemObsReplayNotReady"; category="system"; variants=@(
      "OBS Replay Buffer ist nicht bereit.",
      "OBS Replay Buffer ist nicht aktiv. Lokales Beweismaterial kann nicht gesichert werden."
    )
  },
  @{
    key="systemStreamNotLive"; category="system"; variants=@(
      "Der Stream ist nicht live. Clip-Erstellung wurde übersprungen.",
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
Write-Host "STEP192 Clip Textvarianten Heimaufsicht Cleanup/Seed" -ForegroundColor Cyan
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
  Write-Host ".\tools\clip_textvariants_step192_heimaufsicht_seed.ps1 -Apply" -ForegroundColor Magenta
} else {
  Write-Host "Gespeichert. Prüfe Ergebnis..." -ForegroundColor Cyan
  $after = Invoke-ClipApi -Path "/api/clip/admin/texts"
  $summary = $after.texts.categories | Select-Object id,label,keyCount,variantCount
  $summary | Format-Table -AutoSize
  Write-Host "Fertig." -ForegroundColor Green
}
