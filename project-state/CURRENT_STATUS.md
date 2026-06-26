# CURRENT_STATUS

Stand: RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist live erfolgreich getestet.
RDAP42B dokumentiert den RDAP42 Live-Stand.
RDAP43 plant Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen.
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED ist live funktional bestaetigt.
RDAP44B dokumentiert die RDAP44 Live-Bestaetigung.
RDAP45 OAuth-Start-Gate wurde vorbereitet.
RDAP45B Deploy-Safety wurde an aktiv genutzten Login angepasst.
RDAP45C dokumentiert die RDAP45B Live-Bestaetigung.
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
Login funktioniert wieder.
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
Create nutzt bestehende RDAP39 Backend-Route.
Nach erfolgreichem Create laedt die UI die Notizliste ueber RDAP39C-Readback neu.
```

## RDAP44 Live-Bestaetigung bleibt gueltig

```text
Zieluser-Auswahl sichtbar.
Dropdown sichtbar.
Default ForrestCGN @forrestcgn / tw:127709954.
Name/Login/UID werden angezeigt.
Read: true.
Write: true.
Notizen: 3.
Tabelle: true.
Create-Form zeigt Zieluser: tw:127709954.
```

Asset-Pruefung live:

```text
DEFAULT_TARGET_USER vorhanden.
adminNotesTargetSelect vorhanden.
TARGET_USER_UID nicht mehr vorhanden.
```

## RDAP45B Live-Bestaetigung

```text
twitch/start HTTP 302
twitch/callback HTTP 403
Login ok
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
RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN
```

Ziel:

```text
Naechsten kleinen Admin-Notizen-/Admin-User-Schritt bewusst planen.
Nicht blind Update/Delete/Permission bauen.
```
