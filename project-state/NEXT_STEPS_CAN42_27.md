# NEXT STEPS CAN-42.27

1. ZIP entpacken.
2. `stepdone.cmd` ausführen.
3. Syntax prüfen.
4. Node/Backend neu starten, weil ein neuer Backend-Endpunkt registriert wird.
5. `/api/diagnostics/registry` testen.
6. Dashboard hart neu laden und prüfen, ob die Diagnose-Liste weiter vollständig ist.

Empfohlene Tests:
```powershell
.\stepdone.cmd "CAN-42.27 Diagnostics registry endpoint"

node -c backend\modules\diagnostics.js
node -c htdocs\dashboard\modules\diagnostics.js

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r | Select-Object ok,module,moduleVersion,registryVersion,source
$r.entries | Select-Object key,label,group,status
```

Danach Dashboard: `STRG + F5`, Admin > Diagnose prüfen.
