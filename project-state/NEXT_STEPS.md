# NEXT STEPS - stream-control-center

Stand: RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
Datum: 2026-06-24

## Im neuen Chat zuerst

1. GitHub/dev als Source of Truth prüfen
2. `docs/current/START_HERE_FOR_NEW_CHAT.md` lesen
3. aktuellen Auth-/Dashboard-Stand anhand Repo-Dateien prüfen
4. nicht raten, keine losen Patches
5. echte Designbasis suchen/prüfen

## Sofort prüfen

Secrets rotieren:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

## Nächste geplante Steps

### RDAP_DESIGN1_REAL_CGN_BASE

Ziel:

- echtes CGN-/Vision-UI-/Neon-Galaxy-Design
- Designbasis aus bestehenden Repo-/Projektdateien übernehmen
- keine weiteren frei erfundenen CSS-Versuche

### RDAP_AUTH2_CENTRAL_LOGIN_READY

Ziel:

- Modboard-Login als Übergang dokumentieren
- späteren Hauptseiten-/Zentral-Login vorbereiten
- Return-To/Redirect-Konzept
- gemeinsame Session-/Cookie-Strategie für `forrestcgn.de` und `mods.forrestcgn.de`

### RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

Ziel:

- Owner/Streamer/Mods/Sound-Profi sichtbar und verwaltbar planen
- noch keine produktiven Actions
