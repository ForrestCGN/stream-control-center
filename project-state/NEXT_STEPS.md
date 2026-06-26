# NEXT_STEPS

Stand: RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

## Ziel

```text
Admin-Notes Header/Router-State gezielt fixen, damit die sichtbare Admin-Notes-Seite nicht unter dem Haupttitel "User-Detail" laeuft.
Frontend-only, ohne Backend-Funktion, ohne neue Permission und ohne neue Schreibrechte.
```

## Ausgangslage

```text
RDAP74 ist live deployed.
Admin-Notes ist sichtbar.
Header-Aktionen stehen oben.
Die Ansicht ist optisch besser, aber es gibt fachliche UI-State-Befunde:
- Header kann "User-Detail" zeigen, obwohl Admin-Notes sichtbar ist.
- User-Kontext/Notizen-Anzahl muss im naechsten Folgeschritt sauber geprueft/fixiert werden.
```

## Gewuenschter Scope RDAP76

```text
- Wenn Admin-Notes sichtbar ist, muss Haupt-Header "Admin-Notizen" zeigen.
- Navigation/aktiver Zustand muss Admin-Notizen widerspiegeln.
- User-Detail darf nicht als Header stehen bleiben.
- Kein grosser Router-Umbau, nur gezielter State-Fix.
```

## Danach

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel RDAP77:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer den aktuell ausgewaehlten User.
- Anzahl bezieht sich auf den aktuell ausgewaehlten User.
- UI zeigt "Notizen fuer <DisplayName>" und "<n> Notizen geladen".
```

## Nicht aendern

```text
Keine DB-Migration.
Keine Backend-Route.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine parallele Zweitnavigation.
```

## Checks fuer RDAP76

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

RDAP76 braucht nach `stepdone.cmd` Webserver-Deploy, falls Frontend-Code unter `remote-modboard/` geaendert wird.
