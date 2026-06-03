# Diagnostics

## Stand

```text
CAN-42.1 / Admin Diagnose Grundseite
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
```

## Dashboard-Registrierung

Die Grundseite registriert sich clientseitig als Modul:

```text
window.CGN.modules.diagnostics
window.CGN.moduleCatalog.diagnostics.enabled = true
Admin-Bereich: diagnostics
```

## Read-only Endpunkte

CAN-42.1 verwendet nur GET-Statusabfragen, z. B.:

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

Je Modul sollen nach Möglichkeit angezeigt werden:

```text
Modulname
Dashboard-Titel
Gruppe/Kategorie
Version
Schema-Version
Status-Endpunkt
Status erreichbar
Config-Quelle
Textsystem-Quelle
Routenanzahl
letzter Fehler
Rohdaten
```

## Schreibende Aktionen

CAN-42.1 enthält keine API-POSTs und keine produktiven Buttons.

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
CAN-42.2 Standardformat weiter definieren.
CAN-42.3 erste Module zentral glätten.
CAN-42.x alte Modul-Diagnosekarten nach und nach entfernen oder ersetzen.
```
