# NEXT_STEPS

Stand: RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC  
Datum: 2026-06-26

## Naechster Step

```text
RDAP71_ADMIN_NOTES_CLEAN_LAYOUT
```

## Ziel

```text
Admin-Notes von einer technischen Diagnose-Ansicht zu einer klareren Arbeitsoberflaeche umbauen.
Frontend-only, ohne Backend-Funktion, ohne neue Permission und ohne neue Schreibrechte.
```

## Ausgangslage

```text
RDAP69 ist live deployed.
Serverchecks sind ok.
Admin-Notes sind sichtbar.
Navigation ist stabil.
Delete/Deactivate sind nicht sichtbar.
Compact-Layout ist technisch ok, aber fachlich noch zu technisch.
```

## Gewuenschter Clean-Layout-Scope

```text
- Schmale Toolbar oben:
  Admin-Notizen fuer ForrestCGN | 4 geladen | Neu laden | Neue Notiz
- Technische Status-/Safety-Karten nicht mehr dominant.
- Create-Bereich nicht dauerhaft rechts gross anzeigen.
- Neue Notiz nur bei Bedarf sichtbar machen.
- Liste direkt unter Toolbar prominent anzeigen.
- Notizkarten kompakt und klar lesbar halten.
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
Kein Umbau des Haupt-Routers ohne zwingenden Befund.
```

## Checks fuer RDAP71

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

RDAP71 braucht nach `stepdone.cmd` Webserver-Deploy, falls Frontend-Code unter `remote-modboard/` geaendert wird.
