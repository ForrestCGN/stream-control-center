# TODO

Stand: RDAP69_ADMIN_NOTES_COMPACT_LAYOUT  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP69 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - Compact-Layout sichtbar und uebersichtlicher.
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
