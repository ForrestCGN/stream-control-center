# CURRENT_STATUS

## Stand: CAN-36.2 vorbereitet

CAN-36.2 ergänzt eine dedizierte Message-Rotator-Modul-Doku mit Read-only-/Write-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-36: Message-Rotator-Modul Status/Doku/Diagnose prüfen und glätten
```

## Ergebnis CAN-36.1 Analyse

Das Message-Rotator-Modul ist produktiv sensibler als Todo/Tagebuch:

```text
backend/modules/message_rotator.js
MODULE_NAME = message_rotator
MODULE_VERSION = 0.1.0
routesPrefix = /api/message-rotator, /message-rotator
```

Vorhanden:

```text
MODULE_META
publicState()
/api/message-rotator/status
/api/message-rotator/config
/api/message-rotator/settings
/api/message-rotator/routes
/api/message-rotator/integration-check
DB-Settings
DB-Textvarianten
Runtime-State
direkte Twitch-Chat-Message-Delivery
direkte Twitch-Announcement-Delivery
Dashboard-Anbindung
```

Nicht vorhanden war bisher:

```text
docs/modules/message_rotator.md
```

## Änderung CAN-36.2

Neu:

```text
docs/modules/message_rotator.md
```

Darin festgehalten:

```text
- Modulzweck
- MODULE_META / Version / Routenprefix
- Status-Endpunkt
- Read-only Routen
- produktive/schreibende Routen
- Dashboard-Schreibfunktionen
- Integration-Check als sichere Diagnose
- besondere Warnung zu next/manual/start/stop/tick/live-status/reload
- Regeln für spätere Message-Rotator-Diagnosekarten
```

## Wichtigste Sicherheitsentscheidung

Read-only Diagnose darf nutzen:

```text
GET /api/message-rotator/status
GET /api/message-rotator/config
GET /api/message-rotator/settings
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
GET /api/message-rotator/admin/settings
GET /api/message-rotator/admin/texts
GET /message-rotator/status
GET /message-rotator/config
GET /message-rotator/settings
GET /message-rotator/routes
GET /message-rotator/integration-check
GET /message-rotator/admin/settings
GET /message-rotator/admin/texts
```

Nicht automatisch verwenden:

```text
GET/POST /api/message-rotator/reload
GET/POST /api/message-rotator/start
GET/POST /api/message-rotator/stop
GET/POST /api/message-rotator/tick
GET/POST /api/message-rotator/next
GET/POST /api/message-rotator/manual
GET/POST /api/message-rotator/live-status
POST /api/message-rotator/admin/settings
POST /api/message-rotator/admin/texts
GET/POST /message-rotator/reload
GET/POST /message-rotator/start
GET/POST /message-rotator/stop
GET/POST /message-rotator/tick
GET/POST /message-rotator/next
GET/POST /message-rotator/manual
GET/POST /message-rotator/live-status
POST /message-rotator/admin/settings
POST /message-rotator/admin/texts
```

## Nicht geändert

```text
Keine Codeänderung.
Keine Message gesendet.
Kein Rotator gestartet/gestoppt.
Kein Tick ausgelöst.
Kein Next/Manual ausgelöst.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert/gelöscht.
Kein Reload ausgelöst.
Keine Live-Status-Abfrage erzwungen.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Discord-/Twitch-/Chat-Nachricht gepostet.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-36.2 anwenden.
Danach optional CAN-36.3 Message-Rotator Dashboard Read-only Diagnosekarte planen.
```
