# TODO

Stand: RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE  
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
- [x] MariaDB-Version auf Webserver bestaetigt: 11.8.6
- [x] RDAP5D als separater grosser Node-Check uebersprungen/korrigiert
- [x] RDAP5E Remote-Modboard Node-Service-Plan dokumentiert
- [x] RDAP5F Remote-Node-Base-Readonly-Paket vorbereitet
- [x] RDAP5G Remote-Node-Server-Installationsplan dokumentiert
- [x] RDAP5H Remote-Node-Server-Handoff-/Installationspaket vorbereitet
- [x] keine Migration ausgefuehrt
- [x] kein npm install ausgefuehrt
- [x] keine nginx-/Service-Aenderung ausgefuehrt

## Als nächstes

### RDAP5I / Remote Server Readonly Install Execution

- [ ] Webserver-Lesetest ausfuehren
- [ ] Zielpfad `/opt/stream-control-center/remote-modboard/backend` pruefen/anlegen
- [ ] Service-User `sccremote` pruefen/anlegen
- [ ] ENV-/Secret-Datei `/etc/stream-control-center/remote-modboard.env` auf Server erstellen
- [ ] Passwort nur direkt auf dem Server eintragen, nicht posten/dokumentieren
- [ ] Service-Code auf Webserver kopieren
- [ ] `npm install --omit=dev` nur im Remote-Paket ausfuehren
- [ ] `npm run check` im Remote-Paket ausfuehren
- [ ] lokalen Dry-Run auf `127.0.0.1:3010` testen
- [ ] systemd-Service installieren/starten
- [ ] lokale Healthchecks testen
- [ ] nginx-Reverse-Proxy fuer `/api/remote/` einbinden
- [ ] HTTPS-Healthchecks testen
- [ ] Rollback/Undo pruefbar halten

## Verbindlicher TODO aus RDAP5F

### RDAP4B remote_agent.js auf RDAP5C3 korrigieren

- [ ] `backend/modules/remote_agent.js` pruefen und spaeter auf RDAP5C3 Rollen-/Gruppenmodell korrigieren
- [ ] `sound_profi` darf dort nicht mehr als Rolle gefuehrt werden
- [ ] `sound_profi` darf dort kein festes globales Permission-Preset mehr sein
- [ ] `sound_profi` muss als Gruppe/Markierung behandelt werden
- [ ] Modulrechte muessen ueber `target_type` + `target_key` / Modulmatrix gedacht werden
- [ ] Bestehende read-only RDAP4B-Routen duerfen bei der Korrektur nicht entfernt werden
- [ ] Korrektur erst nach eigenem Scope und Forrests ausdruecklichem Go

## Dauerhaft beachten

- [ ] bekannte Infos nicht unnoetig doppelt und dreifach abfragen
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
