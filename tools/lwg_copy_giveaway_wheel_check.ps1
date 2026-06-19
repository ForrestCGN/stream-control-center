<#
LWG Copy Giveaway/Wheel Check
- Testet vorhandene Copy-Route
- Validiert, ob bei Wheel-Giveaways ein eigenes gebundenes Wheel + Felder in der Kopie vorhanden sind
- Loescht die Test-Kopie optional per hard-delete nach Rueckfrage

Ausfuehren:
  powershell -ExecutionPolicy Bypass -File .\tools\lwg_copy_giveaway_wheel_check.ps1
#>
param(
  [string]$ApiBase = "http://127.0.0.1:8080",
  [switch]$NoBrowser
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path (Get-Location) "LWG_COPY_GIVEAWAY_CHECK_$timestamp.log"

function Write-Log { param([object]$Text = "") Add-Content -Path $logFile -Value (if ($null -eq $Text) { "" } else { $Text | Out-String }) -Encoding UTF8 }
function Section { param([string]$Title) $line="============================================================"; Write-Host "`n$line`n$Title`n$line" -ForegroundColor Cyan; Write-Log ""; Write-Log $line; Write-Log $Title; Write-Log $line }
function Ask-YesNo { param([string]$Question,[bool]$Default=$true) $s=if($Default){"J/n"}else{"j/N"}; $a=Read-Host "$Question [$s]"; if([string]::IsNullOrWhiteSpace($a)){return $Default}; return @("j","ja","y","yes") -contains $a.Trim().ToLower() }
function J { param($x,$d=14) try{$x|ConvertTo-Json -Depth $d}catch{$x|Out-String} }
function Api { param([string]$Title,[string]$Method="GET",[string]$Path,[object]$Body=$null,[int]$Depth=14)
  Section $Title
  $uri="$ApiBase$Path"; Write-Host "$Method $uri"; Write-Log "$Method $uri"
  try{
    if($null -ne $Body){$b=$Body|ConvertTo-Json -Depth 10; Write-Log "--- REQUEST BODY ---"; Write-Log $b; $r=Invoke-RestMethod -Method $Method -Uri $uri -ContentType "application/json" -Body $b}
    else{$r=Invoke-RestMethod -Method $Method -Uri $uri}
    Write-Log "--- RESPONSE JSON ---"; Write-Log (J $r $Depth); return @{ok=$true;result=$r}
  }catch{Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red; Write-Log "FEHLER:"; Write-Log $_.Exception.Message; if($_.ErrorDetails.Message){Write-Log $_.ErrorDetails.Message}; return @{ok=$false;error=$_}}
}

Section "LWG Copy Giveaway/Wheel Check gestartet"
Write-Host "Log-Datei: $logFile"
Write-Log "Gestartet: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Log "Arbeitsordner: $(Get-Location)"

$list = Api -Title "Giveaways laden" -Path "/api/loyalty/giveaways?limit=50" -Depth 10
if(-not $list.ok){exit 1}
$rows=@($list.result.rows)
for($i=0;$i -lt $rows.Count;$i++){
  $g=$rows[$i]
  Write-Host ("[{0}] {1} | {2} | wheel={3} | setup={4} | {5}" -f ($i+1),$g.title,$g.status,$g.wheelEnabled,$g.setupComplete,$g.giveawayUid)
}
$choice=Read-Host "Quelle waehlen: Nummer oder Giveaway-UID"
$sourceUid=$choice.Trim()
if($choice -match '^\d+$'){
  $idx=[int]$choice-1
  if($idx -ge 0 -and $idx -lt $rows.Count){$sourceUid=[string]$rows[$idx].giveawayUid}
}
if([string]::IsNullOrWhiteSpace($sourceUid)){Write-Host "Keine Quelle." -ForegroundColor Red; exit 1}

$source = Api -Title "Quelle Details" -Path "/api/loyalty/giveaways/$sourceUid" -Depth 16
if(-not $source.ok){exit 1}
$sourceGiveaway=$source.result.giveaway
$sourceBound = Api -Title "Quelle Bound Wheel" -Path "/api/loyalty/giveaways/$sourceUid/wheel/bound" -Depth 12
$sourceFields = Api -Title "Quelle Bound Wheel Fields" -Path "/api/loyalty/giveaways/$sourceUid/wheel/bound/fields" -Depth 12

$titleDefault = "Kopie Test von $($sourceGiveaway.title) $timestamp"
$title = Read-Host "Titel fuer Kopie [$titleDefault]"
if([string]::IsNullOrWhiteSpace($title)){$title=$titleDefault}

if(-not (Ask-YesNo "Kopie jetzt erstellen?" $true)){exit 0}
$copy = Api -Title "Giveaway kopieren" -Method "POST" -Path "/api/loyalty/giveaways/$sourceUid/copy" -Body @{ title=$title; actor="copy_check"; reason="copy_wheel_check" } -Depth 16
if(-not $copy.ok){exit 1}

$copyUid = ""
if($copy.result.giveaway -and $copy.result.giveaway.giveawayUid){$copyUid=[string]$copy.result.giveaway.giveawayUid}
elseif($copy.result.copy -and $copy.result.copy.giveawayUid){$copyUid=[string]$copy.result.copy.giveawayUid}
elseif($copy.result.giveawayUid){$copyUid=[string]$copy.result.giveawayUid}

if([string]::IsNullOrWhiteSpace($copyUid)){
  Write-Host "Kopie-UID konnte nicht automatisch erkannt werden. Details stehen im Log." -ForegroundColor Red
  exit 1
}
Write-Host "Kopie erstellt: $copyUid" -ForegroundColor Green
Write-Log "Kopie erstellt: $copyUid"

$copyDetail = Api -Title "Kopie Details" -Path "/api/loyalty/giveaways/$copyUid" -Depth 16
$copyBound = Api -Title "Kopie Bound Wheel" -Path "/api/loyalty/giveaways/$copyUid/wheel/bound" -Depth 12
$copyFields = Api -Title "Kopie Bound Wheel Fields" -Path "/api/loyalty/giveaways/$copyUid/wheel/bound/fields" -Depth 12

Section "Auswertung"
$sourceFieldCount = if($sourceFields.ok){ [int]($sourceFields.result.fieldCount ?? $sourceFields.result.count ?? @($sourceFields.result.rows).Count) } else { 0 }
$copyFieldCount = if($copyFields.ok){ [int]($copyFields.result.fieldCount ?? $copyFields.result.count ?? @($copyFields.result.rows).Count) } else { 0 }
$sourceBoundUid = if($sourceBound.ok -and $sourceBound.result.boundWheel){ [string]$sourceBound.result.boundWheel.boundWheelUid } else { "" }
$copyBoundUid = if($copyBound.ok -and $copyBound.result.boundWheel){ [string]$copyBound.result.boundWheel.boundWheelUid } else { "" }

$result = [PSCustomObject]@{
  sourceUid = $sourceUid
  copyUid = $copyUid
  sourceWheelEnabled = $sourceGiveaway.wheelEnabled
  sourceBoundWheelUid = $sourceBoundUid
  copyBoundWheelUid = $copyBoundUid
  sourceFieldCount = $sourceFieldCount
  copyFieldCount = $copyFieldCount
  boundWheelCopied = (-not [string]::IsNullOrWhiteSpace($copyBoundUid))
  hasOwnBoundWheel = ($copyBoundUid -ne "" -and $copyBoundUid -ne $sourceBoundUid)
  fieldsCopied = ($copyFieldCount -gt 0 -and $copyFieldCount -eq $sourceFieldCount)
}
$result | Format-List | Tee-Object -FilePath $logFile -Append

if($sourceGiveaway.wheelEnabled -and (-not $result.boundWheelCopied -or -not $result.hasOwnBoundWheel -or -not $result.fieldsCopied)){
  Write-Host "ACHTUNG: Gluecksrad-Kopie ist nicht sauber bestaetigt. Nicht produktiv blind verwenden." -ForegroundColor Yellow
}else{
  Write-Host "Kopie-Check sieht gut aus." -ForegroundColor Green
}

if(-not $NoBrowser -and (Ask-YesNo "Dashboard oeffnen?" $false)){Start-Process "$ApiBase/dashboard" | Out-Null}

if(Ask-YesNo "Test-Kopie per hard-delete wieder loeschen?" $true){
  Api -Title "Test-Kopie hard-delete" -Method "POST" -Path "/api/loyalty/giveaways/$copyUid/hard-delete" -Body @{ confirmHardDelete=$true; actor="copy_check"; reason="copy_wheel_check_cleanup" } -Depth 12 | Out-Null
}else{
  Write-Host "Kopie bleibt bestehen: $copyUid" -ForegroundColor Yellow
}

Section "Fertig"
Write-Host "Fertig. Log-Datei:" -ForegroundColor Green
Write-Host $logFile -ForegroundColor Green
Write-Log "Beendet: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
