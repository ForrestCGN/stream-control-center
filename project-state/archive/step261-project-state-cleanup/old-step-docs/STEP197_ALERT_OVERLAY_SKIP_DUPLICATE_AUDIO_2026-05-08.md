# STEP197 – Alert Overlay: doppelte Audio-Ausgabe verhindern

Datum: 2026-05-08  
Projekt: stream-control-center

## Ausgangslage

Nach STEP196 wird `liveAlert.soundSystemEnabled` korrekt aus den DB-Settings in die aktive Alert-Konfiguration übernommen. Dadurch gibt das Alert-System den Alert-Sound an das zentrale Sound-System weiter.

Beim Live-Test wurde der Follow-Sound doppelt abgespielt:

1. über das neue Sound-System / AudioDeviceHelper / Device
2. zusätzlich direkt im Alert-Overlay `_overlay-alerts-v2.html`

## Ziel

Das Alert-Overlay soll weiterhin Bild, Text, Animation und Celebration anzeigen, aber den lokalen Browser-Audio-Player nicht starten, wenn der Alert-Sound bereits erfolgreich vom Sound-System übernommen wurde.

## Geänderte Datei

- `htdocs/overlay/_overlay-alerts-v2.html`

## Änderung

Neu ergänzt:

- `soundSystemPlaybackStarted(soundSystem)`
- `shouldUseLocalAlertAudio(alert)`
- `stopLocalAlertAudio()`

Der lokale `<audio id="sound">` wird nur noch gestartet, wenn `shouldUseLocalAlertAudio(alert)` true zurückgibt.

Bei Sound-System-Alerts wird der lokale Audio-Player gestoppt/geleert, damit keine doppelte Ausgabe entsteht.

## Bewusst nicht geändert

- Kein Backend geändert
- Keine Alert-Regeln geändert
- Keine Assets geändert
- Keine Datenbank geändert
- Keine Sound-System-Overlay-Datei geändert
- Keine OBS-Einstellungen geändert

## Erwartetes Verhalten

Bei normalen Live-Alerts nach STEP196:

- `_overlay-alerts-v2.html` zeigt Bild/Text/Animation
- Sound-System spielt den Sound einmal über das konfigurierte Device
- kein doppelter Ton über OBS-Browserquelle

Im Preview-Modus bleibt lokale Browser-Audio-Ausgabe erlaubt, damit Dashboard-Vorschauen weiterhin funktionieren.

## Test nach Deploy

```powershell
cd D:\Streaming\stramAssets
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Result = [ordered]@{}
$Result.reload = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/reload" -Method POST
$Result.test = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/follow?user=ForrestCGN&userLogin=forrestcgn"

Start-Sleep -Seconds 4

$Result.alertStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$Result.soundStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"

$Result | ConvertTo-Json -Depth 80 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
```

## Erwartung

- Alert sichtbar
- Sound einmal hörbar
- Sound-System `deviceStarted` steigt
- kein zusätzlicher Ton aus `_AlertsV2`
- keine `failed` / `deviceFailed`
