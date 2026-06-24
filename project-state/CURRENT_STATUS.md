# CURRENT STATUS - stream-control-center

Stand: RDAP_DESIGN1C_TRUE_V13_PORT / RDAP_DESIGN1C_DOCS_FINALIZE
Datum: 2026-06-24

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- ForrestCGN konnte sich im Browser anmelden.
- Auth/OAuth/Sessions sind aktiv.
- EngelCGN soll zum Testen freigeschaltet werden bzw. ist über `DASHBOARD_ALLOWED_LOGINS=forrestcgn,engelcgn` freischaltbar.
- Workflow-Fix ist auf GitHub/dev dokumentiert.

## Designstand

`RDAP_DESIGN1C_TRUE_V13_PORT` ist der bestätigte Designstand.

Der vorherige Stand `RDAP_DESIGN1B_LAYOUT_FIX` war noch nicht ausreichend 1:1 zur gewünschten Designbasis. `RDAP_DESIGN1C_TRUE_V13_PORT` ist der gültige V13-Port und ersetzt die vorherigen Design-Zwischenstände als neue Basis.

Bestätigte Richtung:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE
CGN-/Neon-Galaxy
V13-Topbar
V13-Sidebar/Accordion
V13-Card-/Chip-Struktur
```

## Design1C betroffene Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Bewusst nicht geändert

- Backend/Auth/DB/Routen
- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration

## Sofort offen

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten.
- Browser ggf. erneut einloggen.
- EngelCGN-Zugriff prüfen, falls sie testen soll.

## Nächster sinnvoller Schritt

`RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI`

Ziel:

- Owner/Streamer/Mods/Sound-Profi sichtbar und später verwaltbar machen.
- Weg von reiner `.env`-Allowlist als Bedienlösung.
- Zentrale Login-/Session-/DB-Wahrheit weiter vorbereiten.
- Noch keine produktiven Remote-Actions aktivieren.

## Weiterhin deaktiviert

- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration
