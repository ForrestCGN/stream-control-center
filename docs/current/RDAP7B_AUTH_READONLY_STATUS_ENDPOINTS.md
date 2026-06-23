# RDAP7B Auth Read-only Status Endpoints

Stand: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS  
Datum: 2026-06-23

## Ziel

RDAP7B fuegt dem Remote-Modboard zwei read-only Auth-Status-Endpunkte hinzu:

```text
GET /api/remote/auth/me
GET /api/remote/auth/session-status
```

Diese Endpunkte dienen nur als sichere Grundlage fuer spaetere Login-/Session-Schritte.

## Sicherheitsgrenzen

RDAP7B aktiviert ausdruecklich nicht:

```text
kein Twitch-Login
keine OAuth-Callback-Aktivierung
keine Session-Erstellung
keine Cookies setzen
keine DB-Writes
keine User-/Rollen-/Gruppen-Schreibroute
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine freie Shell-/Datei-/Prozesssteuerung
```

Bestaetigte Flags bleiben:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
```

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/services/auth-status.service.js
```

## Neue Route: /api/remote/auth/me

Erwarteter Grundzustand:

```json
{
  "ok": true,
  "module": "remote_auth_status",
  "statusApiVersion": "rdap7b.v1",
  "readOnly": true,
  "writeEnabled": false,
  "authEnabled": false,
  "sessionCreationEnabled": false,
  "loggedIn": false,
  "user": null,
  "identity": null,
  "roles": [],
  "groups": [],
  "permissions": []
}
```

## Neue Route: /api/remote/auth/session-status

Erwarteter Grundzustand:

```json
{
  "ok": true,
  "module": "remote_auth_status",
  "statusApiVersion": "rdap7b.v1",
  "readOnly": true,
  "writeEnabled": false,
  "authEnabled": false,
  "sessionCreationEnabled": false,
  "session": {
    "lookupEnabled": false,
    "lookupPerformed": false,
    "exists": false,
    "valid": false,
    "reason": "session_creation_disabled"
  }
}
```

## Technische Notiz

Der Service erkennt optional, ob im Request ein bekannter Session-Cookie-Name vorhanden ist. Er setzt keinen Cookie und fuehrt keinen DB-Lookup aus. Das ist bewusst so, damit RDAP7B nur Statusgrundlage und kein produktiver Login ist.

## Test lokal/Webserver

Nach Installation:

```bash
cd /opt/stream-control-center/remote-modboard/backend
npm run check
systemctl restart scc-remote-modboard.service
curl -sS https://mods.forrestcgn.de/api/remote/routes | python3 -m json.tool
curl -sS https://mods.forrestcgn.de/api/remote/auth/me | python3 -m json.tool
curl -sS https://mods.forrestcgn.de/api/remote/auth/session-status | python3 -m json.tool
```

## Naechster sinnvoller Schritt

```text
RDAP7C_AUTH_STATUS_DEPLOY_TEST_DOCS
```

Ziel: RDAP7B auf dem Webserver deployen, read-only Endpunkte testen und Ergebnis dokumentieren.
