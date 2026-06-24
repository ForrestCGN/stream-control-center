# RDAP Handoff - Auth live, Dashboard2 stockt

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Kurzfassung

Der Remote-Modboard/Auth-Teil ist deutlich weiter:

- `mods.forrestcgn.de` läuft
- Remote-Modboard Deploy-Script funktioniert im Repo unter `tools/remote-modboard-deploy.sh`
- Twitch Login funktioniert live
- Browser zeigte: `Angemeldet als ForrestCGN`
- Auth/OAuth/Sessions sind aktiv
- Dashboard1/2 wurden gebaut, aber Design entspricht noch nicht dem geplanten CGN-/Vision-UI-/Neon-Galaxy-Ziel

Zusätzlich wurde die verbindliche RDAP-Arbeitsweise korrigiert und dokumentiert.

## Wichtig: korrigierter Webserver-Deploy

`/opt/stream-control-center` ist kein Git-Repo. Deshalb nicht verwenden:

```bash
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

Korrekt ist immer ein frischer Clone nach `_deploy_tmp`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

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

Aber: Es ist laut Forrest noch nicht das geplante Design.

Nicht weiter frei CSS/HTML bauen. Stattdessen echte Designbasis nehmen:

- `dashboard-v2`
- Vision-UI-/Neon-Galaxy-Ziel
- `_overlay-start-v2-neon-galaxy.html`
- vorhandene CGN-Dashboard-/Overlay-Design-Dateien im Repo
- hochgeladene Design-Test-Basis `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip` als optische Referenz, wenn im Chat verfügbar

## Fachliche Login-Zielidee

Später soll nicht jedes Subsystem einen eigenen Login haben.

Ziel:

```text
Hauptseite/Login zentral
oder Login-Einstieg direkt über mods.forrestcgn.de
-> beide nutzen dieselbe zentrale Auth-/Session-Schicht
-> zentrale Session in DB
-> mods.forrestcgn.de übernimmt/prueft Session serverseitig
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

## Nächster sinnvoller Start

Nicht weiter am aktuellen Dashboard2-Design herumprobieren.

Nächster Chat / nächster Step soll:

1. GitHub/dev prüfen
2. aktuelle Dateien aus Repo als Wahrheit nehmen
3. Auth-Stand bestätigen
4. Secrets-Rotation als offen prüfen
5. Designbasis im Repo finden/prüfen
6. erst dann `RDAP_DESIGN1_REAL_CGN_BASE` planen
7. danach `RDAP_AUTH2_CENTRAL_LOGIN_READY` bzw. zentrale Auth-Schicht weiterführen, falls noch nicht sauber abgeschlossen
