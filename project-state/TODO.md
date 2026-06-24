# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestätigt.
- [x] RDAP8 Audit-Helper disabled remote bestätigt.
- [x] RDAP9 Lock-Helper disabled remote bestätigt.
- [x] RDAP10 Backup-/Rollback-/Mini-Write-Plan erstellt.
- [x] RDAP10B Projektstatus-Dateien auf RDAP10-Planstand synchronisiert.
- [x] RDAP11 Mini-Write-Foundation disabled gebaut.
- [x] RDAP11 Webserver-Deploy remote bestätigt.
- [ ] RDAP12 First-Mini-Write-Scope-Plan erstellen.
- [ ] Noch keine produktiven Admin-Writes ohne separaten Scope/Go.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Noch keine DB-Migration ohne Backup/Rollback/Go.

## RDAP12 muss klären

- [ ] Kleinsten späteren Write auswählen.
- [ ] Exakte Tabelle/Felder/Read-Back-Prüfung dokumentieren.
- [ ] Backup-Befehl dokumentieren.
- [ ] Rollback-Befehl dokumentieren.
- [ ] Permission-Prüfung dokumentieren.
- [ ] Confirm-Write-Anforderung dokumentieren.
- [ ] Audit-Payload dokumentieren.
- [ ] Lock-Scope dokumentieren.
- [ ] Fehlerfälle/Abbruchbedingungen dokumentieren.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
