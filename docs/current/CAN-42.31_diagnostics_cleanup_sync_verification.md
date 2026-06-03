# CAN-42.31 – Diagnose-Cleanup Sync-/Verifikationsschritt

## Ziel

Dieser Schritt prüft, ob die alten Dashboard-Diagnose-Dateien nach CAN-42.30 wirklich aus dem lokalen Repo entfernt wurden, ob `index.html` keine alten Referenzen mehr enthält und ob das Live-Verzeichnis noch Altdateien enthält.

Dieser Schritt löscht nichts.

## Hintergrund

CAN-42.30 liefert bewusst nur ein sicheres Cleanup-Script. Dadurch werden Dateien nicht automatisch aus Live oder GitHub entfernt.

Ablauf danach:

1. Cleanup lokal im Repo ausführen.
2. Lokalen Git-Status prüfen.
3. Änderungen nach GitHub/dev committen/pushen.
4. Live-System aus GitHub/dev aktualisieren oder gezielt synchronisieren.
5. Dashboard erneut testen.

## Prüfkandidaten

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
htdocs/dashboard/modules/birthday_readonly_diagnostics.css
htdocs/dashboard/modules/birthday_readonly_diagnostics.js
htdocs/dashboard/modules/birthday_readonly_safety_ext.css
htdocs/dashboard/modules/birthday_readonly_safety_ext.js
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
htdocs/dashboard/modules/todo_readonly_diagnostics.js
```

## Neuer Prüfbefehl

```cmd
tools\check\CAN-42.31_verify_diagnostics_cleanup.cmd
```

Der Check prüft:

- Existieren die Altdateien noch im lokalen Repo?
- Verweist `htdocs/dashboard/index.html` noch auf alte Dateien?
- Zeigt `git status --short` die erwarteten Löschungen?
- Existieren die Altdateien noch im Live-Ziel `D:\Streaming\stramAssets`?
- Verweist die Live-`index.html` noch auf alte Dateien?

## Erwartung nach lokalem CAN-42.30 Cleanup

Im lokalen Repo sollten die Kandidaten fehlen.

`git status --short` darf gelöschte Dateien anzeigen, bis sie committed wurden:

```text
 D htdocs/dashboard/modules/diagnostics_generic_details.js
 D htdocs/dashboard/modules/diagnostics_hug_display_fix.js
...
```

In `index.html` sollten keine Treffer mehr auftauchen für:

```text
diagnostics_generic_details
diagnostics_hug_display_fix
birthday_readonly_diagnostics
birthday_readonly_safety_ext
message_rotator_readonly_diagnostics
tagebuch_readonly_diagnostics
todo_readonly_diagnostics
```

## GitHub/dev

GitHub/dev ist erst sauber, wenn die lokalen Löschungen committed und gepusht wurden.

Standard-Workflow:

```cmd
02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd
```

Danach kann GitHub/dev erneut geprüft werden.

## Live-System

Live ist erst sauber, wenn nach dem Push das Live-System aktualisiert wurde.

Standard-Workflow:

```cmd
01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

Alternativ kann Live gezielt über den bestehenden Projekt-Workflow synchronisiert werden.

## Nicht geändert

- Keine Backend-Logik
- Keine Statusrouten
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktionen
- Keine DB-Migration
- Keine Dashboard-Fachfunktion
- Keine Datei wird durch CAN-42.31 gelöscht

