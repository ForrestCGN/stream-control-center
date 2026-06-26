# NEXT_STEPS

Stand: RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC  
Datum: 2026-06-26

## Naechster Step

```text
RDAP69_ADMIN_NOTES_COMPACT_LAYOUT
```

## Ziel

```text
Admin-Notes Layout kompakter und uebersichtlicher machen, ohne Backend-Funktion, ohne neue Permission und ohne neue Schreibrechte.
```

## Ausgangslage

```text
RDAP67 ist live deployed.
Serverchecks sind ok.
Browserpruefung ist fachlich ok.
Bearbeiten und Speichern funktionieren.
Navigation ist stabil.
Delete/Deactivate sind nicht sichtbar.
```

## Gewuenschter Compact-Layout-Scope

```text
- Statuskarten kompakter darstellen.
- Aktion/Create weniger dominant platzieren.
- Liste hoeher und zentraler anzeigen.
- Notizkarten kompakter und klarer strukturieren.
- Safety-Hinweise sichtbar, aber weniger platzintensiv.
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

## Checks fuer RDAP69

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

RDAP69 braucht nach `stepdone.cmd` Webserver-Deploy, falls Frontend-Code unter `remote-modboard/` geaendert wird.
