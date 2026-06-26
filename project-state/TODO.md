# TODO

Stand: RDAP67_ADMIN_NOTES_UI_POLISH  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC
```

Aufgaben:

```text
- RDAP67 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - UI-Polish sichtbar und nicht stoerend.
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
