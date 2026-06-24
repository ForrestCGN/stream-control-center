# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller bestätigter RDAP-/Design-/UX-Status

Produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller bestätigter Backend-/Security-Code-Stand:

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Aktueller bestätigter Frontend/Login-/Konto-/Navigations-Stand:

```text
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE
```

Aktueller Planstand:

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

## RDAP12 Ergebnis

RDAP12 ist nur Planung. Es wurde kein echter Write gebaut.

Geplanter erster späterer Mini-Write:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

Wichtiges Ergebnis der Prüfung:

```text
Kein Rollen-/Freigabe-/Session-/Permission-Write als erster Schreibtest.
Keine Änderung an dashboard_users.status als erster Write.
Admin-Notiz soll in eine eigene Tabelle dashboard_user_admin_notes.
```

Grund: Im bekannten RDAP6C-Schema hat `dashboard_users` kein Notizfeld. Deshalb muss die Notiz sauber separat geplant werden und darf nicht in vorhandene Security-Felder gequetscht werden.

## Konto-/Navigation aktueller Sollzustand

Konto-Panel oben rechts:

```text
Avatar
Displayname
@twitch-login
Rolle
Profil aktualisieren
Ausloggen
```

Sidebar ohne eigene Gruppe `Benutzer & Rechte`:

```text
System
  Übersicht
  Diagnose
  Routen

Module
  Module

Admin
  Benutzerverwaltung
  Rollen & Rechte
  Zugriff / Freigaben
  Sicherheit
```

## Sicherheitsstand

```text
Permission-Read-Diagnose: vorbereitet
Confirm-Write-Helper: vorbereitet, Writes deaktiviert
Audit-Helper: vorbereitet, Writes deaktiviert
Lock-Helper: vorbereitet, Writes deaktiviert
Mini-Write-Foundation: vorbereitet, Writes deaktiviert
Admin-Writes: weiterhin aus
DB-Migration: keine in RDAP12
UI-Schreibbuttons: keine in RDAP12
Agent-Actions: aus
OBS-/Sound-/Overlay-/Command-Steuerung: aus
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
Backup-Ausführung
Rollback-Ausführung
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Admin-Notiz-Write
```

## Workflow-/Tool-Stand

`installstep.cmd` ist der allgemeine ZIP-Installer. Für weitere Steps gilt:

```text
Design-/Frontend-/Doku-Steps dürfen keine Workflow-Tools überschreiben.
installstep.cmd, stepdone.cmd, testdeploy.cmd und Deploy-Skripte nur ändern, wenn Forrest das ausdrücklich beauftragt.
ZIPs müssen echte Zielpfade enthalten; keine Patch-Skripte wie tools/steps/*.ps1.
```

## Nächster sinnvoller Schritt

```text
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
```

Nur mit weiterem ausdrücklichem Go. Noch keinen produktiven Write bauen.
