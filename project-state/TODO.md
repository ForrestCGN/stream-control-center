# TODO

Stand: RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF  
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
- [x] RDAP5D als separater großer Node-Check übersprungen/korrigiert
- [x] Next-Chat-Prompt für RDAP5E erstellt
- [x] keine Migration ausgefuehrt
- [x] kein npm install ausgefuehrt
- [x] keine nginx-/Service-Aenderung ausgefuehrt

## Als nächstes

### RDAP5E / Remote Modboard Node Service Plan

- [ ] Service-Pfad auf web.cgn.community planen
- [ ] Node-Service-Startkonzept planen
- [ ] nginx-/Reverse-Proxy-Konzept planen
- [ ] ENV-/Secret-Ablage planen
- [ ] MariaDB-Verbindung read-only/health planen
- [ ] erste read-only Health/API planen
- [ ] Logging/Audit-Vorbereitung planen
- [ ] Agent-Anbindung grob planen
- [ ] keine Installation ohne separates Go
- [ ] kein npm install ohne separates Go
- [ ] keine DB-Migration ohne separates Go
- [ ] keine nginx-/Service-Aenderung ohne separates Go

## Dauerhaft beachten

- [ ] bekannte Infos nicht unnötig doppelt und dreifach abfragen
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
