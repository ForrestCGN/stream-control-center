# STEP618 – Event-Bus Overlay-Clients sichtbar machen

Stand: 2026-05-30

## Ziel

Im bestehenden Event-Bus-/Bus-Diagnose-Dashboard soll zuerst und klar erkennbar sein, welche Overlay-Clients aktuell am Communication Bus registriert und verbunden sind.

## Gültiger Kontext

Basis ist STEP617C:

- `backend/modules/communication_bus.js` enthaelt Runtime, Status und DB-basierte Settings-API.
- `/api/communication/settings` meldet `module=communication_bus` und speichert in `communication_bus_settings`.
- `communication_bus_settings.js` ist verworfen und darf nicht verwendet werden.

## Geänderte Dateien

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Änderung

- Der Clients-Tab zeigt Overlay-Clients jetzt zuerst.
- Neue Overlay-Zusammenfassung:
  - Overlays gesamt
  - online
  - stale
  - offline
  - dead
  - ignored/sonstige
- Eigene Overlay-Tabelle mit:
  - Overlay-ID
  - Status
  - Modul/Version
  - letzter Heartbeat
  - letzter Kontakt/Grund
  - Capabilities
- Die Übersicht zeigt eine eigene Overlay-Client-Karte mit Status und letztem Heartbeat.
- Die Gruppierung nutzt vorhandene Communication-Bus-Client-Daten aus `/api/communication/status` bzw. der Bus-Diagnose-Aggregation.

## Bewusst nicht geändert

- Kein Backend-Umbau.
- Keine neue Moduldatei.
- Keine Runtime-Config-Anbindung.
- Keine OBS-Refresh- oder Reparaturfunktion.
- Keine produktive Sound-/Alert-/VIP-Umschaltung.
- Keine Änderung an echten Overlays.

## Test

```powershell
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "Event-Bus Overlay-Clients im Dashboard sichtbar machen"
```

Danach Dashboard hart neu laden:

```text
Dashboard -> Admin -> Bus-Diagnose -> Clients
```

Erwartung:

- Oben steht die Overlay-Verbindungsübersicht.
- Darunter steht die Overlay-Clients-Tabelle.
- Ein geöffnetes Test-Overlay erscheint als online/verbunden.
- Nach Schließen wechselt es nach Status-Aktualisierung auf offline/stale/dead, abhängig von der Bus-Statuslogik.
