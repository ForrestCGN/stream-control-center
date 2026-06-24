# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN

Typ: Doku/Planung  
Code: nein  
DB: nein  
Secrets: nein  
Webserver-Deploy: nicht erforderlich bei reinem Doku-Step

### Geändert

- Lokalen/LAN-Betrieb als Ziel aufgenommen.
- Festgelegt: Onlinebetrieb über `mods.forrestcgn.de` bleibt.
- Festgelegt: zusätzlicher lokaler Betrieb im Heimnetz soll möglich werden.
- Festgelegt: EngelCGN soll lokal im LAN mitarbeiten können.
- Festgelegt: lokaler Login soll ebenfalls über Twitch laufen.
- Sicherheitsgrenzen für lokalen Betrieb dokumentiert.
- Lokale DB-Optionen dokumentiert.
- Empfohlen: lokale MariaDB-Testdatenbank statt Live-DB.
- Projektstatus, Next Steps, TODO und FILES aktualisiert.

### Nicht geändert

- Keine Code-Dateien.
- Keine Frontend-Dateien.
- Keine Backend-Dateien.
- Keine DB-Migration.
- Keine Secrets.
- Keine User-/Rollen-/Gruppen-Writes.
- Keine Session-Widerrufe.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

Status: deployed und getestet.

Bestätigt:

- `/api/remote/admin/users/permission-diagnostic` aktiv.
- Ohne Session: `401 Unauthorized` korrekt.
- Mit ForrestCGN Browser-Session:
  - `ok:true`
  - `loggedIn:true`
  - `dashboardAccess:true`
  - `roles:["owner"]`
  - `isOwner:true`
  - `isAdmin:true`
  - `canReadAdminUsers:true`
  - `canWriteAdminUsers:false`

Offen:

- Build-/Header-Metadaten zeigen noch `RDAP_AUTH2_CENTRAL_LOGIN_READY`.
- Permission-Reason-Ausgaben können verständlicher werden.
