# CHANGELOG

## 2026-06-26 - RDAP78B_ADMIN_NOTES_READ_RESPONSE_USER_SCOPE_FIX

```text
- Admin-Notes Read-Response wird frontendseitig strikt auf aktuell ausgewaehlten Zieluser gescoped.
- Count basiert nur noch auf Notizen, deren target_user_uid/targetUserUid zum Zieluser passt.
- Fremde Antwort-Notizen werden nicht angezeigt.
- Kein Backend.
- Keine DB.
- Keine neue Permission.
- Kein Delete/Deactivate.
```
