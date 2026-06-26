# CURRENT_STATUS

Stand: RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen ist live bestaetigt und dokumentiert.
RDAP48 Admin-User-Detail read-only wurde geplant.
RDAP49 Admin-User-Detail read-only ist live bestaetigt und dokumentiert.
RDAP50 Bruecke User-Detail -> Admin-Notizen wurde geplant.
RDAP51 Bruecke User-Detail -> Admin-Notizen ist live bestaetigt.
RDAP51B dokumentiert die RDAP51 Live-Bestaetigung.
RDAP52 Permission-Read-Detail-Polish wurde geplant.
RDAP53 Permission-Read-Detail-Polish ist vorbereitet, deployed und live sichtbar.
RDAP53B dokumentiert die RDAP53 Live-Bestaetigung.
```

## RDAP53 live bestaetigter Stand

```text
Admin-User-Detail zeigt zusaetzliche RDAP53-read-only Karten.
Effektive Rollen-Rechte sind sichtbar.
ForrestCGN / owner zeigt 8 Rollenrechte.
Modulbezogene Rechte sind sichtbar.
0 Targets ist plausibel, weil /api/remote/auth/model aktuell 0 modulePermissions liefert.
Keine Schreibbuttons fuer Rollen/Gruppen/Permissions/Sessions sichtbar.
```

## Live-System

```text
Webserver: mods.forrestcgn.de
Service: scc-remote-modboard.service
Live-Pfad: /opt/stream-control-center/remote-modboard
DB: MariaDB 11.8.6 / c3stream_control
DB-Client: /root/rdap29_mysql_client.cnf
Branch: dev
```

## Live-API-Befund RDAP53

```text
GET /api/remote/status:
ok=true
service=remote-modboard
moduleBuild=RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED

GET /api/remote/auth/model:
ok=true
readOnly=true
writeEnabled=false
rolePermissions=21
modulePermissions=0
```

## Auth-/Login aktueller Funktionsstand

```text
Twitch-Login ist aktiv/freigegeben.
Live-Env: RDAP_TWITCH_OAUTH_START_RELEASED=true.
GET /api/remote/auth/twitch/start liefert bei aktivem Login HTTP 302.
GET /api/remote/auth/twitch/callback liefert ohne gueltigen OAuth-State HTTP 403.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN
```
