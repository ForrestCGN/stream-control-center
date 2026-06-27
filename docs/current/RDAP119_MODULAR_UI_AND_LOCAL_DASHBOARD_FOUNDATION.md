# RDAP119 - Modular UI and Local Dashboard Foundation

Stand: 2026-06-27
Step: `RDAP119_MODULAR_UI_AND_LOCAL_DASHBOARD_FOUNDATION`

## Ziel

Die Remote-Modboard-Webseite wird von einer grossen statischen HTML-Seite in eine modulare Shell umgebaut.

Sprechende Modulnamen bleiben Pflicht. Sichtbare Modul-/Dateinamen orientieren sich an Fachbereichen, z. B.:

- `system/overview.js`
- `system/diagnostics.js`
- `admin/users.js`
- `admin/notes.js`
- `admin/connections.js`
- `admin/details.js`
- `modules/catalog.js`

Keine kryptischen RDAP-Stepnamen als sichtbare Modulnamen.

## Inhalt dieses Steps

- `index.html` wird zur Shell reduziert.
- Seiteninhalte werden nicht mehr dauerhaft als grosse HTML-Bloecke in `index.html` gehalten.
- `remote-modboard.js` erhaelt einen Page-/Script-Loader.
- Read-only-Seiten werden als Module nachgeladen:
  - System / Uebersicht
  - System / Diagnose
  - Admin / Benutzerverwaltung
  - Admin / Verbindungen
  - Admin / Doku / Details
  - Module / Module
  - interne Account-Seiten fuer Profil/Rechte
- Bestehende Module/Registry bleiben erhalten und werden erweitert statt ersetzt.
- Admin-Notizen bleiben fachlich getrennt und werden nur beim Aufruf geladen.
- Local-Dashboard-Grundlage wird vorbereitet:
  - `REMOTE_MODBOARD_MODE=online|local`
  - `REMOTE_MODBOARD_HOST` bleibt konfigurierbar
  - `REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS` ist als Sicherheits-/Betriebsgrenze vorbereitet

## Sicherheitsgrenzen

Dieser Step aktiviert keine neuen produktiven Aktionen.

Nicht enthalten:

- keine DB-Migration
- keine neuen DB-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-/Overlay-/Command-Steuerung
- keine Shell-/Datei-/Prozessaktionen
- keine Rechteverwaltung in der UI

Admin-Note Create/Update bleiben nur im bereits vorhandenen gesicherten Backend-Scope und werden nicht erweitert.

## Lokaler Betrieb

Der lokale Betrieb wird als Grundlage vorbereitet, nicht vollstaendig als altes Dashboard ersetzt.

Online-Standard bleibt:

```text
REMOTE_MODBOARD_MODE=online
REMOTE_MODBOARD_HOST=127.0.0.1
REMOTE_MODBOARD_PORT=3010
```

Fuer einen spaeteren LAN-Betrieb kann vorbereitet werden:

```text
REMOTE_MODBOARD_MODE=local
REMOTE_MODBOARD_HOST=0.0.0.0
REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS=127.0.0.1/32,192.168.0.0/16
```

Das oeffnet nur die Weboberflaeche im LAN. Produktive Aktionen bleiben weiter an Backend-Scope, Permission, Confirm-Write, Audit, Lock und Readback gebunden.

## Tests

Lokal:

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\modules\system\overview.js
node --check .\remote-modboard\backend\public\assets\modules\system\diagnostics.js
node --check .\remote-modboard\backend\public\assets\modules\admin\users.js
node --check .\remote-modboard\backend\public\assets\modules\admin\notes.js
node --check .\remote-modboard\backend\public\assets\modules\admin\connections.js
node --check .\remote-modboard\backend\public\assets\modules\admin\details.js
node --check .\remote-modboard\backend\public\assets\modules\admin\access.js
node --check .\remote-modboard\backend\public\assets\modules\modules\catalog.js
node --check .\remote-modboard\backend\public\assets\modules\account\status.js
node --check .\remote-modboard\backend\public\assets\modules\account\permissions.js
```

Nach Webserver-Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.config.runtimeMode,.localLanMode'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion'
```

Browser:

- `https://mods.forrestcgn.de/` oeffnen
- Login pruefen
- System / Uebersicht pruefen
- System / Diagnose pruefen
- Admin / Benutzerverwaltung pruefen
- Admin / Admin-Notizen pruefen
- Admin / Verbindungen pruefen
- Admin / Doku / Details pruefen
- Console auf Script-Fehler pruefen
