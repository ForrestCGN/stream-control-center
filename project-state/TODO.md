# TODO - stream-control-center

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
Datum: 2026-06-24

## Erledigt

- [x] RDAP UI1 live sichtbar
- [x] RDAP UI2 read-only Komfort live sichtbar
- [x] Remote-Modboard Deploy-Script live getestet
- [x] AUTH1 Twitch Login gated gebaut
- [x] AUTH1 ohne Secrets/Flags mit HTTP 403 bestätigt
- [x] AUTH1 Env-Gates aktiviert
- [x] Twitch OAuth Start mit HTTP 302 bestätigt
- [x] Browser-Login erfolgreich getestet
- [x] Browser zeigt `Angemeldet als ForrestCGN`
- [x] API bestätigt Auth/OAuth/Sessions aktiv

## Sofort

- [ ] `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, weil sie im Chat sichtbar waren
- [ ] Danach Browser erneut einloggen

## Als nächstes

- [ ] `RDAP_DASHBOARD1_PROTECTED_SHELL` planen/bauen
- [ ] Geschützte Dashboard-Shell mit Sidebar und Useranzeige bauen
- [ ] Erste geschützte read-only Dashboard-Seiten einhängen

## Weiterhin verboten bis eigener Scope

- [ ] Keine Remote-Writes
- [ ] Keine Agent-Actions
- [ ] Keine OBS-Steuerung
- [ ] Keine Sound-Steuerung
- [ ] Keine Overlay-Steuerung
- [ ] Keine Command-Steuerung
- [ ] Keine Migration ohne Backup/Rollback/Go
- [ ] Keine Secrets ins Repo/Frontend/Chat/Logs
