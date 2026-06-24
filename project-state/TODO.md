# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestätigt.
- [x] RDAP8 Audit-Helper disabled remote bestätigt.
- [x] RDAP9 Lock-Helper disabled remote bestätigt.
- [x] RDAP10 Backup-/Rollback-/Mini-Write-Plan erstellt.
- [x] RDAP10B Projektstatus-Dateien auf RDAP10-Planstand synchronisiert.
- [x] RDAP11 Mini-Write-Foundation disabled gebaut.
- [x] RDAP11 Webserver-Deploy remote bestätigt.
- [x] RDAP DESIGN2 Login Text Polish lokal und live bestätigt.
- [x] RDAP Account Panel Cleanup V2: Konto-Panel enttechnisiert.
- [x] RDAP Nav Cleanup: Benutzerbereich aus Sidebar entfernt und ins Profil/Admin-Konzept verschoben.
- [x] RDAP Nav/Account Cleanup dokumentiert.
- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [ ] RDAP13 Admin-Note-Table/Disabled-Route-Plan erstellen.
- [ ] Noch keine produktiven Admin-Writes ohne separaten Scope/Go.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Noch keine DB-Migration ohne Backup/Rollback/Go.
- [ ] Auffälligkeit prüfen: `statusApiVersion` zeigt evtl. `rdap_admin_users9.v1`, obwohl `moduleBuild` RDAP11 ist.

## RDAP12 Entscheidung

- [x] Kleinsten späteren Write ausgewählt: Admin-Notiz zu User setzen/aktualisieren.
- [x] Rollen-/Freigabe-/Session-/Permission-Write als erster Write ausgeschlossen.
- [x] Eigene Tabelle `dashboard_user_admin_notes` als sauberer Zielpfad geplant.
- [x] Permission `admin.users.note.write` geplant.
- [x] Confirm-Write-Anforderung geplant.
- [x] Audit-Payload geplant.
- [x] Lock-Scope `admin:user-note:<target_user_uid>` geplant.
- [x] Read-Back-Prüfung geplant.
- [x] Fehlerfälle/Abbruchbedingungen dokumentiert.

## RDAP13 muss klären

- [ ] Echten Ziel-DB-Typ auf Server prüfen, nicht raten.
- [ ] Backup-Befehl mit echter Server-Env/Config finalisieren.
- [ ] Rollback für neue Tabelle und einzelnen Notiz-Write finalisieren.
- [ ] Migration für `dashboard_user_admin_notes` separat vorbereiten, disabled/planbar.
- [ ] Read-only Diagnose für Notiz-Tabelle planen/bauen.
- [ ] Keine produktiven Notiz-Writes in RDAP13.

## Konto-/Navigation UX

- [x] Normales Konto-Panel von technischen Diagnosewerten befreien.
- [x] Hinweisbox „Nur dein eigenes Konto“ aus Konto-Panel entfernen.
- [x] Sidebar-Gruppe „Benutzer & Rechte“ entfernen.
- [x] Persönliche Konto-/Rechte-Funktion oben rechts im Profilbereich bündeln.
- [x] Admin-Bereich als Ort für Benutzerverwaltung, Rollen/Rechte, Zugriff/Freigaben und Sicherheit festhalten.
- [ ] Später eigenes internes CGN-User-ID-Konzept planen, nicht rohe Twitch-UID prominent anzeigen.

## Workflow-Schutz

- [ ] Vor jedem weiteren Step `installstep.cmd`, `stepdone.cmd`, `testdeploy.cmd` und `tools/remote-modboard-deploy.sh` als geschützte Workflow-Tools behandeln.
- [ ] Design-/Frontend-/Doku-Steps dürfen Workflow-Tools nicht überschreiben.
- [ ] ZIPs immer mit echten Zielpfaden bauen; keine Patch-Skripte unter `tools/steps/*.ps1`.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
