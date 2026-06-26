# CURRENT_STATUS

Stand: RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist live erfolgreich getestet.
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED ist live funktional bestaetigt.
RDAP45B Deploy-Safety wurde an aktiv genutzten Login angepasst.
RDAP45C dokumentiert die RDAP45B Live-Bestaetigung.
RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen ist live bestaetigt und dokumentiert.
RDAP48 Admin-User-Detail read-only wurde geplant.
RDAP49 Admin-User-Detail read-only ist live bestaetigt.
RDAP49B dokumentiert die RDAP49 Live-Bestaetigung.
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

Einordnung:

```text
Aktiver Login bedeutet Auth-/Session-Scope.
Das ist keine Freigabe fuer Remote-Writes, Agent-Actions, OBS, Sound, Overlay, Commands, Channelpoints oder freie Ausfuehrung.
```

## Admin-Notizen aktueller Funktionsstand

```text
Admin -> Admin-Notizen zeigt eine Zieluser-Auswahl.
Default ist ForrestCGN / tw:127709954.
Zieluser-Suche/Filter ist live bestaetigt.
Read/Create nutzen weiterhin den ausgewaehlten targetUserUid.
Create-Button "Neue Notiz" ist fuer write-berechtigte Admins sichtbar.
```

## Admin-User-Detail aktueller Funktionsstand

```text
Admin -> User-Detail ist live sichtbar.
Datenquelle ist GET /api/remote/auth/model.
ForrestCGN / tw:127709954 ist sichtbar und ausgewaehlt.
Rolle owner ist sichtbar.
Gruppen und Sessions werden read-only angezeigt.
Button Admin-Notizen oeffnen ist sichtbar.
Keine Schreibverwaltung ist sichtbar.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
Permission-Vergabe in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN
```
