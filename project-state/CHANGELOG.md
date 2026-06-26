# CHANGELOG

## 2026-06-26 - RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX

```text
- Admin-Notes Zieluser-Kontext stabilisiert.
- Userwechsel setzt alte Liste/Count/Write-State sofort zurueck.
- Read-Request wird an den aktuellen selectedTargetUser gebunden.
- Verspaetete Antworten fuer alte Zieluser werden ignoriert.
- Count/Notice nennen den aktuellen Zieluser.
- Create/Update ignorieren Rueckantworten, wenn zwischenzeitlich der Zieluser gewechselt wurde.
- Frontend-only.
- Kein Backend.
- Keine DB.
- Keine neue Permission.
- Kein Delete/Deactivate.
```
