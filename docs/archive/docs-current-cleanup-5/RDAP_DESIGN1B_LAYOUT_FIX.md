# RDAP_DESIGN1B_LAYOUT_FIX

Datum: 2026-06-24

## Zweck

Korrektur des ersten Design-Steps `RDAP_DESIGN1_REAL_CGN_BASE`.

Der erste Designstand wirkte im Browser noch nicht wie die gewuenschte Dashboard-v2-/Design-Test-v13-Richtung. Die Navigation war zu gross und sass optisch wie Content-Karten im Hauptbereich statt als kompakte Sidebar.

## Geaendert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

## Design-Ziel

- feste Topbar wie Design-Test v13
- kompakte linke Sidebar
- Sidebar-Navigation nicht als grosse Content-Karten
- Galaxy-Hintergrund und Glass-Cards
- Status-Chips in der Topbar
- Content-Bereich sauber neben der Sidebar
- Login-/Denied-Seiten im gleichen Stil

## Nicht geaendert

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/src/**
remote-modboard/backend/server.js
remote-modboard/backend/package.json
```

Keine Aenderung an:

- Auth-/Login-Logik
- OAuth
- Sessions
- Datenbank
- Backend-Routen
- Remote-Writes
- Agent-Actions
- OBS-/Sound-/Overlay-/Command-Steuerung

## Tests

Lokal nach `installstep.cmd`:

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Browser:

```text
https://mods.forrestcgn.de/
```

Erwartung:

- Topbar oben kompakt/fest
- Sidebar links kompakt
- Navigation nicht mehr als riesige Karten im Content
- Login/Access-Gate funktioniert weiter
- Status/Diagnose/Routen laden weiter
- Remote-Writes bleiben false
- Agent-Actions bleiben disabled
