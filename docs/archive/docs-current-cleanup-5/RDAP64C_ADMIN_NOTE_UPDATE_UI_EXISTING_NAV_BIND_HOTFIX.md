# RDAP64C_ADMIN_NOTE_UPDATE_UI_EXISTING_NAV_BIND_HOTFIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP64C behebt den Live-Befund nach RDAP64/RDAP64B: Backend-Routen sind sauber aktiv, aber die Admin-Notizen-/User-Detail-Panels bleiben im Browser leer.

RDAP64C ist ein Frontend-Hotfix nur in der bestehenden Admin-Notes-UI-Datei.

## Ursache / Befund

Nach RDAP64B war weiterhin sichtbar:

```text
Admin -> Admin-Notizen zeigt nur leere Flaeche.
Admin -> User-Detail zeigt nur leere Flaeche.
STRG+F5 aendert nichts.
```

Der Backend-Status blieb korrekt:

```text
Admin-Note Update-Backend aktiv.
Deactivate/Delete weiterhin aus.
Community-Read weiterhin verboten.
```

Wahrscheinliche Ursache: Die statisch vorhandenen Navigationsbuttons existieren bereits. Die injizierte Datei hat bisher eigene Handler nur beim Erzeugen neuer Buttons gesetzt beziehungsweise bei vorhandenen Buttons zu frueh abgebrochen. Dadurch aendert der Haupt-Router Titel/Nav, aber das injizierte RDAP-Panel wird nicht sichtbar geschaltet.

## Geaenderte Datei

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Aenderungen

```text
- injectNavigation() bricht bei vorhandenen Buttons nicht mehr einfach ab.
- Vorhandene Buttons mit data-page="admin-notes" werden gebunden.
- Vorhandene Buttons mit data-page="admin-user-detail" werden gebunden.
- Neu erzeugte Fallback-Buttons werden ebenfalls gebunden.
- showAdminNotesPanelFromNavigation() setzt das injizierte Panel sichtbar und laedt Notizen.
- showAdminUserDetailPanelFromNavigation() setzt das injizierte User-Detail-Panel sichtbar.
- Delayed setRdap40Page-Aufrufe sichern gegen Haupt-Router-Nachlauf ab.
- setRdap40Page toggelt aktive Klasse fuer alle Elemente mit data-page, nicht nur .nav-link.
```

## Beibehaltener Scope

```text
Update-UI-Code aus RDAP64 bleibt erhalten.
UPDATE_ENDPOINT bleibt erhalten.
Bearbeiten fuer aktive Notizen bleibt vorbereitet.
confirmWrite:true fuer Update bleibt erhalten.
```

## Nicht geaendert

```text
Kein Backend-Code.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

## Deploy

Da Frontend-Code im deployten `remote-modboard/` geaendert wurde, braucht RDAP64C nach `stepdone.cmd` wieder Webserver-Deploy aus frischem GitHub/dev-Clone.

## Live-Check nach Deploy

```text
Admin -> Admin-Notizen muss Inhalt anzeigen.
Admin -> User-Detail muss Inhalt anzeigen.
Admin -> Benutzerverwaltung/Rollen/Sicherheit duerfen nicht kaputtgehen.
Aktive Admin-Notiz zeigt bei Schreibrecht Bearbeiten.
```
