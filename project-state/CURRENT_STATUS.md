# CURRENT_STATUS

## Stand: CAN-37.2 vorbereitet

CAN-37.2 ergänzt eine dedizierte Hug-System-Doku mit Read-only-/Write-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-37: Hug-System Status/Doku/Diagnose prüfen und glätten
```

## Ergebnis CAN-37.1 Analyse

Das aktive Hug-Modul ist:

```text
backend/modules/hug.js
```

Nicht vorhanden ist:

```text
backend/modules/hug_system.js
```

Das Modul ist produktiv relevant:

```text
MODULE_NAME = hug
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 3
routesPrefix = /api/hug, /hug, /api/dashboard/community/hug
```

Vorhanden:

```text
MODULE_META
/api/hug/status
/api/hug/config
/api/hug/settings
/api/hug/routes
/api/hug/integration-check
DB-Settings
DB-Textpaare
User-Stats
Pair-Stats
Pending-Rehugs
Chat-Output-Anbindung
Dashboard-Anbindung
```

Nicht vorhanden war bisher:

```text
docs/modules/hug.md
```

## Änderung CAN-37.2

Neu:

```text
docs/modules/hug.md
```

Darin festgehalten:

```text
- Modulzweck
- MODULE_META / Version / Routenprefix
- Datenbanktabellen
- produktive Hug/Rehug-Kernlogik
- Status-Endpunkt
- Read-only Routen
- produktive/schreibende Routen
- Dashboard-Schreibfunktionen
- Integration-Check als sichere Diagnose
- besondere Warnung zu Hug/Rehug/HugAll/on/off/stats/top/reload/admin-post
- Regeln für spätere Hug-Diagnosekarten
```

## Wichtigste Sicherheitsentscheidung

Read-only Diagnose darf nutzen:

```text
GET /api/hug/status
GET /api/hug/db/status
GET /api/dashboard/community/hug/status
GET /api/hug/config
GET /api/hug/settings
GET /api/hug/routes
GET /api/hug/integration-check
GET /api/hug/db/output-mode
GET /api/hug/types
GET /api/hug/texts
GET /api/hug/admin/text-pairs
GET /api/dashboard/community/hug/text-pairs
GET /api/hug/admin/hug-all-texts
GET /api/dashboard/community/hug/hug-all-texts
GET /api/hug/admin/response-texts
GET /api/dashboard/community/hug/response-texts
GET /api/hug/admin/top-title-texts
GET /api/dashboard/community/hug/top-title-texts
```

Nicht automatisch verwenden:

```text
POST /api/hug/action
GET/POST /api/hug/command
GET /api/hug/cmd
GET /api/hug/statscmd
GET /api/hug/top
GET/POST /api/hug/reload
POST /api/hug/text-store/reload
POST /api/hug/db/output-mode
POST /api/hug/admin/text-pairs
POST /api/hug/admin/hug-all-texts
POST /api/hug/admin/response-texts
POST /api/hug/admin/top-title-texts
```

## Nicht geändert

```text
Keine Codeänderung.
Kein Hug ausgelöst.
Kein Rehug ausgelöst.
Kein HugAll.
Kein on/off.
Keine Stats-/Top-Chat-Ausgabe ausgelöst.
Kein Reload.
Kein Text-Store-Reload.
Keine Output-Mode-Änderung.
Keine Textpaare gespeichert/gelöscht.
Keine Hug-All-Texte gespeichert/gelöscht.
Keine Response-Texte gespeichert/gelöscht.
Keine TopTitle-Texte gespeichert/gelöscht.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Discord-/Twitch-/Chat-Nachricht gepostet.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-37.2 anwenden.
Danach optional CAN-37.3 Hug Dashboard Diagnose-Tab prüfen/erweitern.
```
