# STEP618B – Event-Bus Overlay-Client-Erkennung finaler Stand

Stand: 2026-05-30

## Ergebnis

STEP618B ist der gültige aktuelle Stand für die Overlay-Client-Sichtbarkeit im Event-Bus-/Bus-Diagnose-Bereich.

Der Dashboard-Bereich:

```text
Admin → Bus-Diagnose → Clients
```

zeigt Overlay-Verbindungen jetzt gezielt über die Communication-Bus-Client-Registry.

## Gültiger Stand

```text
STEP617C_event_bus_settings_integrated_v0.8.2
STEP618_event_bus_overlay_clients_visibility_v0.1.0
STEP618B_event_bus_overlay_client_classification_fix_v0.1.1
```

## Verworfen / nicht verwenden

```text
STEP617B_event_bus_config_tab_hotfix_v0.1.1
communication_bus_settings.js
```

Die Settings-API gehört in `backend/modules/communication_bus.js`, nicht in ein separates Parallelmodul.

## Geänderte fachliche Einordnung

### Event-Bus Config

Die DB-basierte Event-Bus-Config läuft über:

```text
GET  /api/communication/settings
POST /api/communication/settings
```

und ist direkt in:

```text
backend/modules/communication_bus.js
```

integriert.

Geprüfter Live-Status:

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

Die Speicherung erfolgt DB-basiert über `backend/core/database.js`. SQLite ist aktuell aktiv; MySQL/MariaDB bleiben adapterbasiert vorbereitet.

### Overlay-Client-Sichtbarkeit

Der Clients-Tab im Bus-Diagnose-Dashboard zeigt Overlay-Clients zuerst und getrennt von Backend-Modulen.

Wichtig: Backend-Module mit `overlay` im Namen dürfen nicht als Overlay gezählt werden.

Falsch war:

```text
module enthält overlay
name enthält overlay
capability enthält overlay
```

Gültige Overlay-Erkennung:

```text
type == overlay
id beginnt mit overlay:
mode == overlay
```

Dadurch wird z. B. `module:overlay_monitor` korrekt als Backend-Modul und nicht als Overlay-Client eingeordnet.

## Was bewusst nicht umgesetzt wurde

```text
- keine Runtime-Config-Übernahme
- kein Hot-Reload der Bus-Runtime
- kein OBS-Refresh
- keine automatische Overlay-Reparatur
- keine produktive Umstellung von Sound/Alert/VIP auf den Bus
- keine neuen Backend-Module
```

## Prüfbefehle

```powershell
cd D:\Git\stream-control-center

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,dialect,table,runtimeAppliedImmediately
```

Overlay-/Client-Status kurz prüfen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"

$r.status.clients |
  Where-Object { $_.type -eq "overlay" -or $_.id -like "overlay:*" -or $_.mode -eq "overlay" } |
  Select-Object id,type,mode,module,name,version,connected,status,lastHeartbeatAt,lastSeenAt,disconnectReason
```

Backend-Modul `module:overlay_monitor` darf dabei nicht als Overlay erscheinen, außer es hätte explizit `type=overlay`, `mode=overlay` oder `id=overlay:*`.

## Aktueller nächster Fokus

Forrest möchte danach am Shoutout-System weiterarbeiten.

Nächster Arbeitsblock sollte daher nicht Event-Bus Runtime-Config sein, sondern:

```text
Shoutout-System prüfen / weiterentwickeln
```

Vor Änderungen am Shoutout-System zuerst echte Dateien aus GitHub/dev prüfen.
