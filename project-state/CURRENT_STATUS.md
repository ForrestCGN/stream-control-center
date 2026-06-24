# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller RDAP-Status

Remote-Modboard läuft produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller relevanter Stand:

```text
RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
```

## Bestätigt / Zielstand

- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN wird als `owner` erkannt.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose bleibt aktiv.
- RDAP6 Write-Foundation-Diagnose bleibt read-only aktiv.
- RDAP7 Confirm-Write-Helper ist vorbereitet.
- RDAP7B bereinigt Confirm-Write-Metadaten:
  - `auth.permissions.confirmWriteHelperPrepared:true`
  - `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
  - Foundation-Diagnose enthält `confirmWriteHelperPrepared:true`
  - Foundation-Diagnose enthält `confirmWriteHelper.prepared:true`
- Keine produktiven Admin-Writes.
- Keine DB-Migration.
- Keine UI-Schreibbuttons.

## Lokaler/LAN-Betrieb

Forrest möchte später:

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
