# RDAP_META1_BUILD_HEADER_CLEANUP

Datum: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard  
Public URL: `https://mods.forrestcgn.de/`

## Ziel

Dieser Step bereinigt die verwirrenden Build-/Header-Metadaten im Remote-Modboard.

Vorher meldeten `/api/remote/status`, `/api/remote/routes` und Diagnose-Endpunkte teilweise noch:

```text
RDAP_AUTH2_CENTRAL_LOGIN_READY
```

obwohl neuere RDAP-Steps wie RDAP5 bereits aktiv waren.

## Geändert

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/package.json
```

## Technische Änderung

- `MODULE_BUILD` steht jetzt auf `RDAP_META1_BUILD_HEADER_CLEANUP`.
- `X-Remote-Modboard-Build` nutzt weiter zentral `moduleBuild`, bekommt dadurch aber den aktuellen Step-Namen.
- `/api/remote/status` nutzt `statusApiVersion: rdap_meta1.v1`.
- `/api/remote/routes` nutzt `statusApiVersion: rdap_meta1.v1`.
- `app.js` registriert die RDAP5 Admin-User-Permission-Diagnoseroute ausdrücklich.
- `package.json` nimmt die RDAP5 Admin-User-Dateien in `npm run check` auf.

## Nicht geändert

```text
keine DB-Migration
keine DB-Writes
keine User-/Rollen-/Gruppen-Writes
keine Session-Widerrufe
keine UI-Großänderung
keine Secrets
keine Agent-/OBS-/Sound-/Overlay-/Command-Actions
```

## RDAP5 bleibt gültig

Die Route bleibt read-only:

```text
GET /api/remote/admin/users/permission-diagnostic
```

Erwartung:

- ohne Browser-Session: `401 Unauthorized` ist korrekt.
- mit ForrestCGN-Session: `ok:true`, `loggedIn:true`, `roles:["owner"]`, `canReadAdminUsers:true`, `canWriteAdminUsers:false`.

## Local/LAN-Twitch-Login

Forrest möchte später zusätzlich lokal im Heimnetz arbeiten können. EngelCGN soll lokal im LAN ebenfalls arbeiten können. Der lokale Login soll ebenfalls über Twitch laufen.

Dieser Punkt ist als TODO geparkt und wird erst weitergeführt, wenn das Web-Dashboard online stabil genug ist.

Geparkter Folge-Step:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

## Lokale Checks nach installstep

Auf Windows lokal nur Syntax/Status prüfen, nicht Port `3010` erwarten:

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\services\admin-user-permission-read.service.js
node -e "JSON.parse(require('fs').readFileSync('.\\remote-modboard\\backend\\package.json','utf8')); console.log('package.json ok')"

git status
```

## Webserver-Test erst nach stepdone + Deploy

Nach `stepdone.cmd` wird der Webserver aus frischem GitHub/dev-Clone deployed. Danach:

```bash
systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done

curl -i http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes | grep -i "permission-diagnostic"
```

Erwartung:

```text
X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP
statusApiVersion: rdap_meta1.v1
permission-diagnostic Route sichtbar
```
