# RDAP Workflow Addendum - Remote Modboard

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

Diese Datei ist Pflichtkontext zusätzlich zum Master-Prompt für alle Arbeiten am `stream-control-center` / RDAP Remote-Modboard.

## 1. Grundpfade

Lokales Repo auf dem Stream-PC:

```text
D:\Git\stream-control-center
```

Immer zuerst dort arbeiten:

```powershell
cd D:\Git\stream-control-center
```

Live-System auf dem Stream-PC:

```text
D:\Streaming\stramAssets
```

Webserver Remote-Modboard:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
/opt/stream-control-center/_deploy_tmp
/opt/stream-control-center/_runtime_tmp
```

Wichtig:

```text
/opt/stream-control-center ist KEIN Git-Repo.
```

Dort niemals `git pull` ausführen.

Remote-Modboard live:

```text
https://mods.forrestcgn.de/
```

Remote-Modboard intern auf dem Webserver:

```text
http://127.0.0.1:3010
```

Systemd-Service:

```text
scc-remote-modboard.service
```

## 2. GitHub / Branch

Repo:

```text
ForrestCGN/stream-control-center
```

Branch:

```text
dev
```

GitHub/dev ist Source of Truth.

Vor neuen Änderungen lokal prüfen:

```powershell
cd D:\Git\stream-control-center
git status
git branch
git log --oneline -5
```

## 3. ZIP-Step lokal einspielen

ZIPs werden aus dem Download-Ordner eingespielt, nicht vom Desktop.

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "Kurze Beschreibung des Steps"
```

Danach prüfen.

Beispiele für JS/Node-Checks:

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\auth-status.service.js
```

Wenn alles sauber ist:

```powershell
.\stepdone.cmd "Kurze Abschlussbeschreibung: was wurde bestätigt"
```

Wenn etwas kaputt ist:

```powershell
.\stepundo.cmd
```

## 4. Verbindliche Step-Reihenfolge

Immer diese Reihenfolge:

1. ZIP herunterladen.
2. `installstep.cmd` ausführen.
3. Lokale Checks/Tests ausführen.
4. Wenn sauber: `stepdone.cmd`.
5. Erst danach Webserver-Deploy.

Wichtig:

```text
stepdone.cmd erst nach Einspielen und Test ausführen, nicht vorher.
Webserver-Deploy erst nach stepdone/GitHub-dev-Push empfehlen.
```

## 5. Webserver-Deploy

Auf dem Webserver wird immer frisch aus GitHub/dev nach `_deploy_tmp` geklont.

Allgemeines Muster:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Beispiel:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
cd RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
sudo bash tools/remote-modboard-deploy.sh RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN dev
```

Verboten:

```bash
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

Dieser Pfad darf nicht angenommen werden. `/opt/stream-control-center` ist kein Git-Repo und enthält nicht automatisch `tools/`.

## 6. Nach Service-Restart immer Readiness-Check

Nicht sofort blind testen.

```bash
systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Status prüfen:

```bash
systemctl status scc-remote-modboard.service --no-pager
```

Logs bei Fehler:

```bash
journalctl -u scc-remote-modboard.service -n 120 --no-pager
```

## 7. Live-Tests Webserver

Public Status:

```bash
curl -fsS https://mods.forrestcgn.de/api/remote/status | jq
```

Auth-Status:

```bash
curl -fsS https://mods.forrestcgn.de/api/remote/status | jq '.auth.enabled,.auth.loginEnabled,.auth.twitchOAuth.effectiveEnabled,.auth.sessions.effectiveEnabled'
```

Login-Start prüfen:

```bash
curl -I https://mods.forrestcgn.de/api/remote/auth/twitch/start
```

Erwartung bei aktivem OAuth:

```text
HTTP/2 302
location: https://id.twitch.tv/oauth2/authorize...
```

Erwartung bei deaktiviertem/gated OAuth:

```text
HTTP/2 403
```

Browser-Test:

```text
https://mods.forrestcgn.de/
```

Wichtig:

```text
curl /auth/me zeigt ohne Browser-Cookie oft loggedIn:false.
Das ist normal, weil curl keine Browser-Session mitschickt.
```

## 8. Server-Env

Produktive Env-Datei:

```text
/etc/stream-control-center/remote-modboard.env
```

