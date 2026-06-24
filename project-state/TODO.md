# TODO

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktuell erledigt

- [x] RDAP5 Permission-Diagnose read-only gebaut.
- [x] RDAP5 serverseitig getestet.
- [x] Browser-Test mit ForrestCGN Session erfolgreich.
- [x] `canWriteAdminUsers:false` bleibt aktiv.
- [x] Kein User-/Rollen-/Gruppen-/Session-Write gebaut.
- [x] Lokal/LAN-Ziel mit Twitch-Login als Planung aufgenommen.

## Hoch priorisiert

- [ ] RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN planen.
- [ ] Lokale Env-Strategie festlegen.
- [ ] Lokales Startscript planen.
- [ ] LAN-Zugriff für EngelCGN planen.
- [ ] Lokale Twitch OAuth Callback-Strategie planen.
- [ ] Lokale DB-Strategie festlegen, bevorzugt MariaDB-Testdatenbank.

## Admin-Userverwaltung

- [ ] RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION planen/bauen.
- [ ] Confirm-Write-Pattern vorbereiten.
- [ ] Audit-Write-Pflicht vorbereiten.
- [ ] Locking-Grundlage vorbereiten.
- [ ] Erst danach kleinste echte Admin-Write-Aktion planen.

## Cleanup

- [ ] RDAP_META1_BUILD_HEADER_CLEANUP planen.
- [ ] `moduleBuild`/Header-Metadaten aktualisieren oder zentralisieren.
- [ ] Reason-Ausgabe der Permission-Diagnose verständlicher machen:
  - Owner-Fallback klar anzeigen
  - Step-Scope-Block klar anzeigen

## Sicherheitsregeln

- [ ] Keine Secrets ins Repo.
- [ ] Keine lokalen Env-Dateien committen.
- [ ] Keine lokalen Dev-/LAN-Bypässe produktiv aktivieren.
- [ ] Keine DB-Migration ohne Backup/Rollback/Go.
- [ ] Keine Admin-Writes ohne Permission, Confirm, Audit, Locking.
