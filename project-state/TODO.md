# TODO

Stand: RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK  
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
- [x] MariaDB-Version auf Webserver bestaetigt: 11.8.6
- [x] RDAP5E Remote-Modboard Node-Service-Plan dokumentiert
- [x] RDAP5F Remote-Node-Base-Readonly-Paket vorbereitet
- [x] RDAP5G Remote-Node-Server-Installationsplan dokumentiert
- [x] RDAP5H Remote-Node-Server-Handoff-Paket vorbereitet
- [x] RDAP5I Service-Pfade auf Webserver angelegt
- [x] RDAP5I Service-User `sccremote` angelegt
- [x] RDAP5I Service-Code nach `/opt/stream-control-center/remote-modboard/backend` kopiert
- [x] RDAP5I ENV-Datei auf Server angelegt, Passwort nicht gepostet
- [x] RDAP5I `npm install --omit=dev` nur im separaten Remote-Paket ausgefuehrt
- [x] RDAP5I `npm run check` erfolgreich
- [x] RDAP5I lokaler Dry-Run auf `127.0.0.1:3010` erfolgreich
- [x] RDAP5I DB-Zugriff geklaert und erfolgreich getestet
- [x] RDAP5I systemd-Service installiert und gestartet
- [x] RDAP5I nginx-Proxy ueber ISPConfig nginx Directives eingerichtet
- [x] RDAP5I HTTPS-Healthchecks erfolgreich
- [x] RDAP5J Remote Node Monitoring/Hardening abgeschlossen
- [x] RDAP4B -> RDAP5C3 `backend/modules/remote_agent.js` korrigiert
- [x] `sound_profi` im Remote-Agent nicht mehr als Rolle gefuehrt
- [x] `sound_profi` im Remote-Agent als Gruppe/Marker dokumentiert
- [x] RDAP6C Auth-DB-Migrationsskript-Paket vorbereitet
- [x] RDAP6D Test-DB-Ausfuehrungsanleitung vorbereitet
- [x] RDAP6D Testdatenbanklauf auf Webserver durchgefuehrt
- [x] RDAP6E Test-DB-Ergebnis ausgewertet und dokumentiert
- [x] RDAP6F_PREP_DOC_STATUS_SYNC vorbereitet: zentrale Projektstatus-Dokus auf echten Stand gebracht
- [x] RDAP6F Auth DB Integration Plan dokumentiert
- [x] RDAP6G Auth Backend Read-only DB Layer vorbereitet
- [x] RDAP6H Remote read-only Auth-Model Deploy/Test live bestanden
- [x] RDAP6H moduleBuild live auf `RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST` aktualisiert
- [x] RDAP6I Auth DB Production Migration Runbook dokumentiert

## Wichtige Korrektur

- [x] DB_USER/DB_NAME-Verwechslung erkannt
- [x] Echt bestaetigt: `DB_USER=c1stream_control`
- [x] Echt bestaetigt: `DB_NAME=c3stream_control`
- [x] Aktuelle zentrale Doku-Dateien mit korrigierter Angabe aktualisiert

## Noch offen / als naechstes

### RDAP6J Auth DB Production Migration Execution Precheck

- [ ] echten GitHub/dev-Stand pruefen
- [ ] Ziel-DB `c3stream_control` bestaetigen
- [ ] DB-User `c1stream_control` bestaetigen
- [ ] Backup-Ziel auf Server festlegen
- [ ] pruefen, ob Backup erstellt werden kann
- [ ] Restore-/Rollback-Weg nochmal bestaetigen
- [ ] SQL-Dateien aus `db/rdap6c` pruefen
- [ ] Validation-Datei pruefen
- [ ] `/api/remote/auth/model` vor Migration read-only testen
- [ ] keine SQL-Ausfuehrung ohne separates Go

### Spaeter

- [ ] RDAP6K Produktiv-Migration nur mit Backup/Restore/Validation/separatem Go
- [ ] RDAP7 Login-/Session-Konzept separat planen
- [ ] Permission-Middleware serverseitig planen
- [ ] Lock-/Audit-Pflicht fuer spaetere Schreibfunktionen planen

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
