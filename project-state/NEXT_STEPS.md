# NEXT STEPS - stream-control-center

Stand: RDAP_DESIGN1C_TRUE_V13_PORT / RDAP_DESIGN1C_DOCS_FINALIZE
Datum: 2026-06-24

## Sofort prüfen

Falls noch nicht erledigt:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach Readiness:

```bash
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

## EngelCGN Testzugriff

Wenn EngelCGN testen soll, in `/etc/stream-control-center/remote-modboard.env` prüfen/setzen:

```env
DASHBOARD_ALLOWED_LOGINS=forrestcgn,engelcgn
```

Danach Service neu starten und Browser-Test durchführen.

## Nächste geplante Arbeit

### RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

Ziel:

- aktuelle `.env`-Allowlist sichtbar machen bzw. in Richtung verwaltbarer Rechte überführen
- User-/Rollen-/Rechte-Übersicht planen
- Owner/Streamer/Mods/Sound-Profi sauber unterscheiden
- Access-Denied verständlich halten
- keine produktiven Remote-Actions aktivieren

Betroffene Bereiche voraussichtlich:

```text
remote-modboard/backend/src/services/auth-*.js
remote-modboard/backend/src/routes/auth-*.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
docs/modules/remote-modboard-auth.md
project-state/*.md
```

Vor Umsetzung zuerst echten Dateistand prüfen und auf GO warten.

## Später

### Zentraler Login / gemeinsame DB-Session-Schicht

Zielarchitektur:

```text
forrestcgn.de/login
oder
mods.forrestcgn.de/login
↓
gleiche serverseitige Auth-/Session-Schicht
gleiche DB-Wahrheit für dashboard_users/dashboard_identities/dashboard_sessions
↓
mods.forrestcgn.de prüft Session + Rechte
```

Keine Login-Daten/Tokens im Frontend oder in URLs weiterreichen. Nur kurzlebige Redirect-/ReturnTo-Flows und serverseitige Sessionprüfung.

## Webserver-Deploy-Regel bleibt verbindlich

Erst nach lokalem `installstep.cmd`, Test und `stepdone.cmd`.

Auf dem Webserver immer frisch klonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nicht verwenden:

```text
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```
