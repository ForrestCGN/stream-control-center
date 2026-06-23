# TODO

Stand: RDAP5B_AUTH_DB_SCHEMA_PLAN_DOCUMENTED  
Datum: 2026-06-23

## Erledigt

- [x] RDAP5 Auth/User/Rollen/Modulrechte-Plan dokumentiert
- [x] RDAP5A Twitch-Basiszugang dokumentiert
- [x] Twitch MOD und STREAMER als Dashboard-Basiszugang eingeplant
- [x] Twitch VIP als kein Dashboard-Basiszugang festgelegt
- [x] VIP fuer spaetere Community-/Website-Funktionen vorgesehen
- [x] LEADMOD als lokale manuelle Zusatzrolle festgelegt
- [x] SOUND_PROFI als lokale Zusatzfreigabe mit Basiszugang festgelegt
- [x] Webserver-DB in ISPConfig angelegt
- [x] Webserver-DB-Daten dokumentiert ohne Passwort
- [x] RDAP5B DB-/Schema-Konzept dokumentiert
- [x] lokale SQLite bleibt unangetastet
- [x] keine Migration ausgefuehrt

## Als nächstes

### RDAP5C / Auth DB Migration Design

- [ ] echte aktuelle Repo-/Live-Dateien prüfen
- [ ] klaeren, ob/wie Node auf dem Webserver laeuft
- [ ] DB-Zugriff auf `c1stream_control` sicher planen
- [ ] Secret-/ENV-Ablage planen
- [ ] MySQL/MariaDB-Treiber planen
- [ ] Migrationsversionierung planen
- [ ] Backup-/Rollback-Regeln planen
- [ ] Seeds fuer Rollen/Permissions planen
- [ ] lokale SQLite nicht anfassen
- [ ] keine Migration ohne separates Go

## Dauerhaft beachten

- [ ] keine produktive SQLite löschen/ersetzen
- [ ] keine MariaDB ohne Backup-/Migrationsplan beschreiben
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions ohne Allowlist
- [ ] keine freie Shell-/Datei-/Prozesssteuerung
- [ ] jedes Modul braucht eigene Permission-Keys
- [ ] Backend prueft Rechte; Frontend ist keine Sicherheitsentscheidung
- [ ] Twitch MOD/STREAMER/VIP bei Login/Refresh neu pruefen
- [ ] VIP gibt keine Dashboard-Grundrechte
- [ ] Secrets niemals ins Repo oder Frontend
- [ ] bei fehlenden Dateien exakt nachfragen
