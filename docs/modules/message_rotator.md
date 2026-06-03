# Message-Rotator Modul

Stand: CAN-43.5

## Zweck

`message_rotator` verwaltet wiederkehrende und manuell auslösbare Chat-Hinweise, z. B. Follow-, Discord- und YouTube-Hinweise.

Das Modul nutzt:

- zentrale Config mit DB-/JSON-Fallback
- zentrale Textvarianten über `helper_texts`
- lokale/API-geschützte Routen
- Runtime-State für Rotator-Aktivität, Ticks und gesendete Nachrichten

## Backend-Datei

```text
backend/modules/message_rotator.js
```

## Modul-Metadaten

Bestätigter Stand:

```text
MODULE_NAME=message_rotator
MODULE_VERSION=0.1.1
MODULE_BUILD=diagnostics-standard
```

## Wichtige Endpunkte

Read-only / Diagnose:

```text
GET /api/message-rotator/status
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
GET /api/message-rotator/config
GET /api/message-rotator/settings
```

Produktive/aktive Routen:

```text
GET/POST /api/message-rotator/reload
GET/POST /api/message-rotator/start
GET/POST /api/message-rotator/stop
GET/POST /api/message-rotator/tick
GET/POST /api/message-rotator/next
GET/POST /api/message-rotator/manual
GET/POST /api/message-rotator/live-status
GET/POST /api/message-rotator/admin/settings
GET/POST /api/message-rotator/admin/texts
```

Legacy-Routen unter `/message-rotator/*` bleiben vorhanden.

## CAN-43.5 Prüfung

Bestätigt:

- `/api/message-rotator/status` vorhanden.
- Standard-`diagnostics`-Block vorhanden.
- `/api/message-rotator/routes` vorhanden.
- `/api/message-rotator/integration-check` vorhanden.
- Registry-Coverage sauber.
- Modul war beim Test nicht aktiv.
- Keine Nachricht wurde gesendet.
- Keine produktive Route wurde ausgelöst.

## Live-Werte CAN-43.5

```text
ok=True
module=message_rotator
moduleVersion=0.1.1
moduleBuild=diagnostics-standard
version=0.1.1
active=False
routeCount=46
```

Diagnostics:

```text
ok=True
health=ok
schemaReady=True
lastError=
```

Counts:

```text
items=3
enabledItems=3
manualCommands=5
textKeys=3
routes=46
apiRoutes=23
legacyRoutes=23
sendCount=0
totalTicks=0
ignoredTicks=0
chatMessagesSinceLastSend=0
```

Integration-Check:

```text
ok=True
healthy=True
warnings leer
errors leer
```

## Dashboard-Extension

Bewusst behalten:

```text
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
htdocs/dashboard/modules/message_rotator_diagnostics_ext.css
```

Diese Extension bleibt als dokumentierte Dashboard-Erweiterung erhalten.

## Wichtige Sicherheitsregel

Bei Diagnose-/Review-Arbeiten keine produktiven Routen auslösen:

- kein `start`
- kein `stop`
- kein `reload`
- kein `tick`
- kein `next`
- kein `manual`
- keine Chat-Ausgabe
- keine Admin-POSTs

## Ergebnis

`message_rotator` ist nach CAN-43.5 als sauber gegen den Diagnose-/Registry-Standard abgenommen.
