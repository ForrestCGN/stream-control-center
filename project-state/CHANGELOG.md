# CHANGELOG

## 2026-06-26 - RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX

```text
- Admin-Notes/User-Detail Page-State in `rdap28-admin-notes.js` bereinigt.
- `setRdap40Page(...)` nutzt bevorzugt den bestehenden Haupt-Router `window.RdapMainRouter.setPage`.
- Header, aktive Navigation und sichtbares Panel werden fuer Admin-Notizen/User-Detail synchronisiert.
- Fallback fuer Header/Titel bleibt nur fuer den Fall, dass der Haupt-Router nicht verfuegbar ist.
- Frontend-only.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Route.
- Keine neue Permission.
- Kein Delete/Deactivate.
- Keine neuen Schreibbuttons.
```

## 2026-06-26 - RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD

```text
- Zentrale Projekt-/UI-/Roadmap-Dokumentation konsolidiert.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Kein Webserver-Deploy.
```
