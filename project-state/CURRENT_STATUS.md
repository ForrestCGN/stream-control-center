# CURRENT_STATUS

## Stand: CAN-41.2 vorbereitet

CAN-41.2 aktualisiert die Birthday-Modul-Doku und hält Read-only-/Write-Regeln fest.

## Aktueller Arbeitsbereich

```text
CAN-41: Birthday-/Geburtstags-Modul read-only analysieren und dokumentieren
```

## Ergebnis CAN-41.1 Analyse

Aktives Backend:

```text
backend/modules/birthday.js
```

Aktueller Modulstand:

```text
MODULE_NAME = birthday
MODULE_VERSION = 0.6.0
SCHEMA_VERSION = 7
API_PREFIX = /api/birthday
SETTINGS_TABLE = birthday_settings
TEXTS_MODULE = birthday
```

Dashboard:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Alte Doku war veraltet:

```text
docs/modules/birthday.md
```

Die alte Doku sagte noch, dass keine klare Versionskennung erkannt wurde. Das stimmt nicht mehr: `MODULE_VERSION = 0.6.0` ist vorhanden.

## Änderung CAN-41.2

Aktualisiert:

```text
docs/modules/birthday.md
```

Darin dokumentiert:

```text
Modulzweck
Moduldateien
MODULE_META / Version / Routenprefix
Konfiguration
DB / Schema
Textsystem
automatische Gratulation
manuelle Geburtstagsshow
Medien / Upload / Import
Backend-Routen
Dashboard-Routen und produktive Dashboard-Funktionen
Read-only geeignete Diagnose
Sicherheitsregeln für spätere Arbeiten
```

## Wichtigste Sicherheitsentscheidung

Read-only geeignet:

```text
GET /api/birthday/status
GET /api/birthday/today
GET /api/birthday/show/state
GET /api/birthday/admin/users?includeInactive=true
GET /api/birthday/admin/settings
GET /api/birthday/admin/texts
GET /api/birthday/admin/show/assets
GET /api/birthday/admin/show/parties
```

Vorsicht:

```text
GET /api/birthday/show/queue
```

weil intern stale Queue-Cleanup passieren kann.

Nicht ohne eigenen Go-Schritt:

```text
POST /api/birthday/*
```

## Nicht geändert

```text
Keine Codeänderung.
Keine Geburtstags-Show.
Kein Intro/Video/Song.
Keine Sound-Bundle-Aktion.
Keine Chat-/Discord-Nachricht.
Kein Tagebuch-Eintrag.
Keine User gespeichert/gelöscht.
Keine Settings/Textvarianten gespeichert.
Kein Media-Import/Upload/Recheck.
Kein Reload.
Keine DB-Migration.
Keine Admin-POSTs.
Keine Dashboard-Testbuttons ausgelöst.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-41.2 anwenden.
Danach optional CAN-41.3 Birthday Dashboard Read-only Diagnose/Sicherheits-Hinweis ergänzen.
```
