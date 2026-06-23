# TODO

Stand: RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS  
Datum: 2026-06-23

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
- [x] RDAP7A Auth Read-only User Resolution Plan dokumentiert
- [x] RDAP7B Auth Read-only Status Endpoints gebaut und gepusht
- [x] RDAP7C Remote Auth Status Deploy/Test bestanden
- [x] RDAP7D Auth Status Deploy Result Docs erstellt

## Offen / als naechstes

### RDAP7E Twitch OAuth Dry-Run Plan

- [ ] echte Remote-Modboard-Dateien vor Umsetzung vollstaendig pruefen
- [ ] Twitch-OAuth-Dry-Run planen
- [ ] Redirect URI festlegen
- [ ] ENV-Keys ohne Secret-Werte dokumentieren
- [ ] State/CSRF Konzept planen
- [ ] Fehler-/Abbruchfaelle planen
- [ ] keine Callback-Aktivierung ohne separaten Go-Step
- [ ] keine Secrets ins Repo oder Frontend
- [ ] keine Session-Erstellung
- [ ] keine Cookies setzen
- [ ] keine DB-Writes

### RDAP7C1 optional/offen

- [ ] Server-Workdir-Cleanup bestaetigt ausfuehren oder Ergebnis nachreichen
- [ ] RDAP-Backups aus `/root` nach `/var/backups/stream-control-center` verschieben
- [ ] RDAP-Temp-/Deploy-Clones aus `/root` entfernen
- [ ] kuenftig `/opt/stream-control-center/_deploy_tmp` verwenden
- [ ] kuenftig `/opt/stream-control-center/_runtime_tmp` verwenden

## Spaeter

- [ ] RDAP7F Twitch OAuth Config/ENV Precheck
- [ ] RDAP7G OAuth Callback Dry-Run ohne Session-Erstellung
- [ ] RDAP7H Session Store Read-only/Validation Layer
- [ ] RDAP8 Permission Check Middleware Plan
- [ ] Lock-/Audit-Implementierung fuer spaetere Writes planen

## Dauerhaft beachten

- [ ] bekannte Infos nicht unnoetig doppelt und dreifach abfragen
- [ ] nur EIN Arbeitsort pro Schritt
- [ ] vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken
- [ ] maximal ein Befehlsblock pro Antwort
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
- [ ] keine neuen RDAP-Arbeitsordner lose unter `/root`
- [ ] bei fehlenden Dateien oder fehlender Server-Ausgabe exakt nachfragen bzw. nicht als erledigt dokumentieren
