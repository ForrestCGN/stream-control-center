# RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Ziel

RDAP53 bereitet eine bessere read-only Permission-Detail-Ansicht fuer den bestehenden Admin-User-Detail-Bereich vor.

## Umgesetzt

- Frontend-only Permission-Read-Detail-Polish vorbereitet.
- Bestehende Inject-Logik in `remote-modboard/backend/src/app.js` erweitert:
  - bestehendes `rdap28-admin-notes.js` bleibt erhalten.
  - neues read-only Zusatz-Asset `rdap53-permission-read-detail.js` wird einmalig in die Remote-Modboard-HTML eingebunden.
  - Export `injectRdap28AdminNotesUi` bleibt als Rueckwaertskompatibilitaet erhalten.
- Neues Asset `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` erstellt:
  - liest nur `GET /api/remote/auth/model`.
  - haengt sich an den bestehenden Admin-User-Detail-Bereich an.
  - zeigt fuer den ausgewaehlten User read-only:
    - Rollen-basierte Permissions aus `model.rolePermissions`,
    - modul-/targetbezogene Rechte aus `model.modulePermissions`,
    - Rollen-/Gruppen-Kontext,
    - klaren Hinweis, dass Frontend-Anzeige keine Sicherheitsentscheidung ist.

## Nicht geaendert

- Keine Backend-Write-Route.
- Keine neue API-Route.
- Keine DB-Migration.
- Keine Rollen-/Gruppen-/Permission-Schreibverwaltung.
- Keine Session-Revocation.
- Kein Admin-Note Update.
- Kein Admin-Note Deactivate.
- Kein physisches Delete.
- Keine Community-Read-Anbindung fuer Admin-Notizen.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.

## Datenquelle

```text
GET /api/remote/auth/model
```

Die vorhandene read-only Datenquelle liefert bereits `model.users`, `model.userRoles`, `model.userGroups`, `model.roles`, `model.groups`, `model.permissions`, `model.rolePermissions`, `model.modulePermissions` und `model.sessions`.

## Test

Lokal nach `installstep.cmd`:

```powershell
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\public\assets\rdap53-permission-read-detail.js
git status --short
```

Live/UI nach lokalem Testdeploy:

```text
Admin -> User-Detail oeffnen.
User auswaehlen.
Unterhalb der bestehenden Detailkarten muessen zusaetzliche read-only Karten fuer Permissions und Module/Targets sichtbar sein.
Keine Schreibbuttons sichtbar.
Admin-Notizen-Bridge muss weiterhin funktionieren.
```

## Deploy-Hinweis

RDAP53 aendert Backend-/Frontend-Dateien unter `remote-modboard/`. Nach lokalem Test und `stepdone.cmd` ist ein Webserver-Deploy aus frischem GitHub/dev-Clone noetig.
