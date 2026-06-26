# TODO

Stand: RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP71_ADMIN_NOTES_CLEAN_LAYOUT
```

Aufgaben:

```text
- Startdateien lesen.
- Plan fuer RDAP71 nennen.
- Auf go warten.
- Frontend-only Clean-Layout vorbereiten.
- Keine Backend-/DB-/Permission-Aenderung.
- Keine Delete-/Deactivate-Funktion.
- Lokale Checks:
  - node --check remote-modboard.js
  - node --check rdap28-admin-notes.js
  - git status --short
  - git diff --stat
- Nach stepdone.cmd Webserver-Deploy, falls remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - Toolbar klar.
  - Create nur bei Bedarf/durch Neue Notiz sichtbar.
  - Liste prominent.
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
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
