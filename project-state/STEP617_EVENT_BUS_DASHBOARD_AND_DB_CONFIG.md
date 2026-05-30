# STEP617 – Event-Bus Dashboard & DB-Config

Stand: 2026-05-30

## Ziel

Der bestehende Dashboard-Bereich `Bus-Diagnose` wird als zentraler Event-Bus-Bereich sauber nach Kategorien strukturiert. Zusätzlich wird eine DB-basierte Config-Grundlage fuer den Communication/Event-Bus ergaenzt.

## Betroffene Dateien

```text
backend/modules/communication_bus_settings.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Neue Backend-API

```text
GET  /api/communication/settings
POST /api/communication/settings
POST /api/communication/settings/reset-defaults?confirm=1

GET  /api/event-bus/settings
POST /api/event-bus/settings
POST /api/event-bus/settings/reset-defaults?confirm=1
```

## DB-Tabelle

```text
communication_bus_settings
```

Speichert normale Bus-Settings in der zentralen Projekt-DB ueber `backend/core/database.js` und damit aktuell SQLite, spaeter adapterfaehig fuer MySQL/MariaDB.

## Dashboard-Struktur

Tabs im bestehenden Bereich `Bus-Diagnose`:

```text
Uebersicht
Clients
Events & ACKs
Integrationen
Issues
Config
Rohdaten
```

## Bewusst nicht geaendert

```text
keine produktiven Bus-Flows umgebaut
keine bestehende WebSocket-Registry ersetzt
keine OBS-Refresh-Logik
keine echten Overlays geaendert
keine Sound-/Alert-/VIP-Flowaenderung
keine direkte Dashboard-DB-Zugriffe
```

## Wichtiger Hinweis

Die neue DB-Config ist die saubere Speicher- und Dashboard-Grundlage. Die sofortige Runtime-Uebernahme in den bereits laufenden Communication Bus bleibt bewusst ein separater Folge-STEP, damit bestehende Bus-Flows nicht ungetestet veraendert werden.

## Tests

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\communication_bus_settings.js
node --check htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "Event-Bus Dashboard strukturieren und DB-Config vorbereiten"
```

Nach Backend-Neustart:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,table,runtimeAppliedImmediately
```

Dashboard:

```text
Admin -> Bus-Diagnose -> Tabs pruefen
Config-Tab oeffnen
Wert testweise aendern und speichern
Neu laden und gespeicherten Wert pruefen
```
