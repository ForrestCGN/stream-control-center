# CHANGELOG

Stand: RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN  
Datum: 2026-06-24

## RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN

Typ: Doku/Plan/Vorbereitung  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
Backend-Code: nein  
Workflow-Tools: nein

### Ergebnis

- RDAP13 konkretisiert den späteren Admin-Notiz-Write aus RDAP12.
- Geplante Tabelle: `dashboard_user_admin_notes`.
- Geplante Action: `admin.users.note.set`.
- Geplante Permission: `admin.users.note.write`.
- Geplanter Lock-Scope: `admin:user-note:<target_user_uid>`.
- Disabled/read-only Diagnose-Route für einen späteren Step geplant.
- Backup-/Rollback-/Audit-/Read-Back-/Abbruchbedingungen weiter konkretisiert.
- Nächster empfohlener Step: `RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC`.

### Geändert

- `docs/current/RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

### Nicht geändert

- Keine Code-Dateien.
- Keine Backend-Routen.
- Keine Services.
- Keine UI-Dateien.
- Keine Workflow-Tools.
- Keine DB-Dateien.
- Keine SQL-/Migrationsdateien.
- Keine Secrets.
- Keine produktiven Writes.
- Keine UI-Schreibbuttons.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

---

## RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN

Typ: Doku/Plan  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
Backend-Code: nein  
Workflow-Tools: nein

### Ergebnis

- Erster späterer echter Admin-Write wurde als Admin-Notiz zu einem Dashboard-User geplant.
- Rollen-, Freigabe-, Gruppen-, Session-, Permission- und Status-Writes wurden als erster Write ausgeschlossen.
- Eigene Tabelle `dashboard_user_admin_notes` als sauberer Zielpfad geplant, weil `dashboard_users` im bekannten Schema kein Notizfeld hat.
- Permission `admin.users.note.write`, Confirm-Write, Lock-Scope, Audit-Payload, Backup/Rollback-Idee und Read-Back-Prüfung dokumentiert.

---

## RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE

Typ: Doku/Projektstatus nach Konto-/Navigations-Cleanup  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
Backend-Code: nein  
Workflow-Tools: nein

### Ergebnis

- Konto-Panel-Cleanup und Navigations-Cleanup als bestätigter UX-Stand dokumentiert.
- Persönlicher Bereich liegt oben rechts im Profilmenü.
- Sidebar-Gruppe `Benutzer & Rechte` entfernt.
- Workflow-Regel ergänzt: ZIPs müssen echte Zielpfade enthalten, keine Patch-Skripte unter `tools/steps/*.ps1`.
