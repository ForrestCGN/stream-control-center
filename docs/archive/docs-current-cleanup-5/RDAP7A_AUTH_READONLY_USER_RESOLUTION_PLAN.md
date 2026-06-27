# RDAP7A Auth Read-only User Resolution Plan

Stand: RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN  
Datum: 2026-06-23

## Zweck

RDAP7A plant den naechsten sicheren Zwischenschritt fuer das Remote-Modboard nach der erfolgreichen RDAP6K-Produktivmigration und dem RDAP7 Login-/Session-Konzept.

Ziel ist **noch kein Login**, sondern ein read-only Status-/User-Resolution-Layer, der spaeter die Grundlage fuer Twitch-OAuth, Sessions und serverseitige Rechtepruefung bildet.

## Ausgangslage

Bestaetigt:

```text
Remote-Modboard live: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
moduleBuild live: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
DB_NAME: c3stream_control
DB_USER: c1stream_control
RDAP6K Schema/Seed produktiv erfolgreich
/api/remote/auth/model schema.ready: true
```

Bestaetigte Sicherheitswerte:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## RDAP7A Zielbild

Geplant wird ein read-only Auth-Status und spaeterer User-Resolution-Endpunkt.

Moegliche Endpunkte fuer die Umsetzung nach separatem Go:

```text
GET /api/remote/auth/status
GET /api/remote/auth/me
```

`/api/remote/auth/status` soll nur oeffentlich ungefaehrliche Konfigurations- und Sicherheitsflags zeigen:

```text
ok: true
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
loginRoutesEnabled: false
cookieWriteEnabled: false
twitchClientIdConfigured: true/false
twitchClientSecretConfigured: true/false
redirectUriConfigured: true/false
sessionSecretConfigured: true/false
```

`/api/remote/auth/me` soll im ersten read-only Zustand immer ohne Login antworten:

```text
ok: true
loggedIn: false
user: null
roles: []
groups: []
permissions: []
authEnabled: false
sessionCreationEnabled: false
```

## Wichtige Sicherheitsentscheidung

RDAP7A darf **keine** Session erstellen und **keinen** Cookie setzen.

Auch wenn spaeter Twitch-OAuth-ENV-Werte vorhanden sind, bleibt der effektive Zustand in RDAP7A:

```text
authEnabled: false
sessionCreationEnabled: false
loginRoutesEnabled: false
cookieWriteEnabled: false
```

## User-/Identity-Resolution spaeter

Die produktive Auth-DB enthaelt bereits Tabellen fuer:

```text
dashboard_users
dashboard_identities
dashboard_user_roles
dashboard_user_groups
dashboard_sessions
```

RDAP7A plant aber nur die sichere Leselogik. Schreiben von Usern/Identities/Sessions ist erst spaeter erlaubt.

Spaeterer Ablauf, nicht RDAP7A:

```text
Twitch OAuth Callback erhalten
Twitch-ID validieren
dashboard_identities suchen oder anlegen
User-Rollen/Gruppen laden
Session mit Hash speichern
HttpOnly/Secure/SameSite Cookie setzen
```

## Rechte-Grundregel

Rechte werden immer serverseitig entschieden.

```text
Frontend darf Rechte anzeigen, aber nie entscheiden.
VIP gibt keinen Dashboard-Basiszugang.
sound_profi bleibt Gruppe/Marker und keine Rolle.
Gruppen vergeben keine Rechte automatisch, wenn grants_permissions_by_itself=0.
Modulmatrix entscheidet spaeter ueber modulbezogene Rechte.
```

## Erlaubt im naechsten technischen Schritt

```text
neue read-only Route /api/remote/auth/status
optional neue read-only Route /api/remote/auth/me
keine geheimen Werte ausgeben
nur configured true/false anzeigen
package check erweitern
/routes Uebersicht erweitern
moduleBuild aktualisieren
Doku aktualisieren
```

## Nicht erlaubt

```text
kein Login aktivieren
keine Twitch-OAuth-Weiterleitung aktivieren
keinen OAuth-Callback produktiv verarbeiten
keine Session schreiben
keinen Cookie setzen
keine User/Identity schreiben
keine Rollen/Gruppen/Permissions schreiben
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets ins Repo, Frontend oder Chat
```

## Vorgeschlagener naechster Step

```text
RDAP7B_AUTH_STATUS_READONLY_ENDPOINTS
```

Scope fuer RDAP7B:

```text
Remote-Modboard Backend um read-only Auth-Status-/Me-Endpunkte erweitern.
Kein Login, keine Sessions, keine Cookies, keine Writes.
```
