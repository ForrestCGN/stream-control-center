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

Aktueller bestätigter Frontend/Login-Design-Stand:

```text
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
```

Aktueller bestätigter Konto-/Navigations-UX-Stand:

```text
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
```

## Live/Browser bestätigt nach NAV-Cleanup

Bestätigt durch Forrest nach Webserver-Deploy und Browserprüfung:

```text
Konto-Panel ist enttechnisiert.
Sidebar-Gruppe „Benutzer & Rechte“ wurde entfernt.
Persönliche Konto-/Rechte-Ansicht liegt oben rechts im Profilmenü.
Admin-Bereich enthält die Verwaltungs-/Rechte-/Sicherheitsbereiche.
```

## Konto-Panel aktueller Sollzustand

Das normale Konto-Panel oben rechts zeigt nur noch nutzerfreundliche Angaben:

```text
Avatar
Displayname
@twitch-login
Rolle
Profil aktualisieren
Ausloggen
```

Nicht mehr im Konto-Panel anzeigen:

```text
Dashboard-Zugriff
Access-Grund
Twitch/User UID
leere Gruppen-Zeile
Session
remote.view
Hinweisbox „Nur dein eigenes Konto“
```

Eine spätere eigene interne CGN-User-ID ist sinnvoll, aber nicht als rohe Twitch-UID. Bis ein echtes internes ID-Konzept existiert, wird im normalen Konto-Panel keine User-ID angezeigt.

## Navigation aktueller Sollzustand

Die persönliche Navigation liegt oben rechts beim Profil/Konto. Die Sidebar soll keine eigene Gruppe „Benutzer & Rechte“ mehr enthalten.

Sidebar-Grundstruktur nach Cleanup:

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

Technische Details bleiben in Admin/System/Diagnose sichtbar bzw. geplant, aber nicht im normalen Konto-Panel.

## Remote-Status nach bisherigen RDAP11/DESIGN2-Deploys

Bestätigt per Statusroute:

```text
ok: true
service: remote-modboard
moduleBuild: RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Auffälligkeit:

```text
statusApiVersion: rdap_admin_users9.v1
```

Hinweis: `statusApiVersion` passt nicht sauber zur RDAP11-Build-Bezeichnung. Für reine Frontend-/UX-Steps ist das kein Stopper. Später separat prüfen.

## Aktueller Dokumentations-/Planstand

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE
```

## Workflow-/Tool-Stand

`installstep.cmd` ist wieder der allgemeine ZIP-Installer:

```text
STEP_ZIP=%~1
Downloads-Fallback bei leerem ZIP-Argument
Expand-Archive ins Repo
testdeploy.cmd wird gestartet
```

Wichtig für weitere Steps:

```text
Design-/Frontend-/Doku-Steps dürfen keine Workflow-Tools überschreiben.
installstep.cmd, stepdone.cmd, testdeploy.cmd und Deploy-Skripte nur ändern, wenn Forrest das ausdrücklich beauftragt.
ZIPs müssen echte Zielpfade enthalten; keine Patch-Skripte wie tools/steps/*.ps1.
```

## Sicherheitsstand

```text
Permission-Read-Diagnose: vorbereitet
Confirm-Write-Helper: vorbereitet, Writes deaktiviert
Audit-Helper: vorbereitet, Writes deaktiviert
Lock-Helper: vorbereitet, Writes deaktiviert
Mini-Write-Foundation: vorbereitet, Writes deaktiviert
Admin-Writes: weiterhin aus
DB-Migration: keine
UI-Schreibbuttons: keine
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
```

## Nächster sinnvoller Fachschritt

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

Nur planen, welcher kleinste echte Admin-Write später gebaut werden darf. Noch kein produktiver Write ohne separaten Scope, Backup/Rollback, Permission, Confirm-Write, Audit, Locking, Read-Back-Prüfung und separates Go.
