# Current Chat Handoff - CAN41.2

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-41.2 vorbereitet: Birthday-Modul wurde analysiert und die Modul-Doku mit Read-only-/Write-Regeln aktualisiert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte

```text
CAN-39.4 Overlay-Monitor dokumentiert und Sicherheits-Hinweis sichtbar geprüft.
CAN-40.3 Bus-Diagnose-Unterseiten reduziert und Sichttest erfolgreich.
CAN-41.0 neuen Arbeitsblock ausgewählt.
CAN-41.1 Birthday-/Geburtstags-Modul read-only analysiert.
```

## CAN-41.1 Analyse-Kurzfassung

Backend:

```text
backend/modules/birthday.js
```

Dashboard:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
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

`MODULE_META`:

```text
type = runtime
category = community
routesPrefix = /api/birthday
publishes = birthday.status, birthday.show
consumes = twitch.chat.activity, sound.status
```

## Wichtige Risiken

Das Modul kann produktiv:

```text
Chat-Nachricht senden
Tagebuch-Eintrag schreiben
Greeting-Log / DB schreiben
Birthday-Show starten
Intro/Video/Song als Sound-Items starten
Sound-Bundle an /api/sound/bundle senden
Sound über /api/sound/play starten
Sound über /api/sound/stop stoppen
Show-State setzen
Show-Queue schreiben
User speichern/löschen
Settings speichern
Textvarianten speichern
Medien hochladen/importieren
Runtime reloaden
```

## CAN-41.2 Inhalt

Aktualisiert:

```text
docs/modules/birthday.md
```

Dort dokumentiert:

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

## Read-only geeignete Diagnose

Geeignet:

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

## Empfohlener nächster Schritt

```text
CAN-41.2 anwenden.
Danach optional CAN-41.3 Birthday Dashboard Read-only Diagnose/Sicherheits-Hinweis ergänzen.
```

## Möglicher CAN-41.3 Inhalt

```text
- keine Backend-Änderung
- kein Extra-Tab oder eigener kleiner Diagnosebereich
- produktive Birthday-Show-/Sound-/Upload-/Admin-Aktionen klarer markieren
- GET-only Statusübersicht anzeigen
- GET /show/queue vermeiden oder klar als nicht streng read-only markieren
- keine POSTs
- keine Show
- kein Sound
- kein Chat
- kein Tagebuch
```
