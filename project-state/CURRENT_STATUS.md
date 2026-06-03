# CURRENT_STATUS

## Stand: CAN-41.3b vorbereitet

CAN-41.3b entfernt/deaktiviert den Birthday-Safety-Hinweis und die Button-Badges aus CAN-41.3 wieder.

## Grund

Aktuell nutzen nur Forrest/Owner das Dashboard. Große Warn-/Safety-Schilder und Badge-Flut sind daher nicht sinnvoll. Wenn später Mods Zugriff bekommen, wird das sauber über Rollen/Rechte/Freigaben, Confirm-Dialoge und Audit-Logging gelöst.

## Änderung CAN-41.3b

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

Effekt:

```text
birthday_readonly_safety_ext.css wird nicht mehr geladen.
birthday_readonly_safety_ext.js wird nicht mehr geladen.
Der große Birthday-Safety-Hinweis ist weg.
Die Badge-Markierungen an Buttons sind weg.
```

Hinweis:

```text
Die alten Extension-Dateien können physisch noch im Ordner liegen, werden aber nicht mehr eingebunden und sind damit inaktiv.
```

## Neue Dashboard-Regel

```text
Keine großen Warn-/Safety-Schilder mehr als Standard.
Keine Badge-Flut an normalen Buttons.
Spätere Mod-Freigaben über Rollen/Rechte/Freigaben.
Kritische Aktionen später gezielt mit Confirm + Audit-Logging.
Hinweise nur dort, wo sie wirklich fachlich helfen.
Diagnosekarten sollen echte Statuswerte zeigen, nicht nur Warntexte.
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
CAN-41.3b anwenden und Sichtprüfung machen.
Danach CAN-41.4 Birthday Read-only Diagnosekarte planen/umsetzen.
```
