# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.11 anwenden und Commands-Status prüfen.
```

## Prüfung

```powershell
node -c backend\modules\commands.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,enabled,schemaOk,schemaError
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
```

## Erwartung

```text
moduleVersion = 0.1.7
moduleBuild = channel-guard-diagnostics
$s.diagnostics ist vorhanden.
$s.diagnostics.module = commands
$s.diagnostics.health = ok oder warn, abhängig vom letzten Runtime-Zustand.
```

## Danach

```text
.\stepdone.cmd "CAN-42.11 Commands status diagnostics-standard"
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Command-Testausführung ohne Absprache.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
