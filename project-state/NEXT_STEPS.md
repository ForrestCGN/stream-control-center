# NEXT_STEPS

Stand: RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP67_ADMIN_NOTES_UI_POLISH
```

## Ziel

```text
Admin-Notes UI-Polish ohne neue Backend-Funktion, ohne neue Permission und ohne neue Schreibrechte.
```

## Ausgangslage

```text
RDAP65B bestaetigt fachlich:
- Admin-Notizen Inhalt sichtbar.
- Create funktioniert.
- Update-Speichern funktioniert.
- User-Detail funktioniert.
- Navigation bleibt stabil.
- Delete/Deactivate nicht sichtbar.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional remote-modboard/backend/public/assets/remote-modboard.css
optional docs/current/* und project-state/*
```

## Gewuenschter Polish

```text
- Admin-Notes-Karten lesbarer machen.
- Metadaten kompakter darstellen.
- Create-/Update-Erfolgshinweise klarer platzieren.
- Bearbeiten-Zustand kompakter fuehren.
- Safety-Hinweise klarer, aber nicht aufdringlicher anzeigen.
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

## Checks fuer RDAP67

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js

git status --short
git diff --stat
```

RDAP67 braucht nach `stepdone.cmd` Webserver-Deploy, falls Frontend-Code unter `remote-modboard/` geaendert wird.
