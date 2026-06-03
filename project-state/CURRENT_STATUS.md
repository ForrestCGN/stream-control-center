# CURRENT_STATUS

## Stand: CAN-41.4 vorbereitet

CAN-41.4 ergänzt eine echte Birthday Read-only Diagnosekarte.

## Aktueller Arbeitsbereich

```text
CAN-41: Birthday-/Geburtstags-Modul read-only analysieren und diagnosefähig machen
```

## Änderung CAN-41.4

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/birthday_readonly_diagnostics.js
htdocs/dashboard/modules/birthday_readonly_diagnostics.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN41_4.md
```

Nicht geändert:

```text
backend/modules/birthday.js
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

## Verhalten

Die Diagnosekarte liest nur:

```text
GET /api/birthday/status
GET /api/birthday/today
GET /api/birthday/show/state
```

Nicht abgefragt:

```text
GET /api/birthday/show/queue
```

Grund:

```text
/show/queue kann intern stale Queue-Cleanup ausführen und ist deshalb nicht streng read-only.
```

## Angezeigte Werte

```text
Modul-Version
Schema-Version
Modul aktiv
Auto-Gratulation aktiv
Tagebuch-Autoeintrag aktiv
Nur wenn live
Chat-Hook installiert
heutige Geburtstage
registrierte Einträge, falls im Status vorhanden
Show aktiv/inaktiv
Show-Phase/Ziel
Routenanzahl
Local Date
letzte Auto-/Greeting-/Command-Zeit
letzter Fehler
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
CAN-41.4 anwenden und Sichttest machen.
Danach CAN-41.5 Testergebnis dokumentieren.
```
