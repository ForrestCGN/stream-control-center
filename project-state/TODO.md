# TODO

Stand: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS  
Datum: 2026-06-23

## Erledigt

- [x] RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf `c3stream_control` ausgefuehrt
- [x] RDAP6K Validation erfolgreich
- [x] RDAP6L Migrationsergebnis dokumentiert
- [x] RDAP7 Login-/Session-Konzept dokumentiert
- [x] RDAP7A Auth Read-only User Resolution Plan dokumentiert
- [x] RDAP7B Auth Read-only Status Endpoints gebaut

## Noch offen / als naechstes

### RDAP7C Auth Status Deploy/Test Docs

- [ ] RDAP7B lokal einspielen
- [ ] `npm run check` lokal oder auf Server ausfuehren
- [ ] RDAP7B auf Webserver deployen
- [ ] `scc-remote-modboard.service` neustarten
- [ ] `/api/remote/routes` pruefen
- [ ] `/api/remote/auth/me` pruefen
- [ ] `/api/remote/auth/session-status` pruefen
- [ ] Ergebnis dokumentieren

### Spaeter

- [ ] RDAP7D Twitch OAuth Login Dry-Run Plan
- [ ] RDAP7E Session Store Read-only/Validation Layer
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
