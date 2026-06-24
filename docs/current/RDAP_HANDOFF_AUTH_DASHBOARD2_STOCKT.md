# RDAP Handoff - Auth live, Dashboard2 stockt

Stand: RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
Datum: 2026-06-24

## Kurzfassung

Der Remote-Modboard/Auth-Teil ist deutlich weiter:

- `mods.forrestcgn.de` läuft
- Remote-Modboard Deploy-Script funktioniert
- Twitch Login funktioniert live
- Browser zeigte: `Angemeldet als ForrestCGN`
- Auth/OAuth/Sessions sind aktiv
- Dashboard1/2 wurden gebaut, aber Design entspricht noch nicht dem geplanten CGN-/Vision-UI-/Neon-Galaxy-Ziel
- Der aktuelle Chat stockt; neuer Chat soll sauber mit Bestandsaufnahme starten

## Bestätigter Auth-Stand

Live-URL:

```text
https://mods.forrestcgn.de/
```

Bestätigt:

```text
.auth.enabled = true
.auth.loginEnabled = true
.auth.twitchOAuth.effectiveEnabled = true
.auth.sessions.effectiveEnabled = true
```

Browser zeigte:

```text
Angemeldet als ForrestCGN
```

OAuth Start:

```text
GET /api/remote/auth/twitch/start -> HTTP 302 zu Twitch
```

## Wichtige Sicherheitsnotiz

Die zuerst erzeugten `SESSION_SECRET` und `OAUTH_STATE_SECRET` wurden im Chat sichtbar. Diese müssen auf dem Server rotiert werden:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach ggf. erneut im Browser einloggen.

## Aktueller Problemstand Dashboard2

Dashboard2 hat funktional begonnen:

- Login-Seite
- Access-Denied-Konzept
- Dashboard nur bei Freigabe
- stärkere CGN-Optik versucht

Aber: Es ist laut Forrest **noch nicht das geplante Design**.

Nicht weiter frei CSS/HTML „aus dem Kopf“ bauen. Stattdessen echte Designbasis nehmen:

- `dashboard-v2`
- Vision-UI-/Neon-Galaxy-Ziel
- `_overlay-start-v2-neon-galaxy.html`
- vorhandene CGN-Dashboard-/Overlay-Design-Dateien im Repo

## Fachliche Login-Zielidee

Später soll nicht jedes Subsystem einen eigenen Login haben.

Ziel:

```text
Hauptseite/Login zentral
-> User loggt sich auf Hauptseite / zentralem Auth-Bereich ein
-> zentrale Session in DB
-> Cookie/Session kann von mods.forrestcgn.de übernommen/geprüft werden
-> Modboard zeigt Dashboard nur für berechtigte Mods/Streamer/Owner
```

Modboard-Login ist aktuell eine Übergangslösung.

## Gewünschter Flow

```text
Nicht eingeloggt
-> reine Login-Seite, kein Dashboard

Eingeloggt, aber nicht berechtigt
-> Access-Denied mit Ausloggen/zurück

Eingeloggt + berechtigt
-> Dashboard
```

Berechtigungen später:

- Owner / Streamer
- Mods
- Spezialrollen wie Sound-Profi

## Aktuelle technische Einschränkungen

Weiterhin nicht aktivieren:

- Remote-Writes
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Migration ohne eigenes Go
- Secrets im Repo/Frontend/Chat/Logs

## Nächster sinnvoller Start im neuen Chat

Nicht weiter am aktuellen Dashboard2-Design herumprobieren.

Neuer Chat soll:

1. GitHub/dev prüfen
2. aktuelle Dateien aus Repo als Wahrheit nehmen
3. Auth-Stand bestätigen
4. Secrets-Rotation als offen prüfen
5. Designbasis im Repo finden/prüfen
6. erst dann `RDAP_DESIGN1_REAL_CGN_BASE` planen
7. danach `RDAP_AUTH2_CENTRAL_LOGIN_READY` planen
