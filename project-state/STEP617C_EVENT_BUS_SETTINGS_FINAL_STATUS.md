# STEP617C – Event-Bus Settings in communication_bus integriert

Stand: 2026-05-30
Status: gueltig / getestet

## Ergebnis

Der Event-Bus-/Communication-Bus-Bereich ist im Dashboard strukturiert und besitzt eine DB-basierte Config-Ansicht.

Die Settings-API ist korrekt im bestehenden Modul integriert:

```text
backend/modules/communication_bus.js
GET  /api/communication/settings
POST /api/communication/settings
```

Die vorherige Parallel-Modul-Datei wurde verworfen und darf nicht weiter genutzt werden:

```text
backend/modules/communication_bus_settings.js
```

## Verifizierter API-Status

Geprueft per:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,dialect,table,runtimeAppliedImmediately
```

Ergebnis:

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

## Dashboard-Status

Geprueft im Dashboard:

```text
Admin -> Bus-Diagnose -> Config
```

Sichtbar und korrekt:

```text
Bus-Config Speicher: ok
Modul: communication_bus 0.8.2
Speicher: database
Adapter: sqlite
Tabelle: communication_bus_settings
Runtime sofort: nein
```

## Technische Einordnung

```text
communication_bus.js
= aktiver Communication-/Event-Bus, Status-, Diagnose-, Test-, Replay-, Watchdog- und Settings-API

helper_communication.js
= Bus-Core, Client-Registry, Events, ACKs, Replay, Issues, Subscriptions

htdocs/dashboard/modules/bus_diagnostics.js
= Dashboard-Ansicht fuer Event-Bus, Clients, Events, Integrationen, Issues und Config
```

## DB-Regel

Die Settings werden DB-basiert gespeichert. Die Umsetzung nutzt die zentrale DB-Schicht:

```text
backend/core/database.js
```

Wichtig:

```text
- SQLite ist aktuell aktiv.
- MySQL/MariaDB bleiben ueber DB-Helper vorbereitet.
- Keine direkte Dashboard-DB-Nutzung.
- Keine SQLite-only Sonderlogik im Dashboard.
- Keine produktive Runtime-Uebernahme beim Speichern.
```

## Bewusst nicht umgesetzt

```text
- keine sofortige Runtime-Umschaltung des laufenden Bus
- keine Veraenderung produktiver Sound-/Alert-/VIP-Flows
- keine OBS-Refresh-Logik
- keine echten Overlays geaendert
- keine neue Parallelstruktur
```

## Gueltige Dateien aus STEP617C

```text
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md
project-state/STEP617C_EVENT_BUS_SETTINGS_IN_COMMUNICATION_BUS.md
project-state/STEP617C_EVENT_BUS_SETTINGS_FINAL_STATUS.md
```

## Verworfen / nicht verwenden

```text
STEP617B_event_bus_config_tab_hotfix_v0.1.1.zip
backend/modules/communication_bus_settings.js
```

Falls die Datei lokal noch existiert:

```powershell
Remove-Item "backend\modules\communication_bus_settings.js" -ErrorAction SilentlyContinue
```
