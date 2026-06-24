# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller RDAP-Status

Remote-Modboard läuft produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller bestätigter Stand:

```text
RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
```

## Bestätigt

- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN wird als `owner` erkannt.
- ForrestCGN ist `isOwner:true` und `isAdmin:true`.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose ist aktiv und read-only.
- RDAP6 Write-Foundation-Diagnose ist aktiv und read-only.
- RDAP7 Confirm-Write-Helper ist vorbereitet, aber produktive Writes bleiben deaktiviert.
- RDAP7B Confirm-Write-Metadaten sind remote bestätigt.
- Build/Header:
  - `moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP`
  - `statusApiVersion: rdap_admin_users7b.v1`
- Confirm-Metadaten bestätigt:
  - `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
  - `auth.permissions.confirmWriteHelperPrepared:true`
  - `auth.permissions.adminUsersConfirmWriteHelperPrepared:true`
  - `confirmWriteDiagnostic.helperPrepared:true`
- Sicherheitsstatus bestätigt:
  - `writeEnabled:false`
  - `writesStillBlocked:true`
- Profilpanel oben rechts ist Self-Service:
  - `Profil aktualisieren`
  - `Ausloggen`
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.

## Hinweis zu RDAP7B Diagnose

Der Testwert:

```text
.confirmWriteHelper.helperPrepared = null
```

ist kein Funktionsfehler. Das reale Objekt heißt aktuell:

```text
.confirmWriteDiagnostic.helperPrepared = true
```

## Weiterhin nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Lokaler/LAN-Betrieb

Forrest möchte:

```text
Online über mods.forrestcgn.de arbeiten.
Zusätzlich lokal im Heimnetz arbeiten können.
EngelCGN soll lokal im LAN ebenfalls arbeiten können.
Lokaler Login soll ebenfalls über Twitch laufen.
```

Geparkt, bis Web-Dashboard stabiler ist:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

## Workflow-Regel

Korrekte Reihenfolge:

```text
GitHub/dev + Docs prüfen
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
