# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE`

## Ziel

UI-Quelle `Lokal / Stream-PC` in Admin -> Logs aktivieren und an das 0.2.120 Skeleton anbinden.

## Vorher pruefen

```text
remote-modboard/backend/public/assets/modules/admin/audit-log.js
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
GET /api/remote/routes
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

## Erwarteter UI-Step

```text
Lokal / Stream-PC Dropdown-Option aktivieren
Quelle local ruft /api/remote/local/logs/list auf
Offline-/leer-Zustand sauber anzeigen
Status/Count korrekt anzeigen
Remote-Modboard Quelle unveraendert
```

## Spaeterer moeglicher Folgeschritt

`RDAP_0.2.122_LOCAL_LOGS_FIRST_SAFE_ITEMS`

Nur wenn 0.2.121 UI-Anbindung bestaetigt ist.
