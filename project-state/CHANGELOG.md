# CHANGELOG

## 2026-06-26 - RDAP78C_ADMIN_NOTES_NOTICE_HUMANIZER_STALE_COUNT_FIX

```text
- Stale Count im Admin-Notes Notice-Humanizer korrigiert.
- simplifyAdminNotesNotice in remote-modboard.js nutzt nicht mehr dataset.rdap73OriginalText als bevorzugte Quelle.
- Count wird nur aus aktuellem Notice-Text humanisiert.
- "Keine Admin-Notizen" / "Keine Notizen" wird nicht mehr durch alten Count ueberschrieben.
- Frontend-only.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```
