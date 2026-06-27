# Current Chat Handoff - CAN36.2

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

CAN-36.2 vorbereitet: Message-Rotator-Modul-Doku und Read-only-/Write-Regeln ergänzt.

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
CAN-33.4 Commands Diagnosekarte dokumentiert.
CAN-34.4 Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix dokumentiert.
CAN-35.4 Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte dokumentiert.
CAN-36.0 neuen Arbeitsblock ausgewählt.
CAN-36.1 Message-Rotator-Modul analysiert.
```

## CAN-36.1 Analyse-Kurzfassung

Backend `message_rotator.js`:

```text
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

Bisher fehlte:

```text
docs/modules/message_rotator.md
```

## CAN-36.2 Inhalt

Neu:

```text
docs/modules/message_rotator.md
```

Dokumentiert:

```text
Modulzweck
MODULE_META / Version / Routenprefix
Status-Endpunkt
Read-only Routen
produktive/schreibende Routen
Dashboard-Schreibfunktionen
Integration-Check als sichere Diagnose
besondere Warnung zu next/manual/start/stop/tick/live-status/reload
Regeln für spätere Message-Rotator-Diagnosekarten
```

## Sicherheitsregeln

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

Nicht automatisch nutzen:

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

## Empfohlener nächster Schritt

```text
CAN-36.2 anwenden.
Danach optional CAN-36.3 Message-Rotator Dashboard Read-only Diagnosekarte planen.
```

## Möglicher CAN-36.3 Inhalt

```text
Message-Rotator Dashboard Read-only Diagnosekarte:
- Modulversion anzeigen
- Runtime-State anzeigen
- active / startedAt / stoppedAt anzeigen
- Chat-Zähler anzeigen
- SendCount anzeigen
- letzte Ausgabe anzeigen
- Config-Quelle anzeigen
- Item-Zähler anzeigen
- Textvarianten-/Texthelper-Status anzeigen
- Integration-Check anzeigen
- Live-Status-Config anzeigen, ohne Force-Abfrage
- Read-only Routen als erlaubt markieren
- Start/Stop/Tick/Next/Manual/Reload/Admin-POST-Routen als gesperrt markieren
```

Wichtig:

```text
Direkt als eigener Diagnose-Tab planen.
Keine MutationObserver-Schleife.
Kein Dauer-Rendering.
Nur kontrolliertes Click-/Show-Handling wie CAN-34.3c.
Keine /next oder /manual Vorschau in der Diagnosekarte.
Keine /live-status Force-Abfrage in der Diagnosekarte.
```
