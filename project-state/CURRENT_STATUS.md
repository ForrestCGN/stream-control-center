# CURRENT STATUS - stream-control-center

Stand: RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
Datum: 2026-06-24

## Aktueller Stand

```text
RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
```

## Inhalt

Dashboard2 ergänzt:

- Login-Seite ohne Dashboard, wenn nicht angemeldet
- Access-Denied-Seite, wenn angemeldet aber nicht freigegeben
- Dashboard nur bei `dashboardAccess=true`
- Serverentscheidung über `/api/remote/auth/me`
- CGN-/Neon-Galaxy-Designrichtung stärker umgesetzt

## Zugang

Initial erlaubt:

```text
forrestcgn
```

Später sollen Mods/Spezialrollen sauber über Rollen/Rechte folgen.

## Weiterhin deaktiviert

- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration
