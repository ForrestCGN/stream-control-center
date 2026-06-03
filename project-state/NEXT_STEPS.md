# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.2 anwenden.
```

## Danach

```text
CAN-42.3 - Modul-Diagnose-/Hinweis-Inventar erstellen
```

Ziel:

```text
Welche Diagnose-/Hinweisdateien liegen aktuell noch direkt in Modul-Seiten?
Welche davon sind nur Frontend-Erweiterungen?
Welche können später aus index/app entfernt werden?
Welche Statuswerte sollen in Admin > Diagnose nachgebildet werden?
Welche Module liefern welche Standardfelder bereits?
```

## Zu prüfen in CAN-42.3

```text
commands_readonly_diagnostics
todo_readonly_diagnostics
tagebuch_readonly_diagnostics
hug_diagnostics_ext
message_rotator_diagnostics_ext
bus_diagnostics_readonly_summary
bus_diagnostics_subpage_safety_ext
overlay_monitor_safety_ext
birthday_readonly_diagnostics, falls noch eingebunden
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
