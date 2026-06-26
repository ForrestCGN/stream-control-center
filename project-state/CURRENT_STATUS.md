# CURRENT_STATUS

Stand: RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP62B: Live-Befund dokumentiert.
RDAP63: Update-UI-Scope geplant.
RDAP64: Update-UI in rdap28-admin-notes.js implementiert, aber live nicht sichtbar.
RDAP64B: Router/Tab-Hotfix versucht, live nicht ausreichend.
RDAP64C: Existing-Nav-Bind-Hotfix versucht, live weiterhin leer.
RDAP64D: Admin-Notes ueber Haupt-Router sichtbar gemacht, live bestaetigt.
RDAP64E: Doku-/Status-Step nach RDAP64D auf GitHub/dev abgeschlossen.
RDAP65A: Bestaetigten Live-Stand und offene fachliche Browser-Pruefpunkte dokumentiert.
RDAP65B: Admin-Notes fachlich im Browser bestaetigt; Create, Update, User-Detail und Navigation funktionieren.
RDAP66: Naechsten sicheren Scope geplant; RDAP67 soll Admin-Notes UI-Polish werden.
RDAP67: Admin-Notes UI-Polish vorbereitet; Frontend-only, keine Backend-/DB-/Permission-Aenderung.
RDAP68: RDAP67 live fachlich bestaetigt; Layout weiter verbesserungswuerdig.
RDAP69: Admin-Notes Compact-Layout vorbereitet; Frontend-only, keine Backend-/DB-/Permission-Aenderung.
RDAP70: RDAP69 live technisch bestaetigt; Layout fachlich weiterhin zu technisch und noch nicht Zielansicht.
```

## Live-/Browser-Befund nach RDAP70

```text
RDAP69 ist live deployed.
/api/remote/status ok.
/api/remote/routes ok.
Public UI HTTP 200.
Admin -> Admin-Notizen sichtbar.
Navigation stabil.
Delete/Deactivate nicht sichtbar.
```

## Layout-Befund

```text
RDAP69 ist technisch ok, aber noch nicht die gewuenschte Arbeitsoberflaeche.

Auffaellig:
- "Neue Notiz" erscheint oben als Button und rechts als dauerhafter Create-Bereich.
- Der Create-Bereich ist weiterhin zu gross.
- Technische Karten wie Aktion/Grenzen/Read/Write sind fuer spaeteren Normalbetrieb zu dominant.
- Die eigentliche Notizen-Liste sollte staerker im Fokus stehen.
```

## Admin-Notes aktueller Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP71_ADMIN_NOTES_CLEAN_LAYOUT
```
