# CURRENT CHAT HANDOFF – VIP30 STEP8.18 Alert-Test

Stand: 2026-06-06

## Ergebnis

VIP30 hat jetzt einen manuellen Alert-Test, der den echten VIP30-Alertpfad nutzt.

## Geändert

```txt
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Neue Version

```txt
moduleVersion: 0.8.12
moduleBuild: step8.18-alert-test-route
```

## Neuer Endpunkt

```txt
POST /api/vip30/alert/test
```

## Sicherheit

Der Test macht ausdrücklich:

```txt
kein Twitch-Schreibzugriff
kein VIP Grant
kein Slot Write
kein Redemption Fulfill/Cancel
nur Alert/Sound-Bundle
```

## Was getestet wird

```txt
zufälliger aktiver Sound aus alerts.soundPool
zufälliges aktives Textset aus alerts.overlaySets
echtes /api/sound/bundle
echtes sound_system_overlay.html VIP30 Overlay
```

## Dashboard

Im Tab `Aktionen` gibt es jetzt:

```txt
VIP30 Alert testen
```

Nach Klick zeigt das Dashboard die gewählte Auswahl:

```txt
Sound: ...
Textset: ...
```

## PowerShell-Test

```powershell
$body = @{
  userLogin = "testrentner"
  userDisplayName = "TestRentner"
  userId = "vip30-test"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/test" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```
