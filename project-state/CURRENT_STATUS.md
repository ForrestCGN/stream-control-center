# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller RDAP-Status

Remote-Modboard laeuft produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller relevanter Stand:

```text
RDAP_META1_BUILD_HEADER_CLEANUP: deployed und getestet
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC: deployed und getestet
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION: read-only Foundation vorbereitet
RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED: ZIP-Step vorbereitet
RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN: geplant/dokumentiert
```

## Bestaetigt

- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprueft.
- ForrestCGN wird als `owner` erkannt.
- ForrestCGN ist `isOwner:true` und `isAdmin:true`.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose ist aktiv:
  - Route: `/api/remote/admin/users/permission-diagnostic`
  - ohne Session: `401` korrekt
  - mit ForrestCGN Session: `ok:true`, `loggedIn:true`, `canReadAdminUsers:true`
  - `canWriteAdminUsers:false`
  - keine produktiven Writes
- Build/Header-Cleanup war remote bestaetigt:
  - `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
  - `statusApiVersion: rdap_meta1.v1`
- Profilpanel oben rechts ist Self-Service:
  - `Profil aktualisieren`
  - `Ausloggen`
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.

## RDAP6

RDAP6 bereitet Confirm/Audit/Locking fuer spaetere Admin-User-Writes vor.

Route:

```text
GET /api/remote/admin/users/write-foundation-diagnostic
```

Diese Route ist read-only und zeigt nur geplante Regeln/Felder/Aktionen.

## RDAP7

RDAP7 bereitet einen Confirm-Write-Helper vor.

Neue Datei:

```text
remote-modboard/backend/src/services/admin-confirm-write.service.js
```

Wichtig:

```text
confirmWrite pruefen: ja
produktive Writes: nein
DB-Migration: nein
UI-Schreibbuttons: nein
Audit-/Locking-Writes: nein
```

Nach Deploy soll sichtbar sein:

```text
moduleBuild: RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
statusApiVersion: rdap_admin_users7.v1
confirmWriteHelperPrepared: true
confirmWriteHelperExecutesWrites: false
writesStillBlocked: true
```

## Lokaler/LAN-Betrieb

Forrest moechte:

```text
Online ueber mods.forrestcgn.de arbeiten.
Zusaetzlich lokal im Heimnetz arbeiten koennen.
EngelCGN soll lokal im LAN ebenfalls arbeiten koennen.
Lokaler Login soll ebenfalls ueber Twitch laufen.
```

Geparkt, bis Web-Dashboard stabiler ist:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

## Workflow-Regel

Korrekte Reihenfolge:

```text
GitHub/dev + Docs pruefen
Plan nennen
auf go warten
ZIP bauen
installstep lokal
lokale Checks/Syntax/git status
stepdone lokal
erst danach Webserver-Deploy aus frischem GitHub/dev-Clone
Service restart
Readiness
Server-/Browser-Test
```

`stepdone.cmd` bedeutet nicht, dass der Webserver aktualisiert wurde.
