# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.12 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.12 Hug status diagnostics-standard"
node -c backend\modules\hug.js

$h = Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status"
$h | Select-Object ok,module,moduleVersion,moduleBuild,version,enabled,schemaVersion,lastError
$h.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$h.diagnostics.counts
```

Erwartung:

```text
moduleVersion = 0.1.1
moduleBuild = diagnostics-standard
diagnostics.ok = True
diagnostics.health = ok oder warn
diagnostics.schemaReady = True
```

Hinweis: `health = warn` ist nur dann kritisch zu bewerten, wenn `warnings` einen echten Fehlerhinweis enthält. Ein deaktiviertes Hug-System würde z. B. bewusst als Warnung sichtbar sein.

## Danach

Nächstes Modul auf diagnostics-Standard prüfen/angleichen. Sinnvolle Kandidaten:

```text
Message-Rotator
VIP-System / VIP-Sound
Media / Sound-System Detailstatus
```

## Weiterhin nicht ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen
Keine Backend-Routen entfernen
Keine DB-Migration erzwingen
Keine Dashboard-Testbuttons für produktive Aktionen ergänzen
Keine Funktionalität entfernen
```
