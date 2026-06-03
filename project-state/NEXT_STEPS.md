# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.18b entpacken und testen:

```powershell
.\stepdone.cmd "CAN-42.18b Birthday schemaReady diagnostics fix"
node -c backend\modules\birthday.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$b.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
```

Erwartung:

```text
health      : ok
schemaReady : True
lastError   : leer
```

## Danach

Dashboard hart neu laden und `Admin > Diagnose > Birthday` prüfen.

Nächster Kandidat danach: weiteres Modul aus der zentralen Diagnose-Liste auf Diagnostics-Standard prüfen.
