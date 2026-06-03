# Current Chat Handoff - CAN41.3b

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

CAN-41.3b vorbereitet: Birthday-Safety-Hinweis/Badges aus CAN-41.3 werden wieder deaktiviert.

## Grund

Der große Safety-Hinweis ist aktuell unnötig, weil das Dashboard derzeit nur von Forrest/Owner genutzt wird. Später, wenn Mods Zugriff bekommen, werden kritische Aktionen sauber über Rollen/Rechte/Freigaben, Confirm-Dialoge und Audit-Logging abgesichert.

## CAN-41.3b Änderung

Geändert:

```text
htdocs/dashboard/index.html
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN41_3b.md
```

Nicht geändert:

```text
backend/modules/birthday.js
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Deaktiviert:

```text
htdocs/dashboard/modules/birthday_readonly_safety_ext.js
htdocs/dashboard/modules/birthday_readonly_safety_ext.css
```

Die Dateien können noch existieren, werden aber nicht mehr geladen.

## Neue Dashboard-Regel

```text
Keine großen Warn-/Safety-Schilder mehr als Standard.
Keine Badge-Flut an normalen Buttons.
Spätere Mod-Freigaben über Rollen/Rechte/Freigaben.
Kritische Aktionen später gezielt mit Confirm + Audit-Logging.
Hinweise nur dort, wo sie wirklich fachlich helfen.
Diagnosekarten sollen echte Statuswerte zeigen, nicht nur Warntexte.
```

## Erwarteter Sichttest

```text
Dashboard > Community > Birthday-System
```

Erwartung:

```text
kein großer Safety-Hinweis mehr
keine admin/media/show/reload Badges an Buttons
Birthday-Modul funktioniert optisch wieder normal
keine Show
kein Sound
kein Chat
kein Tagebuch
keine Admin-POSTs
```

## Nicht ausgelöst

```text
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

## Nächster sinnvoller Schritt

```text
CAN-41.4 - Birthday Read-only Diagnosekarte
```

Ziel:

```text
Modulversion
Schema-Version
Modul aktiv
Auto-Gratulation aktiv
Chat-Hook installiert
heutige Geburtstage
registrierte Einträge
Show aktiv/inaktiv
letzter Fehler
```
