# CURRENT_STATUS

Stand: RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist live erfolgreich getestet.
RDAP43 plant Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen.
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED ist live funktional bestaetigt.
RDAP45B Deploy-Safety wurde an aktiv genutzten Login angepasst.
RDAP45C dokumentiert die RDAP45B Live-Bestaetigung.
RDAP46 plant den naechsten kleinen Admin-Notizen-Komfort-Step.
RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen ist live bestaetigt.
RDAP47B dokumentiert die RDAP47 Live-Bestaetigung.
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
Ausgewaehlter User steuert die Read-Route per targetUserUid.
Create nutzt denselben ausgewaehlten targetUserUid.
Create-Button "Neue Notiz" ist fuer write-berechtigte Admins sichtbar.
RDAP47 ergaenzt ein Such-/Filterfeld fuer Zieluser.
```

## RDAP47 Live-Bestaetigung

```text
Suchfeld sichtbar.
Suche nach "Forrest" funktioniert.
Trefferanzeige: 1 / 2.
Dropdown bleibt nutzbar.
Button User neu laden sichtbar.
Button Suche leeren sichtbar.
Ausgewaehlter Zieluser: ForrestCGN / tw:127709954.
Read true.
Write true.
3 Admin-Notizen geladen.
Create-Form nutzt weiter Zieluser tw:127709954.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
Permission-Vergabe in der UI
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN
```

Ziel:

```text
Echte Admin-User-Detailseite read-only bewusst planen.
Nicht blind Update/Delete/Permission bauen.
```
