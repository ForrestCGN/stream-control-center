# TODO

Stand: RDAP73_ADMIN_NOTES_HUMAN_READABLE_LIST  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP74_ADMIN_NOTES_HUMAN_READABLE_LIST_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP73 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - technische Chips nicht prominent.
  - Hinweistext knapp.
  - Notiz-Titel menschlich lesbar.
  - Create/Update weiterhin ok.
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
