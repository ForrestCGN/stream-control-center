# CURRENT_STATUS

Stand: RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN  
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
RDAP52 plant die Permission-/Rollen-Read-Detail-Politur.
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

## Auth-/Login aktueller Funktionsstand

```text
Twitch-Login ist aktiv/freigegeben.
Live-Env: RDAP_TWITCH_OAUTH_START_RELEASED=true.
GET /api/remote/auth/twitch/start liefert bei aktivem Login HTTP 302.
GET /api/remote/auth/twitch/callback liefert ohne gueltigen OAuth-State HTTP 403.
```

## RDAP51 live bestaetigter Stand

```text
Admin-Notizen zeigen beim Oeffnen aus dem User-Detail einen Kontext-Hinweis.
ForrestCGN @forrestcgn / tw:127709954 wird korrekt uebernommen.
Read/Create verwenden weiterhin exakt diesen Zieluser.
Ruecksprung zum User-Detail ist sichtbar.
Hinweis ausblenden ist sichtbar.
Die bestehende Admin-Notizen-Implementierung bleibt erhalten.
```

## RDAP52 geplanter Stand

```text
RDAP52 ist Plan-only / Doku-only.
Geplant ist eine bessere read-only Permission-Detail-Ansicht fuer Admin-User.
Bestehendes GET /api/remote/auth/model soll zuerst weiterverwendet werden.
Keine neue Backend-Route, solange vorhandene Daten reichen.
Keine Code-Aenderung.
Keine DB-Migration.
Kein Webserver-Deploy noetig.
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
RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED
```
