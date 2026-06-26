# TODO

Stand: RDAP71_ADMIN_NOTES_CLEAN_LAYOUT  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP72_ADMIN_NOTES_CLEAN_LAYOUT_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP71 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - Clean-Layout sichtbar und weniger debug-lastig.
  - Neue Notiz nicht doppelt/dauerhaft gross.
  - Create/Update weiterhin ok.
  - User-Detail/Navigation weiterhin ok.
  - Delete/Deactivate nicht sichtbar.
```

## Nicht machen

```text
- Kein Deactivate.
- Kein Delete.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Community-Read-Freigabe.
- Keine Rollen-/Gruppen-/Permission-Writes.
```
