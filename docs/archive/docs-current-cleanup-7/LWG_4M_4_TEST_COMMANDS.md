# LWG-4M.4 – Testbefehle

## 0) StepDone vor dem Test

```powershell
.\stepdone.cmd "LWG-4M.4 Loyalty Giveaway-bound Wheel Foundation eingespielt. moduleBuild STEP_LWG_4M_4. Wheel-Giveaways erzeugen jetzt eine giveaway-gebundene Wheel-Konfiguration mit Name aus Giveaway-Titel. Neue Routen /wheel/bound. Keine Punktebuchung, keine Command-Aktivierung."
```

## 1) Status prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:
- `moduleBuild = STEP_LWG_4M_4`
- `health = ok`

## 2) Aktives/globales Preset holen

```powershell
$presetList = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/presets?limit=50"
$presetRows = $presetList.rows
if (-not $presetRows -and $presetList.data) { $presetRows = $presetList.data.rows }
$activePreset = $presetRows | Where-Object { $_.status -eq "active" -and ($_.presetType -eq "standalone" -or -not $_.presetType) } | Select-Object -First 1
$wheelPresetUid = $activePreset.presetUid
if (-not $wheelPresetUid) { $wheelPresetUid = $activePreset.preset_uid }
$wheelPresetUid
```

## 3) Wheel-Giveaway erstellen

```powershell
$createBody = @{
  title = "LWG-4M.4 Bound Wheel Test"
  description = "Temporärer Test: Bound Wheel Foundation"
  mode = "wheel_single"
  wheelEnabled = $true
  wheelPresetUid = $wheelPresetUid
  costAmount = 0
  maxTicketsPerUser = 1
  winnerCount = 1
  createdBy = "LWG-4M.4"
  metadata = @{ testStep = "LWG-4M.4"; temporary = $true }
} | ConvertTo-Json -Depth 10

$created = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways" `
  -ContentType "application/json" `
  -Body $createBody

$giveawayUid = $created.giveaway.giveawayUid
if (-not $giveawayUid -and $created.data) { $giveawayUid = $created.data.giveaway.giveawayUid }
$giveawayUid
$created.boundWheel | Select-Object boundWheelUid,giveawayUid,name,sourcePresetUid,scope,status
```

Erwartung:
- `boundWheelUid` ist gesetzt
- `name = LWG-4M.4 Bound Wheel Test – Glücksrad`
- `sourcePresetUid = $wheelPresetUid`
- `scope = giveaway`

## 4) Giveaway Details prüfen

```powershell
$details = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid"
$g = $details.giveaway
if (-not $g -and $details.data) { $g = $details.data.giveaway }
$g | Select-Object giveawayUid,title,mode,wheelEnabled,wheelPresetUid,wheelSnapshotUid,status
$g.boundWheel | Select-Object boundWheelUid,giveawayUid,name,sourcePresetUid,scope,status
```

## 5) Bound Wheel Route prüfen

```powershell
$bound = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/wheel/bound"
$bound.boundWheel | Select-Object boundWheelUid,giveawayUid,name,sourcePresetUid,scope,status
```

## 6) Cleanup

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/cancel" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.4","reason":"bound wheel foundation cleanup"}' |
  Select-Object ok,message
```

## StepDone nach erfolgreichem Test

```powershell
.\stepdone.cmd "LWG-4M.4 Loyalty Giveaway-bound Wheel Foundation erfolgreich bestaetigt. Wheel-Giveaway erstellt automatisch boundWheel mit Name aus Giveaway-Titel, wheelSnapshotUid gesetzt, sourcePresetUid verweist auf globale Vorlage, /wheel/bound liefert die gebundene Konfiguration. Cleanup per cancel erfolgreich. Keine Punktebuchung, keine Command-Aktivierung."
```
