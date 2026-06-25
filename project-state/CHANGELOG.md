# CHANGELOG

## RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN - 2026-06-25

- Admin-Notiz Write-Scope geplant, aber noch nicht gebaut.
- Empfohlener erster Write-Scope festgelegt:
  - create note
  - update note_text
  - deactivate note
- Physisches DELETE fuer ersten Scope ausgeschlossen.
- Permission `admin.users.note.write` als geplante Voraussetzung dokumentiert, aber nicht vergeben.
- Confirm-Write, Audit, Lock, Read-Back, Backup/Rollback und UI-Gating als Pflichtregeln dokumentiert.
- Naechster empfohlener Step: `RDAP31_ADMIN_NOTE_WRITE_BACKEND_CREATE_UPDATE_DEACTIVATE_DISABLED_UI`.
- Neuer Next-Chat-Prompt nach RDAP30 erstellt.
- Keine Backend-/UI-/DB-Aenderung in RDAP30.
