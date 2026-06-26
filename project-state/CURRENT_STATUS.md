# CURRENT_STATUS

Stand: RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS  
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

## RDAP44 Live-Bestaetigung

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
selectedTargetUser vorhanden.
TARGET_USER_UID nicht mehr vorhanden.
```

## Separater offener Befund

```text
OAuth-Safety-Befund beim Deploy-Script:
twitch/start HTTP 302
twitch/callback HTTP 403
Erwartet war 403/403.
```

Wichtig:

```text
RDAP44 UI ist funktional live bestaetigt.
Der OAuth-Safety-Befund ist separat zu behandeln und nicht Teil der Admin-Notizen-UI.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
Permission-Vergabe in der UI
```

## Naechster empfohlener Step

```text
RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_OR_DECISION
```

Ziel:

```text
OAuth-Safety-Befund pruefen: Warum liefert /api/remote/auth/twitch/start HTTP 302 statt erwartetem HTTP 403?
```
