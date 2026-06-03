# CURRENT_STATUS

## Stand: CAN-42.3 vorbereitet

CAN-42.3 erstellt ein Inventar der direkt in Modul-Seiten eingebundenen Diagnose-/Hinweis-Erweiterungen.

## Ergebnis

Zentrale Diagnose ist aktiv:

```text
Admin > Diagnose
```

Direkte Modul-Diagnosen/Hinweise sind noch eingebunden bei:

```text
overlay_monitor_safety_ext
bus_diagnostics_readonly_summary
bus_diagnostics_subpage_safety_ext
message_rotator_diagnostics_ext
hug_diagnostics_ext
tagebuch_readonly_diagnostics
todo_readonly_diagnostics
commands_readonly_diagnostics
```

Birthday-Diagnose/Safety ist nicht mehr eingebunden:

```text
birthday_readonly_safety_ext
birthday_readonly_diagnostics
```

## Neue Arbeitslinie

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Bestehende Modul-Diagnosen werden schrittweise zentralisiert oder entfernt.
Keine Funktionalität entfernen.
```

## Nächster Schritt

```text
CAN-42.4 Todo-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen.
```
