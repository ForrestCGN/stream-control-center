# Birthday Modul

Stand: CAN-43.4

## Zweck

Das Modul `birthday` verwaltet Geburtstagsregistrierungen, automatische Geburtstagsgrüße, Tagebuch-Erwähnungen und manuelle Birthday-Shows.

## Modulstand

- Backend-Datei: `backend/modules/birthday.js`
- Modulname: `birthday`
- Modulversion: `0.6.1`
- Build: `diagnostics-standard`
- Schema-Version: `7`
- Kategorie: `community`
- API-Prefix: `/api/birthday`

## Kernfunktionen

- Chat-Command `birthday`
- Registrierung eigener Geburtstage
- Anzeigen und Löschen eigener Geburtstage
- Tagesliste für Geburtstage
- automatische Glückwünsche bei Chat-Aktivität
- optionaler Tagebuch-Eintrag
- manuelle Birthday-Show
- Show-Profile
- Party-Presets
- Show-Queue
- Upload-/Import-Unterstützung für Birthday-Medien
- Dashboard-Adminbereiche für User, Settings und Texte

## Diagnose-Standard

CAN-43.4 bestätigt:

- Statusroute vorhanden: `GET /api/birthday/status`
- `diagnostics`-Block vorhanden
- Registry-Eintrag vorhanden
- Coverage sauber
- Live-Status ok
- keine Codeänderung nötig

## Wichtige Read-only-Endpunkte

- `GET /api/birthday/status`
- `GET /api/birthday/today`
- `GET /api/birthday/show/state`
- `GET /api/birthday/show/queue`
- `GET /api/birthday/admin/show/assets`
- `GET /api/birthday/admin/show/parties`
- `GET /api/birthday/admin/users`
- `GET /api/birthday/admin/settings`
- `GET /api/birthday/admin/texts`

## Produktive / schreibende Endpunkte

Diese Endpunkte verändern Zustand oder können produktive Aktionen auslösen und wurden in CAN-43.4 nicht ausgelöst:

- `POST /api/birthday/command`
- `POST /api/birthday/reload`
- `POST /api/birthday/show/stop`
- `POST /api/birthday/show/queue/clear-stale`
- `POST /api/birthday/admin/show/upload`
- `POST /api/birthday/admin/show/import-media`
- `POST /api/birthday/admin/show/parties`
- `POST /api/birthday/admin/show/profile`
- `POST /api/birthday/admin/user`
- `POST /api/birthday/admin/user/delete`
- `POST /api/birthday/admin/settings`
- `POST /api/birthday/admin/texts`

## CAN-43.4 Live-Abnahme

Bestätigte Werte:

```text
ok=True
module=birthday
moduleVersion=0.6.1
moduleBuild=diagnostics-standard
initialized=True
schemaOk=True
routeCount=20
```

Diagnostics:

```text
ok=True
health=ok
version=0.6.1
build=diagnostics-standard
schemaVersion=7
schemaReady=True
```

Registry-Coverage:

```text
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

Today:

```text
localDate=2026-06-03
rows leer
```

Show-State:

```text
active=False
```

Queue:

```text
pendingShowQueue=0
```

## Hinweise

Der Top-Level-Status liefert aktuell `version: 1`, während `moduleVersion` und `diagnostics.version` die echte Modulversion `0.6.1` liefern.

Das ist kein Blocker für CAN-43.4, kann aber später bei einem echten Birthday-Code-Step vereinheitlicht werden.

## Nicht geändert in CAN-43.4

- kein Backend-Code
- keine Dashboard-Datei
- keine Datenbank
- keine Registry
- keine Modulversion
- keine Birthday-Registrierung
- keine Birthday-Show
- keine Queue-/Admin-/Upload-Aktion
- keine produktiven Flows
