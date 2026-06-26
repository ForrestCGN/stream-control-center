# RDAP71_ADMIN_NOTES_CLEAN_LAYOUT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Ziel

RDAP71 macht die Admin-Notes-Ansicht als Frontend-only Step weniger debug-lastig und naeher an eine echte Arbeitsoberflaeche.

## Ausgangslage

RDAP69 war technisch/live ok, aber fachlich noch nicht die Zielansicht:

```text
- Admin-Notes sichtbar.
- Navigation stabil.
- Delete/Deactivate nicht sichtbar.
- Compact-Layout sichtbar.
- Ansicht wirkt weiterhin zu technisch.
- "Neue Notiz" erscheint als Button und zusaetzlich als dauerhafter rechter Create-Bereich.
- Technische Karten wie Read/Write/Aktion/Grenzen sind zu dominant.
```

## Geaendert

```text
remote-modboard/backend/public/assets/remote-modboard.js
```

## Art der Aenderung

```text
Frontend-only Style-Schicht:
- neue idempotente Style-Injection rdap71AdminNotesCleanLayoutStyle
- alte RDAP69/RDAP67 Admin-Notes Style-Injections werden beim Laden entfernt, falls vorhanden
- keine Backend-Route
- keine DB-Migration
- keine neue Permission
- kein neuer Schreibbutton
```

## UI-Zielbild

```text
- Admin-Notes wirkt weniger wie eine Diagnose-Seite.
- Aktion/Neu laden/Neue Notiz wird zur schmaleren Arbeits-Toolbar.
- Read/Write/Grenzen bleiben sichtbar, aber deutlich weniger dominant.
- Create-Bereich ist nicht mehr dauerhaft als grosser rechter Kasten sichtbar.
- Create-Formular erscheint nur, wenn "Neue Notiz" geoeffnet ist.
- Sicherheit/Diagnose-Karte wird in dieser Arbeitsansicht ausgeblendet.
- Liste steht klarer im Fokus.
- Notizkarten bleiben kompakt und lesbar.
```

## Sicherheitsgrenzen

Unveraendert:

```text
- Create/Update bleiben an bestehende Berechtigung gekoppelt.
- confirmWrite:true bleibt unveraendert.
- Backend entscheidet weiter ueber Session, Permission, Audit, Lock und Readback.
- Bearbeiten bleibt nur fuer aktive Notizen mit Write-Recht sichtbar.
- Erfolg/Fehler bleiben sichtbar.
- Deactivate/Delete bleiben nicht sichtbar.
```

## Nicht geaendert

```text
- keine Backend-Funktion
- keine DB-Migration
- keine Permission-Aenderung
- keine Rollen-/Gruppen-/Permission-Writes
- keine Community-Read-Freigabe
- keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung
- kein Haupt-Router-Umbau
- keine parallele Zweitnavigation
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

## Nach stepdone

Da `remote-modboard/backend/public/assets/remote-modboard.js` geaendert wurde, braucht RDAP71 nach `stepdone.cmd` einen Webserver-Deploy aus GitHub/dev.
