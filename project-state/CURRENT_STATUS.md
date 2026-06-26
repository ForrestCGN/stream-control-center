# CURRENT_STATUS

Stand: RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED  
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
RDAP45 OAuth-Start-Safety-Fix wurde vorbereitet, hat aber gezeigt: Login wird live bereits produktiv genutzt.
RDAP45B korrigiert die Deploy-Safety-Semantik fuer aktiven Login.
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

## RDAP45/RDAP45B Auth-Befund

```text
RDAP45 hatte Twitch-Start wieder hart Richtung 403 abgesichert.
Live zeigte direkt danach: Der Login-Button braucht den Twitch-Start und nutzt ihn bereits produktiv.
Auf dem Server wurde RDAP_TWITCH_OAUTH_START_RELEASED=true gesetzt, damit Login wieder funktioniert.
Danach live gemessen:
twitch/start HTTP 302
twitch/callback HTTP 403
```

Einordnung:

```text
twitch/start HTTP 302 ist korrekt, wenn Login bewusst aktiv/freigegeben ist.
twitch/callback HTTP 403 ohne gueltigen OAuth-State bleibt korrekt.
OAuth/Login-Session-Scope ist nicht gleich Remote-Writes.
Remote-Writes/Agent/OBS/Sound/Overlay/Commands bleiben weiterhin gesperrt.
```

## RDAP45B vorbereiteter Fix

```text
tools/remote-modboard-deploy.sh erwartet nicht mehr hart 403/403.
Erlaubt fuer twitch/start:
- 302 bei bewusst aktivem Login/OAuth-Start
- 403 bei gesperrtem Login/OAuth-Start
Callback ohne State muss weiterhin 403 bleiben.
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
RDAP45B Webserver-Deploy und Live-Bestaetigung
```

Ziel:

```text
Deploy-Script soll bei aktivem Login mit twitch/start HTTP 302 nicht mehr fehlschlagen.
Callback ohne gueltigen OAuth-State muss HTTP 403 bleiben.
Dashboard-Login muss weiter funktionieren.
RDAP44 Admin-Notizen-Zieluser-Auswahl muss unveraendert sichtbar bleiben.
```
