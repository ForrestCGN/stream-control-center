# CURRENT_STATUS

Stand: RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP62B: Live-Befund dokumentiert.
RDAP64D: Admin-Notes ueber Haupt-Router sichtbar gemacht, live bestaetigt.
RDAP65B: Admin-Notes fachlich im Browser bestaetigt; Create, Update, User-Detail und Navigation funktionieren.
RDAP67: Admin-Notes UI-Polish vorbereitet; Frontend-only.
RDAP68: RDAP67 live fachlich bestaetigt; Layout weiter verbesserungswuerdig.
RDAP69: Admin-Notes Compact-Layout vorbereitet; Frontend-only.
RDAP70: RDAP69 live technisch bestaetigt; Layout fachlich weiterhin zu technisch.
RDAP71: Admin-Notes Clean-Layout vorbereitet; Frontend-only.
RDAP72: technische Statusbloecke in Normalansicht ausgeblendet; Frontend-only.
RDAP73: Admin-Notes-Liste menschlicher lesbar gemacht; Frontend-only.
RDAP74: Header/Toolbar-Doppelstand bereinigt; Frontend-only.
RDAP75: Admin-Notes Design-Contract und Live-Findings dokumentiert; Doku-only.
```

## RDAP75 Befund

```text
Weitere kleine CSS-/Optik-Patches sollen gestoppt werden, bis Header/Router-State und User-Kontext sauber sind.

Live-Findings:
- Notizen-Anzahl muss sich eindeutig auf den aktuell ausgewaehlten User beziehen.
- Zieluser-Wechsel muss wirklich die Notizen dieses Users zeigen/laden.
- User-Detail als Haupt-Header bei sichtbarer Admin-Notes-Seite ist falsch.
```

## Verbindlicher Admin-Notes Zielaufbau

```text
1. Seitenheader:
   Admin-Notizen | Notizen neu laden | Neue Notiz

2. Zieluser-Auswahl:
   ausgewaehlter User ist Kontext fuer alles darunter.

3. Liste:
   Notizen fuer <DisplayName>
   <n> Notizen geladen

4. Create:
   nur sichtbar nach Klick auf Neue Notiz.

5. Diagnose/Technik:
   nicht prominent in Hauptansicht, spaeter hoechstens einklappbar.
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
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```
