# NEXT_STEPS - stream-control-center

Stand: RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP25 Login-/OAuth-/Session-Smoke-Test erfolgreich.
RDAP26 Option B DB-Rollen/Permissions live geseeded und bestaetigt.
RDAP27 echte read-only Admin-Notiztext-Route gebaut, deployed und live bestaetigt.
RDAP28 read-only Admin-Notiz-UI-Panel gebaut, deployed und im Browser bestaetigt.
```

## Aktueller Rechte-Stand

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> NICHT vergeben
```

## RDAP29 vorbereitet

```text
RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
```

Vorbereitet:

```text
tools/rdap29_admin_note_test_seed_readonly_validation.sql
docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
```

Ziel:

```text
Eine kontrollierte Test-Notiz fuer tw:127709954 per SQL-Seed anlegen,
damit die bestehende read-only UI echten Text anzeigt.
```

Nicht automatisch:

```text
Keine automatische SQL-Ausfuehrung durch installstep/deploy.
Keine Backend-/UI-Code-Aenderung.
Kein normaler Webserver-Service-Deploy noetig.
```

## Naechster praktischer Schritt

Nach lokalem Install + stepdone:

```text
RDAP29 SQL-Seed auf dem Webserver aus frischem GitHub/dev-Clone ausfuehren.
```

Pflicht davor:

```text
DB-Env maskiert pruefen
Backup erstellen
Read-only Vorpruefung per INFORMATION_SCHEMA
```

Pflicht danach:

```text
Read-Back SQL pruefen
Browser: Admin -> Admin-Notizen zeigt mindestens 1 Test-Notiz
Write bleibt false
Keine Schreibbuttons sichtbar
```

## Danach sinnvoll

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

Ziel:

```text
Write-Scope fuer Admin-Notizen sauber planen, aber noch nicht direkt bauen.
```

## Harte Grenzen fuer naechste Steps

```text
Kein admin.users.note.write ohne separaten Plan.
Keine Schreibbuttons ohne separaten Plan.
Keine Write-Route ohne Confirm/Audit/Lock/Backup/Rollback.
Keine Community-Seiten-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine Workflow-Tools ueberschreiben.
```

## Spaeterer Write-Step muss enthalten

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Payload
Lock-Scope admin:user-note:<targetUserUid>
Read-Back-Pruefung
Backup/Rollback-Konzept
separates Go von Forrest
```
