# RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED

Stand: 2026-06-26  
Typ: Backend-Safety-Fix vorbereitet  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Anlass

Beim RDAP44-Webserver-Deploy wurde ein OAuth-Safety-Befund sichtbar:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
Erwartet war 403/403.
```

Der Befund ist kein Fehler der Admin-Notizen-UI. RDAP44 ist live funktional bestätigt.

## Ursache

`/api/remote/auth/twitch/start` liefert HTTP 302, wenn der Auth-Guard in `auth-twitch-oauth.service.js` erlaubt und dadurch ein Redirect zur Twitch-Authorize-URL erzeugt wird.

Der bisherige Guard erlaubte den Start, sobald Auth, Twitch-OAuth, Sessions, Session-Write und DB-Write effektiv aktiv waren.

Das Deploy-Script erwartet aktuell aber weiterhin hart:

```text
/api/remote/auth/twitch/start    -> 403
/api/remote/auth/twitch/callback -> 403
```

## Entscheidung RDAP45

Option A wurde gewählt:

```text
Twitch-OAuth-Start bleibt für den aktuellen Safety-Stand gesperrt.
Der Deploy-Safety-Check bleibt unverändert.
```

## Änderung

Geändert:

```text
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
```

Ergänzt wurde ein zusätzlicher expliziter Release-Gate:

```text
RDAP_TWITCH_OAUTH_START_RELEASED=true
```

Ohne dieses neue explizite Release-Gate liefert der Twitch-OAuth-Guard jetzt:

```text
reason: twitch_oauth_start_not_released
```

Damit bleibt `/api/remote/auth/twitch/start` auch dann 403, wenn ältere Auth-/OAuth-/Session-/DB-Gates in der Umgebung bereits aktiv sind.

## Nicht geändert

```text
Keine Admin-Notizen-UI-Aenderung.
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein Delete.
Keine Permission-Verwaltung.
Keine DB-Migration.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine neuen produktiven Admin-Writes.
Kein Deploy-Script-Umbau.
```

## Erwartete Tests

Lokal nach installstep:

```powershell
node --check .\remote-modboard\backend\src\services\auth-twitch-oauth.service.js
```

Nach Webserver-Deploy:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
curl -s -o /dev/null -w "%{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

Erwartet:

```text
403
403
```

Außerdem muss das Standard-Deploy-Script wieder ohne OAuth-Safety-Fehler durchlaufen.

## Folgeschritt

Nach erfolgreichem Webserver-Deploy und Live-Test sollte ein Doku-only-Step erstellt werden:

```text
RDAP45B_REMOTE_AUTH_TWITCH_START_SAFETY_LIVE_CONFIRMED_DOCS
```
