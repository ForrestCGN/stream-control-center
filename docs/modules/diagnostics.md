# Diagnostics

## Stand

```text
CAN-42.2
```

## Zweck

`Admin > Diagnose` ist der zentrale Ort für modulübergreifende Read-only-Diagnose.

Ziel:

```text
Modul-Seiten bleiben Bedienseiten.
Diagnose wird zentral im Admin-Bereich gebündelt.
Produktive Aktionen werden nicht ausgelöst.
```

## Dateien

```text
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
htdocs/dashboard/index.html
docs/modules/diagnostics_standard.md
```

## Dashboard-Registrierung

Die Grundseite registriert sich clientseitig als Modul:

```text
window.CGN.modules.diagnostics
window.CGN.moduleCatalog.diagnostics.enabled = true
Admin-Bereich: diagnostics
```

## Read-only Endpunkte

CAN-42 verwendet nur GET-Statusabfragen, z. B.:

```text
/api/birthday/status
/api/birthday/today
/api/birthday/show/state
/api/todo/status
/api/tagebuch/status
/api/hug/status
/api/commands/status
/api/message-rotator/status
/api/bus-diagnostics/status
/api/overlay-monitor/status
/api/sound/status
/api/media/status
/api/vip/status
/api/alerts/status
```

Nicht genutzt:

```text
/api/birthday/show/queue
```

Grund:

```text
Die Birthday-Queue-Route kann intern stale Queue-Cleanup ausführen und ist daher nicht streng read-only.
```

## Standardfelder

Siehe:

```text
docs/modules/diagnostics_standard.md
```

Kurzfassung:

```text
module
version
enabled
status
schemaVersion
configSource
textSource
database
routesCount
lastError
lastLoadedAt
eventBus später
```

## Fehlende Felder

Wenn in `Admin > Diagnose` ein Feld leer oder `-` ist, bedeutet das:

```text
- das Modul liefert das Feld noch nicht
- oder das Feld heißt im Modul anders
- oder es ist für dieses Modul nicht relevant
```

Das ist kein Fehler der Diagnose-Seite. Es ist Teil der schrittweisen Standardisierung.

## Schreibende Aktionen

CAN-42 enthält keine API-POSTs und keine produktiven Buttons.

Nicht auslösen:

```text
Show
Sound
Chat
Tagebuch
Reload
Upload
Import
Queue-Clear
OBS-Reparatur
DB-Migration
Admin-Schreibaktion
```

## Folgeplan

```text
CAN-42.3 Modul-Diagnose-/Hinweis-Inventar erstellen.
CAN-42.4 erste alte Modul-Diagnosen zentral nachbilden.
CAN-42.x alte Modul-Diagnosen nach und nach entfernen oder ersetzen.
```
