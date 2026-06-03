# Current Chat Handoff - CAN41.4

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

CAN-41.4 vorbereitet: Birthday Read-only Diagnosekarte ergänzt.

## CAN-41 bisher

```text
CAN-41.1 Birthday-/Geburtstags-Modul read-only analysiert.
CAN-41.2 Birthday-Modul-Doku und Read-only/Write-Regeln aktualisiert.
CAN-41.3 Birthday Safety-Hinweis gebaut.
CAN-41.3b Birthday Safety-Hinweis/Badges wieder deaktiviert.
CAN-41.4 Birthday Read-only Diagnosekarte vorbereitet.
```

## CAN-41.4 Dateien

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/birthday_readonly_diagnostics.js
htdocs/dashboard/modules/birthday_readonly_diagnostics.css
```

Nicht geändert:

```text
backend/modules/birthday.js
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

## Diagnose-Routen

Genutzt:

```text
GET /api/birthday/status
GET /api/birthday/today
GET /api/birthday/show/state
```

Nicht genutzt:

```text
GET /api/birthday/show/queue
```

Grund:

```text
/show/queue kann intern stale Queue-Cleanup ausführen und ist deshalb nicht streng read-only.
```

## Erwarteter Sichttest

```text
Dashboard > Community > Birthday-System
```

Erwartung:

```text
Birthday Read-only Diagnosekarte sichtbar
Modul-Version sichtbar
Schema-Version sichtbar
Modul aktiv/inaktiv sichtbar
Auto-Gratulation sichtbar
Chat-Hook sichtbar
Heute-Anzahl sichtbar
Show aktiv/inaktiv sichtbar
letzter Fehler sichtbar
keine Warnschild-Flut
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

## Nächster Schritt

```text
CAN-41.4 anwenden und Screenshot/Sichttest prüfen.
Danach CAN-41.5 Testergebnis dokumentieren.
```
