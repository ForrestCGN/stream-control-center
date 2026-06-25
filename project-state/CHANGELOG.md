# CHANGELOG

## RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP - 2026-06-25

- Status-/Routes-Semantik nach RDAP40 bereinigt.
- `/api/remote/status` auf `statusApiVersion: rdap_admin_note_ui_status42.v1` gesetzt.
- `/api/remote/routes` auf `statusApiVersion: rdap_admin_note_ui_status42.v1` gesetzt.
- `adminNoteWriteConfirmed` in Status/Routes semantisch erweitert:
  - `backendAutoUiWriteButtonsEnabled: false`
  - `uiWriteButtonsEnabled: true`
  - `adminNoteCreateUiPrepared: true`
  - `adminNoteCreateButtonVisibleForWritePermission: true`
  - `adminNoteUpdateUiPrepared: false`
  - `adminNoteDeactivateUiPrepared: false`
  - `adminNoteDeleteUiPrepared: false`
  - `noNewWriteFunctionInRdap42: true`
- Neues Statusobjekt `adminNoteUiStatusSemantics` ergaenzt.
- Keine neue Schreibfunktion.
- Keine DB-Migration.
- Keine Permission-Aenderung.
- Keine Frontend-Aenderung.

## RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN - 2026-06-25

- Status-Semantik-Cleanup nach RDAP40 geplant.
- Bekannte Semantik-Unsauberkeit `uiWriteButtonsEnabled: false` nach RDAP40 dokumentiert.

## RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP40 Live-Bestaetigung dokumentiert.
- Admin -> Admin-Notizen zeigt 3 Notizen.
- Button "Neue Notiz" ist sichtbar.
- Create funktioniert.
- Liste aktualisiert sich nach Create automatisch.
- Keine Update-/Deactivate-/Delete-Buttons sichtbar.
