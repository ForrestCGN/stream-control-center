# CAN-42.21b Dashboard Diagnostics Registry Fix

## Ziel

Die zentrale Dashboard-Diagnose soll alle bisher auf Diagnostics-Standard gebrachten Module auswählbar machen.

## Änderung

Geändert wurde ausschließlich:

- `htdocs/dashboard/modules/diagnostics_generic_details.js`

Ergänzt wurden die Diagnoseeinträge:

- `Communication-Bus` -> `/api/communication/status`
- `OBS` -> `/api/obs/status`

Außerdem bleibt die bereits korrigierte VIP-Route erhalten:

- `VIP-System` -> `/api/vip-sound/status`

## Sicherheit

Keine Backend-Änderung. Keine Show-, Sound-, Chat-, OBS-, Repair- oder Admin-Aktion. Es werden nur GET-Statusdaten gelesen und angezeigt.

## Folgepunkt

Die Diagnose-Liste sollte später aus einer echten Backend-Registry automatisch erzeugt werden, z. B. über Modul-Metadaten oder einen zentralen Diagnose-Registry-Endpunkt. Das ist für CAN-42.21b nur dokumentiert, nicht umgesetzt.
