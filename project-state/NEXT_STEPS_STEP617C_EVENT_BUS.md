# NEXT STEPS – Event-Bus nach STEP617C

Stand: 2026-05-30

## Aktueller Abschluss

STEP617C ist gueltig abgeschlossen:

```text
Event-Bus Settings sind in backend/modules/communication_bus.js integriert.
Dashboard Config-Tab funktioniert.
DB-Speicherung laeuft ueber backend/core/database.js.
```

## Nicht weiterverwenden

```text
STEP617B_event_bus_config_tab_hotfix_v0.1.1.zip
backend/modules/communication_bus_settings.js
```

## Sofort offen

Keine zwingende Code-Arbeit offen.

## Spaeter moeglich

```text
STEP618 – Runtime-Anbindung der gespeicherten Bus-Config
```

Nur mit Plan:

```text
1. echte communication_bus.js und helper_communication.js pruefen
2. validieren, welche DB-Settings beim Bus-Start uebernommen werden duerfen
3. restart-required vs runtime-hot-apply trennen
4. Audit-/Log-Eintrag fuer Aenderungen vorsehen
5. Rollback/Default-Reset planen
```

## Tests fuer spaeter

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,dialect,table,runtimeAppliedImmediately
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$s | Select-Object ok,module,moduleVersion
```

Dashboard:

```text
Admin -> Bus-Diagnose -> Config
```
