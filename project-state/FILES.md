# Files

## Diagnose-Kern

- `backend/modules/diagnostics.js`
  - Enthält `/diag/*` Routen und die zentrale Diagnose-Registry `/api/diagnostics/registry`.
- `htdocs/dashboard/modules/diagnostics.js`
  - Zentrale Dashboard-Diagnose: Registry laden, Auswahl, Modulstatus, Standard-Diagnose, Coverage-Anzeige.
- `htdocs/dashboard/modules/diagnostics.css`
  - Styling der Dashboard-Diagnose.

## Prüftools

- `tools/check/CAN-42.31_verify_diagnostics_cleanup.cmd`
  - Prüft Repo und Live auf alte Diagnose-Dateien und alte `index.html`-Referenzen.

## Entfernte Altdateien

Diese Dateien dürfen nicht wieder als neue Diagnose-Architektur eingeführt werden:

- `htdocs/dashboard/modules/diagnostics_generic_details.js`
- `htdocs/dashboard/modules/diagnostics_hug_display_fix.js`
- `htdocs/dashboard/modules/birthday_readonly_diagnostics.css`
- `htdocs/dashboard/modules/birthday_readonly_diagnostics.js`
- `htdocs/dashboard/modules/birthday_readonly_safety_ext.css`
- `htdocs/dashboard/modules/birthday_readonly_safety_ext.js`
- `htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css`
- `htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js`
- `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css`
- `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js`
- `htdocs/dashboard/modules/todo_readonly_diagnostics.css`
- `htdocs/dashboard/modules/todo_readonly_diagnostics.js`

## Neue Doku-Dateien in CAN-42.32

- `docs/current/CAN-42.32_diagnostics_documentation_new_module_rules.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN42_32.md`
- `docs/modules/DIAGNOSTICS_NEW_MODULE_RULES.md`
- `docs/current/ForrestCGN_stream_control_center_MASTER_PROMPT_CAN42_32_UPDATED.txt`
