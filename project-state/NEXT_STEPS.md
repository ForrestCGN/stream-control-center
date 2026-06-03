# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.14 anwenden:

```powershell
# ZIP nach D:\Git\stream-control-center entpacken

# Wichtig: alte Moduldatei entfernen, damit der Server nicht beide Dateien lädt
Remove-Item backend\modules\vip_sound_overlay.js

.\stepdone.cmd "CAN-42.14 VIP-Sound status diagnostics-standard"

node -c backend\modules\vip-sound.js
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js

$v = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
$v | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,routeCount
$v.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$v.diagnostics.counts
```

Danach Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > VIP-System
```

Erwartung:

```text
VIP-System zeigt OK
Version/Diagnostic-Version sichtbar
Standard-Diagnostics mit Counts/State/Datenbank sichtbar
```

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen, z. B. Alerts, Sound-System, Media oder Overlay-Monitor.

## Nicht ohne separaten Go-Schritt

```text
Keine produktiven Routen ändern
Keine VIP-/Mod-Sound-Ausführung ändern
Keine Queue-/Overlay-/Daily-Usage-Logik ändern
Keine DB-Migration
Keine Funktionalität entfernen
```
