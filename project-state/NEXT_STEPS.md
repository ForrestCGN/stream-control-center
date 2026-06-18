# NEXT_STEPS – Shot-Alarm

Stand: 2026-06-18

## Direkt nach Einspielen

1. Backend neu starten.
2. Syntax prüfen:

```powershell
node -c .\backend\modules\shot_alarm.js
node -c .\htdocs\dashboard\modules\shot_alarm.js
```

3. Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,enabled,busAvailable,registeredOnBus,routeCount,lastError
```

4. Overlay testen:

```text
http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1
```

5. Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard → Control → Shot-Alarm
```

## Danach entscheiden

- Soll eine 100er Bombe als eine Karte mit „10 Shots“ angezeigt werden oder als 10 einzelne Overlay-/Sound-Auslösungen?
- Welche echten Shot-Sounds sollen in den Soundpool?
- Soll die History dauerhaft in SQLite gespeichert werden?
- Ko-fi/Tipeee: neutrale Payment-Bus-Events ergänzen oder direkte Hook-Anbindung planen?
