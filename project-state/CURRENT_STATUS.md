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
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
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
- RDAP8 Audit-Helper ist vorbereitet, aber Audit-/Admin-Writes bleiben deaktiviert.
- Build/Header:
  - `moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN`
  - `statusApiVersion: rdap_admin_users8.v1`
- Audit-Metadaten bestätigt:
  - `adminUsersWriteFoundation.auditHelperPrepared:true`
  - `adminUsersWriteFoundation.auditWriteEnabled:false`
  - `auditDiagnostic.helperPrepared:true`
  - `auditDiagnostic.writeEnabled:false`
- Sicherheitsstatus bestätigt:
  - `writeEnabled:false`
  - `writesStillBlocked:true`

## RDAP8 Ergebnis

RDAP8 hat einen vorbereiteten Audit-Helper ergänzt:

```text
remote-modboard/backend/src/services/admin-audit-write.service.js
```

Der Helper baut/prueft nur sichere Audit-Drafts und blockiert weiterhin produktive Writes:

```text
auditWriteEnabled:false
auditInsertEnabled:false
auditUpdateEnabled:false
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
UI-Schreibbuttons
Audit-Inserts/Audit-Updates
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
