# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

## RDAP12 Ergebnis

Der erste spätere echte Admin-Write wurde bewusst auf einen harmlosen Scope begrenzt:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

Nicht als erster Write:

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen ändern
Sessions widerrufen
Permissions ändern
dashboard_users.status ändern
```

## Nächster empfohlener Fach-Step

```text
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
```

RDAP13 darf nur vorbereitet/disabled planen oder bauen, nicht produktiv schreiben.

## RDAP13 Mindestscope

```text
- Prüfen, ob dashboard_user_admin_notes bereits existiert.
- Falls nein: Migration separat planen, nicht blind ausführen.
- Read-only Diagnose für die spätere Notiz-Tabelle vorbereiten.
- Noch keine Notiz schreiben.
- Noch keine UI-Schreibbuttons.
- Backup-/Rollback-Befehl konkret am echten Server/DB-Typ prüfen.
```

## Erst nach RDAP13/RDAP14

Ein echter Admin-Notiz-Write darf erst gebaut werden, wenn separat erledigt ist:

```text
Backup vorhanden
Rollback getestet/geplant
Permission admin.users.note.write serverseitig geprüft
confirmWrite Pflicht
Lock-Scope admin:user-note:<target_user_uid>
Audit-Payload definiert
Read-Back-Prüfung definiert
Forrest gibt erneut ausdrücklich go
```

## Offene Auffälligkeit

```text
statusApiVersion kann noch rdap_admin_users9.v1 anzeigen, obwohl moduleBuild RDAP11 ist.
```

Für RDAP12 kein Stopper, weil nur Doku/Plan.

## Workflow-Regeln

```text
Keine Workflow-Tools in Design-/Frontend-/Doku-Steps überschreiben.
ZIPs mit echten Zielpfaden bauen.
Keine Patch-Skripte unter tools/steps/*.ps1.
Nicht im Webserver-Verzeichnis git pull empfehlen.
Webserver-Deploy immer aus frischem GitHub/dev-Clone.
```
