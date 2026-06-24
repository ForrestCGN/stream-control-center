# TODO

Stand: RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES  
Datum: 2026-06-24

## Erledigt

- [x] RDAP5 Auth/User/Rollen/Modulrechte-Plan dokumentiert
- [x] RDAP5A Twitch-Basiszugang dokumentiert
- [x] RDAP5B DB-/Schema-Konzept dokumentiert
- [x] RDAP5C Migration-/Helper-/Secret-Design dokumentiert
- [x] RDAP5C2 Rollen-/Gruppenmodell vereinfacht
- [x] RDAP5C3 DB-Plan auf Rollen + Gruppen + Modulmatrix korrigiert
- [x] Webserver-DB in ISPConfig angelegt
- [x] bekannte Webserver-Fakten konsolidiert
- [x] RDAP5I Remote-Modboard Node-Basisdienst read-only live
- [x] RDAP5J Remote Node Monitoring/Hardening abgeschlossen
- [x] RDAP4B -> RDAP5C3 `backend/modules/remote_agent.js` korrigiert
- [x] RDAP6C Auth-DB-Migrationsskript-Paket vorbereitet
- [x] RDAP6D Testdatenbanklauf auf Webserver durchgefuehrt
- [x] RDAP6E Test-DB-Ergebnis ausgewertet und dokumentiert
- [x] RDAP6F Auth DB Integration Plan dokumentiert
- [x] RDAP6G Auth Backend Read-only DB Layer vorbereitet und deployed
- [x] RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
- [x] RDAP6I Auth DB Production Migration Runbook dokumentiert
- [x] RDAP6J Productive Migration Precheck bestanden
- [x] RDAP6J Backup erstellt: `/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql`
- [x] RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf `c3stream_control` ausgefuehrt
- [x] RDAP6K Validation erfolgreich
- [x] RDAP6L Migrationsergebnis dokumentiert
- [x] RDAP7 Login-/Session-Konzept dokumentiert
- [x] RDAP7A Auth Read-only User Resolution Plan eingespielt
- [x] RDAP7B Auth Read-only Status Endpoints gebaut und gepusht
- [x] RDAP7C Remote Auth Status Deploy/Test live bestanden
- [x] RDAP7C1 Server Workdir Cleanup bestanden
- [x] RDAP7D Auth Status Deploy Result Docs erstellt
- [x] RDAP7E Server Workdir Cleanup Docs abgeschlossen
- [x] RDAP7F Chat-Handoff und Next-Chat-Prompt erstellt
- [x] RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
- [x] RDAP7G Twitch OAuth ENV/Server Prep disabled vorbereitet und live deployed
- [x] RDAP7H OAuth Callback Skeleton disabled vorbereitet und live deployed/getestet
- [x] RDAP7I Session Store Read-only Validation Layer vorbereitet
- [x] RDAP7I Session Store Read-only Validation Layer live deployed/getestet
- [x] RDAP7I Live-Deploy-Ergebnis dokumentiert
- [x] RDAP8 Permission Check Middleware Plan dokumentiert
- [x] RDAP8A Read-only Permission Resolver Diagnostic vorbereitet
- [x] RDAP8B Permission Resolver Live Deploy/Test dokumentiert
- [x] RDAP9 Lock-/Audit-Konzept fuer spaetere Writes dokumentiert

## Noch offen / als naechstes

### RDAP10 Lock-/Audit-Implementierungsplan read-only

- [ ] echte Remote-Modboard-Dateien und RDAP-Dokus erneut pruefen
- [ ] vorhandene Tabellen `dashboard_locks` und `dashboard_audit_log` aus RDAP6C/RDAP6K gegen echten Stand pruefen
- [ ] konkrete Lock-Helper-Struktur planen
- [ ] konkrete Audit-Helper-Struktur planen
- [ ] konkrete API-Routen fuer spaetere Lock-/Audit-Funktionen planen
- [ ] Transaktions-/Fehlerfall-Konzept fuer MariaDB planen
- [ ] Confirm-/Safety-Parameter standardisieren
- [ ] read-only Diagnose fuer Locks/Audit nur planen oder separat freigeben
- [ ] keine produktiven Writes bauen
- [ ] keine Agent-Actions aktivieren
- [ ] keine OBS-/Sound-/Overlay-/Command-Steuerung bauen
- [ ] kein Login-/Cookie-/Session-Erstellung aktivieren

### Spaeter

- [ ] Server-ENV nach RDAP7G/RDAP7H/RDAP7I/RDAP8A Deploy manuell pruefen/ergaenzen, aber `TWITCH_OAUTH_ENABLED=false` und `SESSION_ENABLED=false` beibehalten
- [ ] Alte RDAP6J-Backup-Referenz unter `/root` bleibt historisch dokumentiert; neue Backups duerfen nicht mehr nach `/root`
- [ ] Kosmetik spaeter: `moduleBuild` in `remote-modboard/backend/server.js` auf aktuellen RDAP-Stand anheben, aber nur mit eigenem Mini-Scope
- [ ] Produktive Permission-Erzwingung erst nach aktivem Login, Lock-/Audit-Konzept und separatem Go
- [ ] User-/Rollen-/Gruppen-Schreibrouten erst nach separatem Sicherheits-Scope
- [ ] Agent-Handshake/Allowlist-Plan separat vorbereiten
- [ ] Erste produktive Remote-Write-Route nur mit Login + Permission + Lock + Audit + Confirm + Backup/Rollback + ausdruecklichem Go

## Dauerhaft beachten

- [ ] bekannte Infos nicht unnoetig doppelt und dreifach abfragen
- [ ] nur EIN Arbeitsort pro Schritt
- [ ] vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken
- [ ] maximal ein Befehlsblock pro Antwort
- [ ] keine RDAP-Arbeitsordner/Deploy-Clones/Backups mehr in `/root`
- [ ] Server-Deploy-Clones nach `/opt/stream-control-center/_deploy_tmp/`
- [ ] Server-Runtime-/Temp-Dateien nach `/opt/stream-control-center/_runtime_tmp/`
- [ ] Server-Backups nach `/var/backups/stream-control-center/`
- [ ] keine produktive SQLite loeschen/ersetzen
- [ ] keine MariaDB ohne Backup-/Migrationsplan beschreiben
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions ohne Allowlist
- [ ] keine freie Shell-/Datei-/Prozesssteuerung
- [ ] Backend prueft Rechte; Frontend ist keine Sicherheitsentscheidung
- [ ] VIP gibt keine Dashboard-Grundrechte
- [ ] `sound_profi` hat keine festen globalen Rechte
- [ ] Rollen und Gruppen getrennt halten
- [ ] Secrets niemals ins Repo oder Frontend
- [ ] bei fehlenden Dateien exakt nachfragen
