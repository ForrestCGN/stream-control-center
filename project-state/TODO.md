# TODO

Stand: RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION_DOCUMENTED  
Datum: 2026-06-23

## Erledigt

- [x] RDAP5 Auth/User/Rollen/Modulrechte-Plan dokumentiert
- [x] RDAP5A Twitch-Basiszugang dokumentiert
- [x] RDAP5B DB-/Schema-Konzept dokumentiert
- [x] RDAP5C Migration-/Helper-/Secret-Design dokumentiert
- [x] RDAP5C2 Rollen-/Gruppenmodell vereinfacht
- [x] `sound_profi` als Gruppe/Markierung statt Rolle festgelegt
- [x] RDAP5C3 DB-Plan auf Rollen + Gruppen + Modulmatrix korrigiert
- [x] `dashboard_groups` eingeplant
- [x] `dashboard_user_groups` eingeplant
- [x] generische Modulmatrix mit `target_type` + `target_key` eingeplant
- [x] feste `default_for_sound_profi`-Spalten verworfen
- [x] Webserver-DB in ISPConfig angelegt
- [x] lokale SQLite bleibt unangetastet
- [x] keine Migration ausgefuehrt
- [x] kein npm install ausgefuehrt

## Als nächstes

### RDAP5D / Remote Server Node ENV Check

- [ ] klaeren, ob Node auf web.cgn.community installiert ist
- [ ] Node-Version pruefen
- [ ] npm-Version pruefen
- [ ] SSH/Shell-Zugriff klaeren
- [ ] Webroot/Subdomain-Pfad fuer `mods.forrestcgn.de` klaeren
- [ ] ENV-/Secret-Ablage klaeren
- [ ] DB-Zugriff per localhost klaeren
- [ ] dauerhaften Node-Prozess planen
- [ ] Reverse Proxy/API-Zugriff planen
- [ ] keine Installation ohne separates Go
- [ ] keine DB-Migration ohne separates Go

## Dauerhaft beachten

- [ ] keine produktive SQLite löschen/ersetzen
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
