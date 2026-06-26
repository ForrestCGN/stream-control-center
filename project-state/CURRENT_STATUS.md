# CURRENT_STATUS

Stand: RDAP55B_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_LIVE_CONFIRMED_DOCS  
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
RDAP54 Empty-Targets-Polish wurde geplant.
RDAP55 Empty-Targets-Polish ist vorbereitet, deployed und live sichtbar.
RDAP55B dokumentiert die RDAP55 Live-Bestaetigung.
```

## RDAP55 live bestaetigter Stand

```text
Admin-User-Detail funktioniert weiter.
ForrestCGN @forrestcgn / tw:127709954 ist auswaehlbar.
Effektive Rollen-Rechte bleiben sichtbar.
8 Rollenrechte werden angezeigt.
Modulbezogene Rechte bleibt sichtbar.
0 Targets wird jetzt klar erklaert.
Diagnose zeigt rolePermissions/modulePermissions-Zaehler.
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

## Live-Diagnose RDAP55

```text
rolePermissions gesamt: 21
effektive Rollenrechte: 8
modulePermissions gesamt: 0
passende Module-/Targets: 0
Quelle: /api/remote/auth/model
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
RDAP56_PERMISSION_DETAIL_NEXT_SCOPE_PLAN
```
