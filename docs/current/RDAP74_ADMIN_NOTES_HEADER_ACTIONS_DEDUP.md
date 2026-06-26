# RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Ziel

```text
Admin-Notes Header/Toolbar weiter entdoppeln:
- oberer Seiten-Header bleibt der zentrale Titel "Admin-Notizen"
- Buttons "Notizen neu laden" und "Neue Notiz" wandern in diesen Header
- separate blaue Toolbar mit erneutem "Admin-Notizen" wird ausgeblendet
- Liste bleibt als fachlicher Bereich "Admin-Notizen fuer ForrestCGN"
```

## Geaendert

```text
remote-modboard/backend/public/assets/remote-modboard.js
```

## Umsetzung

```text
- Frontend-only.
- Neue idempotente Style-Injection rdap74AdminNotesHeaderActionsDedupStyle.
- Alte Admin-Notes Style-Injections RDAP73/RDAP72/RDAP71/RDAP69/RDAP67 werden beim Laden entfernt.
- Neue JS-Funktion initAdminNotesHeaderActionsDedup().
- Die bestehende admin-note-actions Button-Zeile wird in den oberen module-page-header verschoben.
- Die alte Action-Card bleibt im DOM, wird aber als verschoben markiert und nicht mehr sichtbar dargestellt.
- Bestehende Button-IDs und Eventhandler bleiben erhalten.
```

## Nicht geaendert

```text
- Keine Backend-Route.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Deactivate.
- Kein Delete.
- Keine Community-Read-Freigabe.
- Keine Rollen-/Gruppen-/Permission-Writes.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
- Kein Router-Umbau.
```

## Erwartete Browser-Pruefung

```text
Admin -> Admin-Notizen:
- Seite sichtbar.
- Navigation stabil.
- Oben nur ein zentraler Titel "Admin-Notizen".
- Buttons "Notizen neu laden" und "Neue Notiz" stehen im oberen Header rechts.
- Separate Toolbar "Admin-Notizen" ist nicht mehr sichtbar.
- Liste zeigt "Admin-Notizen fuer ForrestCGN".
- Hinweis bleibt kurz, z. B. "4 Notizen geladen".
- Neue Notiz funktioniert weiterhin.
- Bearbeiten/Speichern funktioniert weiterhin.
- Delete/Deactivate nicht sichtbar.
```
