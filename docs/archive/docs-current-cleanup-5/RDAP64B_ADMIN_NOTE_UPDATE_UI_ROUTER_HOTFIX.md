# RDAP64B_ADMIN_NOTE_UPDATE_UI_ROUTER_HOTFIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP64B ist ein Frontend-Hotfix fuer den Live-Befund nach RDAP64: Backend-Routen waren sauber, aber die Admin-Seiten renderten im Browser leer.

## Ursache / Annahme

RDAP64 hatte die Navigations-/Tab-Semantik der bestehenden Admin-Notizen-Seite von `read/create` auf `read/create/update` geaendert. Das war nicht noetig und kann mit der bestehenden Dashboard-Router-/Tab-Logik kollidieren.

RDAP63 hatte festgelegt: bestehende UI erweitern, keine neue Seite, keine neue Route, kein paralleles UI-Modul. Deshalb wird die bestehende Tab-Semantik wiederhergestellt.

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aenderungen:

```text
- Admin-Notizen data-tab wieder read/create.
- setRdap40Page fuer Admin-Notizen wieder tab read/create.
- openNotesForUser nutzt wieder tab read/create.
- restoreInjectedAdminPanelVisibility() ergaenzt.
```

## Nicht geaendert

```text
Update-Endpoint bleibt in der UI vorhanden.
Bearbeiten/Inline-Edit bleibt vorhanden.
Update mit confirmWrite:true bleibt vorhanden.
Reload nach Erfolg bleibt vorhanden.
```

## Ausdruecklich nicht Teil von RDAP64B

```text
Kein Backend-Code.
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

## Checks

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

Nach `stepdone.cmd` ist ein Webserver-Deploy noetig, weil Frontend-Code in `remote-modboard/` geaendert wurde.
