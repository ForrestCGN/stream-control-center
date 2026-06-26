# TODO

Stand: RDAP72_ADMIN_NOTES_HIDE_TECHNICAL_STATUS  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP73_ADMIN_NOTES_HIDE_TECHNICAL_STATUS_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP72 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - technische Statusbloecke nicht mehr prominent.
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
