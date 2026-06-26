# CURRENT_STATUS

Stand: RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED  
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
RDAP57 Permission-Read-Detail Categories-Polish ist vorbereitet.
```

## RDAP57 vorbereiteter Stand

```text
Admin-User-Detail bleibt read-only.
Effektive Rollen-Rechte werden nach Bereichen gruppiert.
Admin-/Write-nahe Rechte werden als Modellanzeige erklaert.
0-Targets-Erklaerung bleibt erhalten.
Diagnose bleibt erhalten.
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
RDAP57 lokal testen, stepdone, Webserver-Deploy, Live bestaetigen.
Danach RDAP57B_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_LIVE_CONFIRMED_DOCS.
```
