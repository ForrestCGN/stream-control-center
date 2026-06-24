# CURRENT STATUS - stream-control-center

Stand: RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION  
Datum: 2026-06-24

## Aktueller bestätigter RDAP-/Remote-Modboard-Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN kann sich anmelden und das Dashboard nutzen.
- EngelCGN kann nach Allowlist-Erweiterung mittesten und ist als User sichtbar.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstände sind nach V13-Fix sauberer.
- Topbar-Ausloggen wurde entfernt; Logout bleibt im Profilpanel.
- Profilpanel ist auf die Self-Service-Aktionen `Profil aktualisieren` und `Ausloggen` reduziert.
- Admin -> User & Rollen zeigt eine read-only Übersicht bekannter Dashboard-User, Rollen, Gruppen, Permissions und Sessions.

## Aktueller Arbeitsstand

`RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION` ist der aktuelle Doku-/Foundation-Step.

Dokumentiert wurden:

- Backup-Regel für spätere DB-Write-Steps
- Rollback-Grundregel
- Owner-/Admin-Permission-Read-Modell
- Confirm-Write-Mindeststandard
- Audit-Foundation
- Locking-Foundation
- Sound-Profi als Gruppe/Freigabe, nicht als Systemrolle
- nächster kleiner Code-Step: `RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC`

## Weiterhin deaktiviert

- Remote-Writes außerhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung mit Writes
- Rollen-/Freigabe-Writes
- DB-Migrationen ohne Backup/Rollback/Go

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut prüfen.

## Nächster sinnvoller Block

Nach Abschluss dieses Steps:

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
```

Ziel:

- echte serverseitige Permission-Read-/Diagnose-Grundlage prüfen oder minimal vorbereiten
- eingeloggten User diagnostisch als Owner/Admin/normaler User einordnen
- keine produktiven Admin-Writes
- keine Rollen-/Gruppen-/Session-Writes
- keine UI-Schreibbuttons
- keine DB-Migration
