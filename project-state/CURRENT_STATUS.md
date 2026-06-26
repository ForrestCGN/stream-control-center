# CURRENT_STATUS

Stand: RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN  
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
RDAP46 plant den naechsten kleinen Admin-Notizen-/Admin-User-Schritt.
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
Login funktioniert.
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

## RDAP46 Ergebnis

```text
Naechster kleiner Schritt bewusst geplant.
Empfehlung: RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED.
RDAP47 soll die Zieluser-Auswahl komfortabler machen.
Empfohlener Scope: Frontend-only Such-/Filterfeld in rdap28-admin-notes.js.
Keine Code-Aenderung in RDAP46.
Keine DB-Migration.
Kein Webserver-Deploy noetig.
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
RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
```

Ziel:

```text
Admin-Notizen-Zieluser-Auswahl komfortabler machen: Such-/Filterfeld nach Name/Login/UID, ohne Backend-/DB-/Permission-Aenderung.
```
