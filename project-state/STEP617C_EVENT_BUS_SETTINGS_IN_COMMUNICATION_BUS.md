# STEP617C – Event-Bus Settings in communication_bus.js integriert

Stand: 2026-05-30

## Ziel

Korrektur zu STEP617/STEP617B: Die DB-basierte Event-/Communication-Bus-Config gehoert in das bestehende Modul `backend/modules/communication_bus.js` und nicht in ein separates Parallelmodul.

## Geaendert

- `backend/modules/communication_bus.js`
  - Version auf `0.8.2` erhoeht.
  - `GET /api/communication/settings` und `POST /api/communication/settings` direkt integriert.
  - Alias-Routen `GET/POST /api/event-bus/settings` bleiben erhalten.
  - Reset-Route `POST /api/communication/settings/reset-defaults` integriert.
  - DB-Schema `communication_bus_settings` wird ueber `backend/core/database.js` angelegt.
  - SQL-Typen werden ueber DB-Helper vorbereitet (`quoteIdentifier`, `textTypeSql`, `boolTypeSql`, `dateTimeTypeSql`, Dialektpruefung fuer MySQL/MariaDB-Key-Spalten).

- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Config-Tab laedt Settings eigenstaendig und zuverlaessig nach.
  - Anzeige referenziert jetzt `communication_bus` statt `communication_bus_settings` als Modul-Fallback.

## Entfernt / nicht mehr verwenden

- `backend/modules/communication_bus_settings.js` war ein falsches Parallelmodul und muss aus Repo/Live entfernt werden.

## Nicht geaendert

- Keine produktive Runtime-Umschaltung des laufenden Bus.
- Keine Aenderung an `helper_communication.js`.
- Keine OBS-/Overlay-Refreshlogik.
- Keine Sound-/Alert-/VIP-Flowaenderung.
- Keine direkte Dashboard-DB-Nutzung.

## Tests

```powershell
cd D:\Git\stream-control-center
Remove-Item "backend\modules\communication_bus_settings.js" -ErrorAction SilentlyContinue
node --check backend\modules\communication_bus.js
node --check htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "Event-Bus Settings in communication_bus integrieren"
```

Nach Backend-Neustart:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/settings"
$r | Select-Object ok,module,moduleVersion,storage,adapter,dialect,table,runtimeAppliedImmediately
```

Erwartung:

```text
ok=True
module=communication_bus
moduleVersion=0.8.2
storage=database
table=communication_bus_settings
runtimeAppliedImmediately=False
```
