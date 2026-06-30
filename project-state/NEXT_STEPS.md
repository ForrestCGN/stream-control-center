# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE`

## Ziel

UI-Quelle `Lokal / Stream-PC` in `Admin -> Logs` aktivieren und an das 0.2.120 Skeleton anbinden.

## Wichtige Klarstellung

```text
3010 = Remote-Modboard Backend auf dem Webserver
8080 = lokaler Stream-PC / Dashboard / Agent beim Nutzer
```

0.2.121 soll zuerst die vorhandene Remote-Modboard-UI an die bereits vorhandenen Remote-Modboard-Routen anbinden.

Keine Aenderung am lokalen 8080-Dashboard in diesem Step, ausser sie wird vorher explizit geplant.

## Vorher wirklich lesen

```text
remote-modboard/backend/public/assets/modules/admin/audit-log.js
remote-modboard/backend/src/services/local-logs-readonly.service.js
remote-modboard/backend/src/routes/local-logs-readonly.routes.js
remote-modboard/backend/src/routes/routes.routes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON_DEPLOY_CONFIRMED.md
```

## Erwarteter UI-Step

```text
Log-Quelle Lokal / Stream-PC aktivierbar machen
bei source=local /api/remote/local/logs/list abfragen
Status/Leerzustand sauber anzeigen
count/items aus local API verwenden
Remote-Modboard Quelle unveraendert lassen
keine echten lokalen Items aggregieren
keine 8080-Aenderung ohne separaten Plan
```

## Regeln

```text
nur UI-Anbindung an bestehende read-only API
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Admin-Notizen weiter ausbauen
Remote-Logs unveraendert lassen
```

## Spaeterer moeglicher Folgeschritt

`RDAP_0.2.122_LOCAL_LOGS_FIRST_SAFE_ITEMS`

Nur wenn 0.2.121 UI-Anbindung bestaetigt ist.
