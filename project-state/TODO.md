# TODO

Stand: RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION  
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

## Wichtige Korrektur

- [x] DB_USER/DB_NAME-Verwechslung erkannt
- [x] Echt bestaetigt: `DB_USER=c1stream_control`
- [x] Echt bestaetigt: `DB_NAME=c3stream_control`
- [ ] Alte Doku-Stellen mit vertauschter Angabe korrigieren/uebersteuern

## Noch sofort offen

- [ ] `systemctl is-enabled scc-remote-modboard.service` pruefen
- [ ] `systemctl is-active scc-remote-modboard.service` pruefen
- [ ] `journalctl -u scc-remote-modboard.service -n 30 --no-pager` pruefen
- [ ] RDAP5I-Doku final in GitHub/dev einspielen
- [ ] Neuen Chat-Prompt mit aktuellem Live-Stand speichern

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
