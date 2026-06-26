# CURRENT_STATUS

Stand: RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN  
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
RDAP56 Permission-Detail naechster Scope wurde geplant.
RDAP57 Permission-Read-Detail Categories-Polish ist vorbereitet, deployed und live sichtbar.
RDAP57B dokumentiert die RDAP57 Live-Bestaetigung.
RDAP58 schliesst/ bewertet den Permission-Read-Detail-Strang und plant den naechsten Bereich.
RDAP59 klaert den Admin-Notes Community-Read-Scope als Doku-only/Plan-only.
RDAP60 klaert Admin-Note Update/Deactivate-Scope als Doku-only/Plan-only.
```

## RDAP59 Entscheidung

```text
Admin-Notizen bleiben vorerst Admin-only.
Community-Read wird nicht gebaut.
Bestehende Admin-Readroute wird nicht fuer Community-/Profil-/Public-UI verwendet.
Falls spaeter noetig, dann nur separater, stark begrenzter read-only Scope mit eigener Planung, eigener Permission, Datenminimierung und ohne Public-Leak.
```

## RDAP60 Entscheidung

```text
Update und Deactivate werden nicht gemeinsam gebaut.
Zuerst soll nur Admin-Note Update als kleinster sinnvoller Write-Scope vorbereitet werden.
Deactivate bleibt danach ein separater Scope.
RDAP60 selbst ist Doku-only/Plan-only.
```

## Admin-Notes aktueller Strukturstand

```text
Bestehende Admin-Notes-Routen liegen in:
remote-modboard/backend/src/routes/admin-users.routes.js

Nicht vorhanden unter GitHub/dev beim RDAP59-Startcheck:
remote-modboard/backend/src/routes/admin-users-admin-notes.routes.js

Bestehende Admin-Readroute:
GET /api/remote/admin/users/admin-notes/read

Bestehende Create-Route:
POST /api/remote/admin/users/admin-notes/create

Weiterhin deaktiviert:
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

## Geplanter kleinster Update-Scope fuer spaeter

```text
targetUserUid
noteUid
noteText
confirmWrite: true
```

Serverseitig spaeter erlaubt:

```text
note_text = validierter noteText
updated_by_user_uid = actor.userUid
updated_at = now
```

Nur fuer:

```text
existierende aktive Notizen, die zu targetUserUid gehoeren.
```

Nicht erlaubt:

```text
Deactivate im selben Step
Delete
status aus Body
created_by/created_at Aenderung
target_user_uid Aenderung
note_uid Aenderung
inactive/deactivated Notizen editieren
Community-Read
Permission-/Rollen-/Gruppen-Writes
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

## Weiterhin deaktiviert

```text
Admin-Note Update ist noch nicht gebaut.
Admin-Note Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Community-Read fuer Admin-Notizen bleibt verboten.
Permission-Verwaltung in der UI bleibt aus.
Rollen-/Gruppen-Schreibverwaltung bleibt aus.
Session-Revocation in der UI bleibt aus.
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control bleibt aus.
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung bleibt verboten.
```

## Naechster empfohlener Step

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```

Nur nach erneutem Startcheck, Datei-Lesen, Plan und Forrests ausdruecklichem `go`.
