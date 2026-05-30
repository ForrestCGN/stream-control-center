# Event-Bus Dashboard und DB-basierte Config

Stand: 2026-05-30
Gueltiger Stand: STEP617C

## Zweck

Der bestehende Admin-Bereich `Bus-Diagnose` ist der zentrale Event-Bus-/Communication-Bus-Bereich im Dashboard.

Er dient fuer:

```text
- Bus-Uebersicht
- Clients
- Events und ACKs
- Integrationen
- Issues
- DB-basierte Bus-Config
- Rohdaten fuer Diagnose
```

## Dashboard-Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Backend-Datei

Die Settings-API gehoert zum bestehenden Communication-Bus-Modul:

```text
backend/modules/communication_bus.js
```

Keine separate Settings-Moduldatei verwenden.

## API

```text
GET  /api/communication/settings
POST /api/communication/settings
```

GET liefert u. a.:

```text
ok
module
moduleVersion
storage
adapter
dialect
table
runtimeAppliedImmediately
categories
config
```

POST speichert Dashboard-Settings in der DB. Die produktive Runtime wird dabei bewusst noch nicht sofort umgeschaltet.

## Datenbank

Tabelle:

```text
communication_bus_settings
```

Speicherregel:

```text
- DB ist fuehrend fuer editierbare Bus-Settings.
- JSON darf Seed/Fallback bleiben, aber nicht Dashboard-Hauptspeicher sein.
- Dashboard spricht nur Backend-API.
- DB-Zugriff laeuft ueber backend/core/database.js.
```

## DB-Portabilitaet

Aktuell aktiv:

```text
SQLite
```

Vorbereitet:

```text
MySQL
MariaDB
```

Umsetzung muss DB-Helper nutzen, z. B.:

```text
quoteIdentifier()
textTypeSql()
boolTypeSql()
dateTimeTypeSql()
jsonTypeSql()
upsert()
ensureSchema()
```

Keine hart verdrahtete SQLite-Sonderwelt einbauen, wenn vorhandene Helper genutzt werden koennen.

## Gueltige Modulzuordnung

```text
communication_bus.js
= Runtime, Status, Diagnose, Test, Replay, Watchdog, Settings-API

helper_communication.js
= Core/Helper: Registry, Heartbeat, Events, ACKs, Replay, Issues, Subscriptions

bus_diagnostics.js
= Dashboard-Frontend fuer Anzeige und Bedienung
```

## Verworfen

```text
backend/modules/communication_bus_settings.js
STEP617B_event_bus_config_tab_hotfix_v0.1.1.zip
```

Grund:

```text
Keine neuen Parallelmodule fuer klare bestehende Zustaendigkeiten.
Settings gehoeren direkt in communication_bus.js.
```

## Verifizierter Stand

PowerShell:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,dialect,table,runtimeAppliedImmediately
```

Erwartung:

```text
ok                        : True
module                    : communication_bus
moduleVersion             : 0.8.2
storage                   : database
adapter                   : sqlite
dialect                   : sqlite
table                     : communication_bus_settings
runtimeAppliedImmediately : False
```

Dashboard:

```text
Admin -> Bus-Diagnose -> Config
```

Erwartung:

```text
Bus-Config Speicher ok
Speicher database
Adapter sqlite
Tabelle communication_bus_settings
Runtime sofort nein
```

## Naechster moeglicher Schritt

Nur nach neuer Planung:

```text
STEP618 – gespeicherte Bus-Settings beim Bus-Start kontrolliert in die Runtime laden
```

Dafuer vorher klaeren:

```text
- welche Settings wirklich runtimewirksam sein duerfen
- welche Settings Backend-Neustart brauchen
- Validierung/Rollback
- Audit-Logging
- Dashboard-Hinweis bei restart-required
```
