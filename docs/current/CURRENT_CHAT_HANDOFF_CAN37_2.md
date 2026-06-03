# Current Chat Handoff - CAN37.2

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

CAN-37.2 vorbereitet: Hug-System-Doku und Read-only-/Write-Regeln ergänzt.

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
CAN-36.4 Message-Rotator-Modul dokumentiert und vorhandener Diagnose-Tab erweitert; Positionstest erfolgreich.
CAN-37.0 neuen Arbeitsblock ausgewählt.
CAN-37.1 Hug-System analysiert.
```

## CAN-37.1 Analyse-Kurzfassung

Aktives Backend:

```text
backend/modules/hug.js
```

Nicht vorhanden:

```text
backend/modules/hug_system.js
```

Modul-Metadaten:

```text
MODULE_NAME = hug
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 3
routesPrefix = /api/hug, /hug, /api/dashboard/community/hug
```

Produktive Tabellen:

```text
hug_users
hug_pair_stats
hug_pending_rehugs
hug_settings
hug_types
hug_texts
hug_text_pairs
```

Das Modul ist produktiv sensibel:

```text
Hug/Rehug verändert User-/Pair-/Pending-Stats.
on/off verändert User-Enabled-State.
Stats/Top/Reload/Commands können Chat-Ausgaben erzeugen.
Admin-POST-Routen speichern oder löschen Texte.
```

Bisher fehlte:

```text
docs/modules/hug.md
```

## CAN-37.2 Inhalt

Neu:

```text
docs/modules/hug.md
```

Dokumentiert:

```text
Modulzweck
MODULE_META / Version / Routenprefix
Datenbanktabellen
produktive Hug/Rehug-Kernlogik
Status-Endpunkt
Read-only Routen
produktive/schreibende Routen
Dashboard-Schreibfunktionen
Integration-Check als sichere Diagnose
besondere Warnung zu Hug/Rehug/HugAll/on-off/stats/top/reload/admin-post
Regeln für spätere Hug-Diagnosekarten
```

## Sicherheitsregeln

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

Nicht automatisch nutzen:

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

## Empfohlener nächster Schritt

```text
CAN-37.2 anwenden.
Danach optional CAN-37.3 Hug Dashboard Diagnose-Tab prüfen/erweitern.
```

## Möglicher CAN-37.3 Inhalt

```text
- vorhandenen Diagnose-Tab prüfen
- produktive Buttons wie "Hug-Reload testen" klarer markieren
- Status-/Schema-/DB-/Textpaar-Zähler anzeigen
- Integration-Check anzeigen
- Read-only Routen als erlaubt markieren
- produktive Hug/Rehug/Command/Reload/Admin-POST-Routen als gesperrt markieren
```

Wichtig:

```text
Vorhandenen Diagnose-Tab nutzen, keinen Extra-Tab.
Keine Hug/Rehug/Stats/Top/Reload/Admin-POST-Tests.
Kein MutationObserver.
Kein Dauer-Rendering.
Keine Chat-Ausgabe.
```
