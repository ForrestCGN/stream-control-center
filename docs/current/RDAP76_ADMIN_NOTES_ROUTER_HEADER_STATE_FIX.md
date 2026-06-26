# RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only / Router-State-Fix

## Ziel

RDAP76 behebt den Browser-Befund, dass die sichtbare Admin-Notizen-Seite noch unter dem Haupt-Header `User-Detail` laufen konnte.

Zielzustand:

```text
- Wenn Admin-Notizen sichtbar sind, zeigt der Haupt-Header Admin-Notizen.
- Die aktive Navigation steht auf Admin-Notizen.
- User-Detail wirkt nur aktiv, wenn wirklich das User-Detail-Panel sichtbar ist.
- Es gibt keinen parallelen zweiten Router.
```

## Ursache

`remote-modboard.js` enthaelt den Haupt-Router (`window.RdapMainRouter.setPage`).

`rdap28-admin-notes.js` hatte zusaetzlich eine lokale Page-State-Funktion, die Panels, Navigation und Titel direkt gesetzt hat. Dadurch konnten sichtbares Panel, Haupt-Header und aktive Navigation auseinanderlaufen.

## Umsetzung

In `remote-modboard/backend/public/assets/rdap28-admin-notes.js` wurde `setRdap40Page(...)` angepasst:

```text
- Page-Meta wird normalisiert: Admin-Notizen / User-Detail.
- Wenn vorhanden, wird bevorzugt `window.RdapMainRouter.setPage(page, meta)` genutzt.
- Danach werden injizierte Admin-Notes/User-Detail-Panels synchronisiert.
- Navigation bekommt sowohl `active` als auch `is-active` korrekt gesetzt.
- Der alte direkte Header-Fallback bleibt nur fuer den Fall, dass der Haupt-Router nicht verfuegbar ist.
```

## Bewusst nicht geaendert

```text
Kein Backend.
Keine DB-Migration.
Keine neue Route.
Keine neue Permission.
Kein Delete.
Kein Deactivate.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine neue Navigation.
Keine neuen Schreibbuttons.
```

## Tests

Lokal:

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

Browser nach Deploy:

```text
1. https://mods.forrestcgn.de/ oeffnen.
2. Admin -> Admin-Notizen anklicken.
3. Haupt-Header muss Admin-Notizen anzeigen.
4. Navigation muss Admin-Notizen aktiv zeigen.
5. User-Detail darf nicht aktiv wirken.
6. Admin -> User-Detail anklicken.
7. Haupt-Header muss User-Detail anzeigen.
8. Zurueck zu Admin-Notizen: Header/Nav/Panel muessen wieder Admin-Notizen zeigen.
```

## Folge-Step

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel RDAP77:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```
