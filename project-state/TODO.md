# TODO

Stand: RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP75_ADMIN_NOTES_HEADER_ACTIONS_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP74 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Header-Aktionen sichtbar.
  - separate Toolbar nicht mehr sichtbar.
  - Liste bleibt sichtbar.
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
