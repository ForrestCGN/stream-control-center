# Current Chat Handoff - CAN-42.12c

## Stand

CAN-42.12c vorbereitet: Die zentrale Dashboard-Diagnose bekommt einen generischen Details-Renderer für standardisierte `diagnostics`-Blöcke.

## Geänderte Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
htdocs/dashboard/modules/diagnostics_generic_details.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/HUG_DIAGNOSTICS_DISPLAY_FIX_CAN42_12B.md
docs/current/GENERIC_DIAGNOSTICS_DETAILS_CAN42_12C.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_12C.md
```

Hinweis: `diagnostics_hug_display_fix.js` bleibt enthalten, damit CAN-42.12b vollständig bleibt. CAN-42.12c ergänzt zusätzlich generische Details für alle Module mit vorhandenem `diagnostics`-Block.

## Wichtig

Keine Backend-Logik wurde geändert. Der neue Renderer liest nur GET-Statusrouten und ergänzt Anzeigeelemente im Dashboard.

## Test

Nach Entpacken:

```powershell
.\stepdone.cmd "CAN-42.12c Dashboard generic diagnostics details renderer"
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Dann Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Hug-System
Admin > Diagnose > Commands
Admin > Diagnose > Tagebuch
Admin > Diagnose > Todo
```

Bei Modulen mit `diagnostics.counts` soll ein Block „Standard-Diagnostics“ erscheinen.

## Nächster Schritt

CAN-42.13: Message-Rotator auf Diagnostics-Standard prüfen/angleichen.
