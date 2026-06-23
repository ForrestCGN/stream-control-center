# TODO

Stand: RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN  
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

## Noch offen / als naechstes

### RDAP7B Auth Status Read-only Endpoints

- [ ] echte Remote-Modboard-Dateien vor Umsetzung vollstaendig pruefen
- [ ] `/api/remote/auth/status` read-only umsetzen
- [ ] `/api/remote/auth/me` read-only umsetzen
- [ ] Zustand `loggedIn=false` ohne Session umsetzen
- [ ] keine Login-Aktivierung
- [ ] keine Session-Erstellung
- [ ] keine Cookies setzen
- [ ] keine Schreibaktionen
- [ ] keine Agent-Actions
- [ ] `npm run check` auf Webserver ausfuehren
- [ ] API-Routen live pruefen
- [ ] Doku danach aktualisieren

### Spaeter

- [ ] RDAP7C Twitch OAuth Login Dry-Run Plan
- [ ] RDAP7D Session Store Validation Layer
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
- [ ] bei fehlenden Dateien exakt nachfragen
