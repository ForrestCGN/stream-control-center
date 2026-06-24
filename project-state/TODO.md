# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestaetigt.
- [x] RDAP8 Audit-Helper disabled remote bestaetigt.
- [x] RDAP9 Lock-Helper disabled remote bestaetigt.
- [x] RDAP10 Backup-/Rollback-/Mini-Write-Plan erstellt.
- [x] RDAP10B Projektstatus-Dateien auf RDAP10-Planstand synchronisiert.
- [x] RDAP11 Mini-Write-Foundation gebaut, aber Writes weiterhin deaktiviert.
- [ ] RDAP11 lokal einspielen, Syntax pruefen, stepdone ausfuehren.
- [ ] RDAP11 nach stepdone aus frischem GitHub/dev-Clone auf Webserver deployen.
- [ ] RDAP11 remote testen: `/api/remote/routes` und `/api/remote/admin/users/mini-write-foundation-diagnostic`.
- [ ] RDAP12 First-Mini-Write-Scope-Plan erstellen.
- [ ] Noch keine produktiven Admin-Writes ohne separaten Scope/Go.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Noch keine DB-Migration ohne Backup/Rollback/Go.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten koennen.
- [ ] Lokaler Login ebenfalls ueber Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
