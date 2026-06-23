# TODO

Stand: RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN  
Datum: 2026-06-23

## Erledigt

- [x] RDAP5 Auth/User/Rollen/Modulrechte-Plan dokumentiert
- [x] RDAP5A Twitch-Basiszugang dokumentiert
- [x] RDAP5B DB-/Schema-Konzept dokumentiert
- [x] RDAP5C Migration-/Helper-/Secret-Design dokumentiert
- [x] RDAP5C2 Rollen-/Gruppenmodell vereinfacht
- [x] RDAP5C3 DB-Plan auf Rollen + Gruppen + Modulmatrix korrigiert
- [x] Webserver-DB in ISPConfig angelegt
- [x] Webserver-DB-Daten dokumentiert ohne Passwort
- [x] lokale SQLite bleibt unangetastet
- [x] bekannte Webserver-Fakten konsolidiert
- [x] Node/npm/git/MariaDB-Client als bereits bekannt dokumentiert
- [x] MariaDB-Version per `mysql --version` bestaetigt: MariaDB 11.8.6, Client 15.2
- [x] RDAP5D als separater großer Node-Check übersprungen/korrigiert
- [x] RDAP5E Remote-Modboard-Node-Service-Plan erstellt
- [x] keine Migration ausgefuehrt
- [x] kein npm install ausgefuehrt
- [x] keine nginx-/Service-Aenderung ausgefuehrt
- [x] keine produktive Remote-Node-App gestartet

## Als nächstes

### RDAP5F / Remote Node Base Readonly Package

- [ ] Scope fuer RDAP5F nennen
- [ ] kleines read-only Node-Paket planen
- [ ] echte Zielpfade im Repo verwenden
- [ ] `.env.example` ohne echte Secrets vorbereiten
- [ ] read-only Health-/Status-/Routes-API vorbereiten
- [ ] MariaDB-Health nur read-only planen
- [ ] keine DB-Migration ohne separates Go
- [ ] kein npm install ohne separates Go
- [ ] keine nginx-/Service-Aenderung ohne separates Go
- [ ] keine Agent-Actions ohne separates Go
- [ ] keine produktive Steuerung ohne Permission/Lock/Audit

## Dauerhaft beachten

- [ ] bekannte Infos nicht unnötig doppelt und dreifach abfragen
- [ ] keine produktive SQLite löschen/ersetzen
- [ ] keine MariaDB-Migration ohne Backup-/Migrationsplan
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
