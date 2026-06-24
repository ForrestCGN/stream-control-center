# CURRENT STATUS - stream-control-center

Stand: RDAP_DESIGN1B_LAYOUT_FIX
Datum: 2026-06-24

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft
- Twitch Login funktioniert live
- ForrestCGN konnte sich im Browser anmelden
- Auth/OAuth/Sessions aktiv
- Workflow-Fix ist auf GitHub/dev dokumentiert

## Aktueller Arbeitsstand

`RDAP_DESIGN1B_LAYOUT_FIX` korrigiert den ersten Designstand:

- feste Topbar nach Dashboard-v2 Design-Test v13
- kompakte linke Sidebar
- Navigation nicht mehr als grosse aufgeblasene Content-Karten
- Content-Bereich sauber neben der Sidebar
- Galaxy-/Glassmorphism-Look bleibt erhalten

## Geändert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

## Nicht geändert

- Backend/Auth/DB/Routen
- `remote-modboard/backend/public/assets/remote-modboard.js`
- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung

## Sofort offen

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, da sie im Chat sichtbar waren
- Nach Rotation Service neu starten
- Browser ggf. erneut einloggen
- `RDAP_DESIGN1B_LAYOUT_FIX` lokal installieren, testen, `stepdone.cmd`, danach Webserver-Deploy aus frischem Clone

## Weiterhin deaktiviert

- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration
