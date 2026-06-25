# CURRENT_STATUS

Stand: RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist live erfolgreich getestet.
RDAP42B dokumentiert den RDAP42 Live-Stand.
RDAP43 plant Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen.
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
Admin -> Admin-Notizen zeigt aktuell Notizen fuer Zieluser tw:127709954.
Create-Button "Neue Notiz" ist fuer write-berechtigte Admins sichtbar.
Create nutzt bestehende RDAP39 Backend-Route.
Nach erfolgreichem Create laedt die UI die Notizliste ueber RDAP39C-Readback neu.
RDAP42 hat die Status-Semantik nach RDAP40 bereinigt.
```

## RDAP43 Ergebnis

```text
Bestandsaufnahme/Plan fuer Zieluser-Auswahl erstellt.
Keine Code-Aenderung.
Keine DB-Migration.
Kein Webserver-Deploy noetig.
```

## Gepruefte Dateien fuer RDAP43

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
```

## Wichtiger Ist-Befund

```text
rdap28-admin-notes.js nutzt aktuell fest TARGET_USER_UID = tw:127709954.
index.html enthaelt Admin -> Benutzerverwaltung.
Die vorhandene Admin-/User-Struktur soll bevorzugt erweitert werden, statt eine Parallelstruktur zu bauen.
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
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED
```

Ziel: Admin-Notizen von fixem Zieluser `tw:127709954` loesen und Zieluser-Auswahl bzw. Admin-User-Detail-Notizen als kleinen sichtbaren UI-Step vorbereiten.
