# CAN-42.22 Diagnose-Datei-Inventar und Aufräumplan
Quelle: aktueller Upload `dashboard.zip` aus `htdocs/dashboard`.
Ziel: Transparenz über die vielen Diagnose-/Safety-Zusatzdateien. In diesem Step wurde **nichts gelöscht** und keine Produktivlogik geändert.
## Grundsatz ab jetzt
- Keine neuen Diagnose-Extra-Dateien pro Modul.
- Zentrale Liste/Auswahl gehört nach `htdocs/dashboard/modules/diagnostics.js`.
- Allgemeine Anzeige des standardisierten `diagnostics`-Blocks gehört nach `htdocs/dashboard/modules/diagnostics_generic_details.js`.
- Modul-spezifische Diagnose- oder Safety-Dateien nur behalten, wenn sie weiterhin eine echte Modul-Unterseite ergänzen und nicht durch die zentrale Diagnose ersetzt sind.
## Kern-Dateien
| Datei | Rolle | Empfehlung |
|---|---|---|
| `diagnostics.js` | Hauptdatei der zentralen Diagnose: Dropdown, Laden, Status-Detailseiten | Behalten, künftig Registry hier oder über Backend-Registry anbinden |
| `diagnostics.css` | Styling der zentralen Diagnose | Behalten |
| `diagnostics_generic_details.js` | Generischer Renderer für `diagnostics.counts/database/state/...` | Behalten, aber ohne Registry-/Dropdown-Patches |

## Aktuell in `index.html` geladene Diagnose-/Safety-Dateien
| Datei | Typ | Größe | Einschätzung |
|---|---:|---:|---|
| `bus_diagnostics.css` | CSS | 12107 | Prüfen. |
| `bus_diagnostics.js` | JS | 112341 | Prüfen. |
| `bus_diagnostics_readonly_summary.css` | CSS | 1432 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |
| `bus_diagnostics_readonly_summary.js` | JS | 7832 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |
| `bus_diagnostics_subpage_safety_ext.css` | CSS | 2103 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |
| `bus_diagnostics_subpage_safety_ext.js` | JS | 6369 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |
| `commands_readonly_diagnostics.css` | CSS | 2484 | Modul-spezifische Readonly-Erweiterung; prüfen, ob zentrale Diagnose sie ersetzt. Nicht blind löschen. |
| `commands_readonly_diagnostics.js` | JS | 8526 | Modul-spezifische Readonly-Erweiterung; prüfen, ob zentrale Diagnose sie ersetzt. Nicht blind löschen. |
| `diagnostics.css` | CSS | 5550 | Kernbestandteil, behalten. |
| `diagnostics.js` | JS | 28894 | Kernbestandteil, behalten. |
| `diagnostics_generic_details.js` | JS | 26836 | Kernbestandteil, behalten. |
| `diagnostics_hug_display_fix.js` | JS | 4209 | Wahrscheinlich Alt-Fix aus CAN-42.12b; nach integriertem Registry-/Generic-Fix als Kandidat zur Entfernung aus index.html prüfen. |
| `hug_diagnostics_ext.css` | CSS | 3478 | Modul-Unterseiten-Erweiterung; prüfen, ob noch auf der Modul-Seite gebraucht. |
| `hug_diagnostics_ext.js` | JS | 11675 | Modul-Unterseiten-Erweiterung; prüfen, ob noch auf der Modul-Seite gebraucht. |
| `message_rotator_diagnostics_ext.css` | CSS | 3435 | Modul-Unterseiten-Erweiterung; prüfen, ob noch auf der Modul-Seite gebraucht. |
| `message_rotator_diagnostics_ext.js` | JS | 11102 | Modul-Unterseiten-Erweiterung; prüfen, ob noch auf der Modul-Seite gebraucht. |
| `overlay_monitor_safety_ext.css` | CSS | 1947 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |
| `overlay_monitor_safety_ext.js` | JS | 6651 | Safety-/Summary-Erweiterung für eine Modul-Seite; eher behalten, solange die Unterseite sie nutzt. |

## Dateien vorhanden, aber in `index.html` nicht geladen
Diese Dateien werden aktuell vom Dashboard-Einstieg nicht eingebunden. Sie sind daher gute Kandidaten für Archivierung oder spätere Entfernung, aber erst nach Repo-/Live-Abgleich.

| Datei | Größe | Empfehlung |
|---|---:|---|
| `birthday_readonly_diagnostics.css` | 2225 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `birthday_readonly_diagnostics.js` | 9369 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `birthday_readonly_safety_ext.css` | 2160 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `birthday_readonly_safety_ext.js` | 7421 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `message_rotator_readonly_diagnostics.css` | 91 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `message_rotator_readonly_diagnostics.js` | 536 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `tagebuch_readonly_diagnostics.css` | 4408 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `tagebuch_readonly_diagnostics.js` | 15335 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `todo_readonly_diagnostics.css` | 3133 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |
| `todo_readonly_diagnostics.js` | 10839 | Archiv-/Löschkandidat, wenn keine andere Seite sie direkt lädt. |

## Sofort-Kandidaten für die nächste saubere Code-Runde
1. `diagnostics_hug_display_fix.js` aus `index.html` entfernen, wenn Hug in der zentralen Diagnose mit `diagnostics.js` + `diagnostics_generic_details.js` korrekt Version, Routen und Details anzeigt.
2. Die ungeladenen `*_readonly_diagnostics.*` Dateien in einen Archiv-/Cleanup-Step aufnehmen oder löschen, wenn keine direkte URL/Nebenseite sie braucht.
3. `diagnostics_generic_details.js` endgültig darauf begrenzen, nur Details zu rendern, nicht Registry/Dropdown zu patchen.
4. Danach Backend-Registry planen: `/api/diagnostics/registry`, damit die Liste nicht mehr im Frontend hart gepflegt wird.

## Warum noch nicht automatisch löschen?
Einige Erweiterungen hängen an Modul-Unterseiten oder Safety-Hinweisen. Löschen ohne Prüfung könnte Anzeigen entfernen, die nicht direkt in der zentralen Diagnose sichtbar sind. Deshalb erst Inventar, dann gezielte Entfernung pro Datei.

## Empfohlener nächster Step
CAN-42.23: `diagnostics_hug_display_fix.js` entfernen/in Kernlogik integrieren und danach Hug-, VIP-, OBS-, Communication-Bus-Detailseiten gegenprüfen.
