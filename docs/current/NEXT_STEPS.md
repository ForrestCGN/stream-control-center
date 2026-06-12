# NEXT_STEPS – stream-control-center

Stand: 2026-06-12

## Nach CAN44.31

Der AutoShoutout-Buspfad ist live bestätigt. Die sichtbare AutoShoutout-Aktivitätsanzeige im ShoutoutV2-Dashboard wurde als Bridge/Patch über `auto_shoutout.js` vorbereitet.

## Direkt sinnvoll

### 1. CAN44.31 live einspielen und prüfen

```powershell
Copy-Item -Force `
  "D:\Git\stream-control-center\htdocs\dashboard\modules\auto_shoutout.js" `
  "D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.js"

Copy-Item -Force `
  "D:\Git\stream-control-center\htdocs\dashboard\modules\auto_shoutout.css" `
  "D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.css"

node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.js"
```

Browser prüfen:

```javascript
window.AutoShoutoutV2ActivityPatch?.build
// Erwartung: CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

### 2. ShoutoutV2-AutoShoutout-Karte prüfen

```text
Dashboard öffnen
Community → Shoutout → AutoShoutout
Karte „Letzte AutoShoutout-Aktivität“ prüfen
Erwartung: kompakte Tabelle Zeit / Streamer / Status / Info
Info-Button öffnet Detailfenster
ESC oder Schließen schließt Detailfenster
```

### 3. AutoShoutout erneut mit echtem Auto-Streamer testen

```text
Eingetragener Auto-Streamer schreibt !lurk
Danach prüfen:
- AutoShoutout wird eingereiht
- autoBusReceived steigt
- autoBusDelivered steigt
- autoBusErrors bleibt 0
- Activity-Liste zeigt sinnvollen Kurzstatus
```

PowerShell-Prüfung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.autoShoutout.state.busSubscriber
$s.state.stats | Select-Object autoBusReceived,autoBusDelivered,autoBusErrors,autoTriggered,autoSkipped
$s.autoShoutout.recentEvents | Select-Object -First 5 target_login,trigger_login,status,reason,display_queue_id,created_at
```

### 4. Testdaten aufräumen

Falls ForrestCGN nur testweise als Auto-Streamer eingetragen war:

```text
forrestcgn aus AutoShoutout-Streamern entfernen/deaktivieren
Test-Events für forrestcgn bei Bedarf per clear-target entfernen
```

Clear-Target:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","mode":"today","reason":"test_cleanup_after_can44_31"}' |
  ConvertTo-Json -Depth 8
```

## Danach sinnvoll

### 5. CAN44.31 in GitHub/dev übernehmen

```text
Änderungen aus Live/Repo vergleichen
auto_shoutout.js und auto_shoutout.css committen
Doku-Dateien aus diesem Paket einspielen
StepDone ausführen
```

### 6. ShoutoutV2 langfristig sauber integrieren

Die Bridge ist pragmatisch und vermeidet Eingriffe in `shoutout_v2.js`. Später kann die kompakte Activity-Logik direkt in `shoutout_v2.js` integriert werden.

Vorher prüfen:

```text
Welche Module laden ShoutoutV2?
Welche Tabs werden von shoutout_v2.js gerendert?
Gibt es noch alte auto_shoutout.js-Reste, die nicht sichtbar genutzt werden?
```

## Später

```text
AutoShoutout-Textvarianten im zentralen Texteditor weiter glätten
ShoutoutV2-Diagnose um Bus-Subscriber-Status ergänzen
Activity-Modal optional mit Copy-JSON-Button erweitern
AutoShoutout-Streamer-Verwaltung optisch weiter vereinheitlichen
Bridge später durch direkte ShoutoutV2-Implementierung ersetzen
```

## Nicht sofort nötig

```text
Neue DB-Migrationen
Umbau des Communication Bus
Umbau von twitch_events.js
Entfernung des Direct-Wrapper-Fallbacks in clip_shoutout.js
Großer ShoutoutV2-Refactor
```

## Prüfroutine bei weiteren Shoutout-Änderungen

```powershell
node -c .\backend\modules\clip_shoutout.js
node -c .\backend\modules\twitch_events.js
node -c .\htdocs\dashboard\modules\shoutout_v2.js
node -c .\htdocs\dashboard\modules\auto_shoutout.js
```

Browser:

```text
/dashboard
Community → Shoutout → AutoShoutout
Console ohne Fehler?
window.AutoShoutoutV2ActivityPatch?.build korrekt?
Activity-Liste kompakt?
Info-Modal öffnet?
```
