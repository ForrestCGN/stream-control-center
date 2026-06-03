# Current Chat Handoff - CAN42.12b

## Stand

CAN-42.12b vorbereitet: Dashboard-Hug-Diagnoseanzeige korrigiert.

## Hintergrund

CAN-42.12 Backend-Test war erfolgreich:

```text
/api/hug/status
moduleVersion = 0.1.1
moduleBuild = diagnostics-standard
diagnostics.health = ok
```

Im Dashboard wurde beim Hug-System jedoch noch `Version 0.1` und `Routen -` angezeigt.

## Geänderte Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/HUG_DIAGNOSTICS_DISPLAY_FIX_CAN42_12B.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_12B.md
```

## Änderung

- Neues read-only Dashboard-Ergänzungsscript eingebunden.
- Das Script zieht bei sichtbarem Hug-Diagnosepanel `/api/hug/status` erneut per GET und korrigiert die sichtbaren Metriken.
- Version wird als String angezeigt.
- Routen zeigt mindestens `1`, wenn keine Routenliste vorhanden ist.

## Nicht geändert

```text
backend/modules/hug.js
Produktive Hug-/Rehug-Funktionen
Chat-Ausgaben
DB/Schema
Admin-Aktionen
```

## Test nach Entpacken

```powershell
.\stepdone.cmd "CAN-42.12b Dashboard Hug diagnostics display fix"
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

Dann Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Hug-System
Version = 0.1.1
Routen = 1 oder echte Routenzahl
```

## Nächster sinnvoller Schritt

Nach erfolgreichem Sichttest:

```text
CAN-42.13 Message-Rotator auf diagnostics-Standard prüfen/angleichen.
```
