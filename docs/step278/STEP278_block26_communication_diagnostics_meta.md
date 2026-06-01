# STEP278 Block 26 - Communication/Diagnostics MODULE_META

## Ziel

Loader-sichtbare Metadaten fuer Communication-/Diagnosemodule vereinheitlichen.

## Geaenderte Dateien

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `backend/modules/bus_diagnostics.js`
- `backend/modules/overlay_monitor.js`

## Geaendert

- `MODULE_META.type = runtime` ergaenzt/vereinheitlicht
- `category`, `routesPrefix`, `bus`, `legacy` ergaenzt
- `MODULE_VERSION` und `version` Export ergaenzt, wo sinnvoll

## Nicht geaendert

- keine Routenlogik
- keine Bus-/Heartbeat-Implementierung
- keine OBS-Aktionen
- keine DB-Migration
- keine Loader-Aenderung

## Erwartung nach Deploy

`/api/_status` zeigt fuer diese Module nicht mehr `type=unknown` bzw. `hasModuleMeta=false`.
