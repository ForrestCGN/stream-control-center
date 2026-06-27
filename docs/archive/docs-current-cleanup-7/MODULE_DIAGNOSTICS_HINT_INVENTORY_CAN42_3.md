# Modul-Diagnose-/Hinweis-Inventar

## Stand

```text
CAN-42.3
```

## Ziel

Dieses Inventar hält fest, welche Diagnose-/Hinweis-Erweiterungen derzeit noch direkt über Modul-Seiten eingebunden sind und später nach `Admin > Diagnose` zentralisiert oder entfernt werden sollen.

## Grundregel

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten direkt in einzelne Module.
Bestehende Modul-Diagnosen/Hinweise werden schrittweise zentralisiert.
Keine Funktionalität entfernen.
```

## Quelle der Prüfung

Geprüft wurde `htdocs/dashboard/index.html` auf GitHub/dev.

Relevante Einbindungen:

```text
overlay_monitor_safety_ext.css/js
diagnostics.css/js
bus_diagnostics_readonly_summary.css/js
bus_diagnostics_subpage_safety_ext.css/js
message_rotator_diagnostics_ext.css/js
hug_diagnostics_ext.css/js
tagebuch_readonly_diagnostics.css/js
todo_readonly_diagnostics.css/js
commands_readonly_diagnostics.css/js
```

Nicht mehr eingebunden:

```text
birthday_readonly_safety_ext.css/js
birthday_readonly_diagnostics.css/js
```

## Inventar

| Bereich | Datei(en) | Aktueller Ort | Bewertung | Ziel |
|---|---|---|---|---|
| Admin Diagnose | `diagnostics.css/js` | Admin > Diagnose | bleibt | zentrale Diagnose weiter ausbauen |
| Overlay-Monitor Hinweis | `overlay_monitor_safety_ext.css/js` | Control > Overlays | Modul-Hinweis | später prüfen, ob Hinweis zentralisiert oder stark reduziert wird |
| Bus Diagnose Summary | `bus_diagnostics_readonly_summary.css/js` | Admin > Bus-Diagnose | Sonderfall Admin | vorerst behalten, später in zentrale Diagnose integrieren |
| Bus Diagnose Subpage Safety | `bus_diagnostics_subpage_safety_ext.css/js` | Admin > Bus-Diagnose | Sonderfall Admin | vorerst behalten, später prüfen |
| Message-Rotator Diagnose | `message_rotator_diagnostics_ext.css/js` | System > Message-Rotator | Modul-Diagnose | später nach Admin > Diagnose überführen |
| Hug Diagnose | `hug_diagnostics_ext.css/js` | Community > Hug | Modul-Diagnose | später nach Admin > Diagnose überführen |
| Tagebuch Diagnose | `tagebuch_readonly_diagnostics.css/js` | Community > Tagebuch | Modul-Diagnose | später nach Admin > Diagnose überführen |
| Todo Diagnose | `todo_readonly_diagnostics.css/js` | Community > Todo | Modul-Diagnose | später nach Admin > Diagnose überführen |
| Commands Diagnose | `commands_readonly_diagnostics.css/js` | Community > Commands | Modul-Diagnose | später nach Admin > Diagnose überführen |
| Birthday Safety/Diagnose | `birthday_readonly_safety_ext.css/js`, `birthday_readonly_diagnostics.css/js` | nicht eingebunden | bereits deaktiviert | keine weitere Modul-Seiten-Diagnose bauen |

## Priorität für Bereinigung

### Priorität 1: einfache Modul-Diagnosen

```text
todo_readonly_diagnostics
tagebuch_readonly_diagnostics
commands_readonly_diagnostics
hug_diagnostics_ext
message_rotator_diagnostics_ext
```

Diese sind gute Kandidaten, um nach und nach aus `index.html` zu entfernen, sobald `Admin > Diagnose` die relevanten Statuswerte ausreichend zentral anzeigt.

### Priorität 2: Sonderfälle

```text
bus_diagnostics_readonly_summary
bus_diagnostics_subpage_safety_ext
overlay_monitor_safety_ext
```

Diese Bereiche sind administrativ oder sicherheits-/recovery-nah und sollen nicht blind entfernt werden. Erst prüfen, welche Hinweise fachlich weiter gebraucht werden.

### Bereits bereinigt / deaktiviert

```text
birthday_readonly_safety_ext
birthday_readonly_diagnostics
```

Birthday wird künftig über `Admin > Diagnose` abgedeckt.

## Nächste Schritte

```text
CAN-42.4 Todo-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen.
CAN-42.5 Tagebuch-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen.
CAN-42.6 Commands-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen.
CAN-42.7 Hug/Message-Rotator prüfen.
```

## Sicherheitsregeln

```text
Keine Backend-Routen entfernen.
Keine Statusrouten entfernen.
Keine Datenbank anfassen.
Keine produktiven Aktionen auslösen.
Keine Dashboard-Testbuttons auslösen.
Keine Funktionalität entfernen.
Nur Frontend-Einbindungen/alte Diagnose-Erweiterungen nach Prüfung entfernen.
```