Öffnen:

```bash
nano /etc/stream-control-center/remote-modboard.env
```

Danach Service neu starten:

```bash
systemctl restart scc-remote-modboard.service
```

Secrets rotieren:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Wichtig:

```text
Secrets niemals in Chat, Repo, Frontend oder Logs posten.
```

## 9. Doku-Dateien aktuell halten

Bei Abschluss, Handoff oder Chatwechsel prüfen und aktualisieren:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Für aktuelle RDAP-Übergabe zusätzlich:

```text
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AUTH_DASHBOARD_DESIGN.md
```

## 10. Verbotene Dinge ohne eigenen Scope

Bis ausdrücklich geplant und freigegeben:

- Keine Remote-Writes
- Keine Agent-Actions
- Keine OBS-Steuerung
- Keine Sound-Steuerung
- Keine Overlay-Steuerung
- Keine Command-Steuerung
- Keine Migration ohne Backup/Rollback/Go
- Keine Secrets ins Repo/Frontend/Chat/Logs
- Keine freien Shell-/Datei-/Prozessbefehle
- Keine losen Patch-Dateien
- Keine Regex-Schnellfixes auf produktive Dateien
- Keine Funktionalität entfernen

## 11. Gewünschte Arbeitsweise im Chat

1. Erst echten Dateistand prüfen.
2. GitHub/dev oder bereitgestellte ZIP/Dateien als Wahrheit nehmen.
3. Keine Annahmen über vorhandene Dateien.
4. Bei fehlenden Dateien exakt nach dem benötigten Pfad fragen.
5. Erst Informationen sammeln und Plan nennen.
6. Auf `go` warten.
7. Dann vollständigen ZIP-Step bauen.
8. Danach konkrete Befehle geben:
   - `installstep.cmd`
   - Checks
   - `stepdone.cmd`
   - Webserver-Deploy
   - Live-Test
9. Keine Mini-Schritte ohne sichtbaren Fortschritt, wenn ein sinnvoller kompletter Step möglich ist.
10. Wenn Design betroffen ist: nicht frei improvisieren, sondern echte Designbasis im Repo prüfen.

## 12. Aktueller RDAP-Stand

Bestätigt:

- Remote-Modboard läuft live auf `https://mods.forrestcgn.de/`.
- Twitch Login funktioniert live.
- Browser zeigte: `Angemeldet als ForrestCGN`.
- Auth/OAuth/Sessions sind aktiv.

Offen:

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, weil die ersten Werte im Chat sichtbar waren.
- Dashboard1/2 wurden begonnen, aber Design entspricht noch nicht dem geplanten CGN-/Vision-UI-/Neon-Galaxy-Look.

Nächster sinnvoller Funktions-/Design-Step:

```text
RDAP_DESIGN1_REAL_CGN_BASE
```

Dabei zuerst echte Designbasis im Repo prüfen:

```text
dashboard-v2
vorhandene CGN-/Neon-Galaxy-Dateien
_overlay-start-v2-neon-galaxy.html
vorhandene Dashboard-/Overlay-CSS/HTML-Strukturen
```

Danach erst mit `go` einen neuen ZIP-Step bauen.

## 13. Zielarchitektur Login

Später soll der Login zentral laufen und beide Einstiege unterstützen:

```text
forrestcgn.de / zentrale Login-Seite
oder
mods.forrestcgn.de / Login-Einstieg
-> beide nutzen dieselbe zentrale Auth-/Session-Schicht
-> zentrale Session in DB
-> mods.forrestcgn.de übernimmt/prueft Session serverseitig
-> Modboard zeigt Dashboard nur bei passender Rolle/Recht
```

Gewünschter Flow:

```text
Nicht eingeloggt
-> Login-Seite

Eingeloggt, aber nicht berechtigt
-> Access-Denied + Ausloggen/zurück

Eingeloggt + berechtigt
-> Dashboard
```

Berechtigungen später:

- Owner / Streamer
- Mods
- Spezialrollen wie Sound-Profi

Sicherheitsregel:

```text
Keine Login-Daten, Session-IDs, Twitch-Tokens oder Secrets im Frontend, Link, Chat, Repo oder Log.
Sessionprüfung und Rechteprüfung passieren serverseitig.
```
