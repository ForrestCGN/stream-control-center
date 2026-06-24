# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller RDAP-Status

Remote-Modboard läuft produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller Arbeitsstand:

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

## Bestätigt bis RDAP8

- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN wird als `owner` erkannt.
- ForrestCGN ist `isOwner:true` und `isAdmin:true`.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose ist aktiv und read-only.
- RDAP6 Write-Foundation-Diagnose ist aktiv und read-only.
- RDAP7 Confirm-Write-Helper ist vorbereitet.
- RDAP7B Confirm-Write-Metadaten sind remote bestätigt.
- RDAP8 Audit-Helper ist deployed und remote getestet.
- Sicherheitsstatus RDAP8 bestätigt:
  - `writeEnabled:false`
  - `writesStillBlocked:true`
  - `auditHelperPrepared:true`
  - `auditWriteEnabled:false`

## RDAP9

RDAP9 bereitet den Locking-Helper vor:

```text
remote-modboard/backend/src/services/admin-lock-write.service.js
```

Erwartete Werte nach Deploy:

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared:true
lockWriteEnabled:false
lockAcquireEnabled:false
lockHeartbeatEnabled:false
lockReleaseEnabled:false
lockForceTakeoverEnabled:false
writeEnabled:false
writesStillBlocked:true
```

## Weiterhin nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
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
