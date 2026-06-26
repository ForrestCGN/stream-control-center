#!/usr/bin/env bash
set -euo pipefail

STEP="${1:-}"
BRANCH="${2:-dev}"

BASE="/opt/stream-control-center"
LIVE="$BASE/remote-modboard"
SERVICE="scc-remote-modboard.service"
REPO_URL="https://github.com/ForrestCGN/stream-control-center.git"

if [ -z "$STEP" ]; then
  echo "[fehler] Usage: bash tools/remote-modboard-deploy.sh <STEP_NAME> [branch]"
  echo "[beispiel] bash tools/remote-modboard-deploy.sh RDAP_UI2_READONLY_COMFORT dev"
  exit 2
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "[fehler] Dieses Script muss als root laufen. Kein sudo verwenden; als root ausfuehren."
  exit 2
fi

case "$STEP" in
  *[!A-Za-z0-9._-]*|"")
    echo "[fehler] STEP darf nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich enthalten."
    exit 2
    ;;
esac

case "$BRANCH" in
  *[!A-Za-z0-9._/-]*|"")
    echo "[fehler] Branch/ref enthaelt ungueltige Zeichen."
    exit 2
    ;;
esac

TS="$(date +%Y%m%d_%H%M%S)"
DEPLOY_TMP="$BASE/_deploy_tmp/${STEP}_${TS}"
BACKUP="$BASE/_runtime_tmp/backup_remote_modboard_${STEP}_${TS}"
SERVER_TOOLS_SRC="$DEPLOY_TMP/tools/server"
SERVER_TOOLS_LIVE="$BASE/tools/server"

echo "============================================================"
echo "[remote-modboard-deploy] Start"
echo "============================================================"
echo "STEP=$STEP"
echo "BRANCH=$BRANCH"
echo "BASE=$BASE"
echo "LIVE=$LIVE"
echo "DEPLOY_TMP=$DEPLOY_TMP"
echo "BACKUP=$BACKUP"
echo "SERVER_TOOLS_LIVE=$SERVER_TOOLS_LIVE"
echo "SERVICE=$SERVICE"

echo
echo "=== Safety Checks ==="
if [ -d "$BASE/.git" ]; then
  echo "[fehler] $BASE darf kein Git-Repo sein. Erwartet wird nur Runtime-Struktur mit remote-modboard/_deploy_tmp/_runtime_tmp."
  exit 1
fi

if [ ! -d "$LIVE" ]; then
  echo "[fehler] Live-Ziel fehlt: $LIVE"
  exit 1
fi

if [ ! -f "$LIVE/backend/server.js" ]; then
  echo "[fehler] Live Backend fehlt oder falscher Pfad: $LIVE/backend/server.js"
  exit 1
fi

mkdir -p "$BASE/_deploy_tmp" "$BASE/_runtime_tmp"

echo
echo "=== 1) GitHub/dev frisch klonen ==="
git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$DEPLOY_TMP"

echo
echo "=== 2) Deploy-Inhalt pruefen ==="
test -d "$DEPLOY_TMP/remote-modboard"
test -f "$DEPLOY_TMP/remote-modboard/backend/server.js"
test -f "$DEPLOY_TMP/remote-modboard/backend/src/app.js"
test -f "$DEPLOY_TMP/remote-modboard/backend/package.json"

echo
echo "=== 3) Aktuellen Live-Stand sichern ==="
mkdir -p "$BACKUP"
rsync -a "$LIVE/" "$BACKUP/"

echo
echo "=== 4) remote-modboard nach Live synchronisieren ==="
rsync -a --delete \
  --exclude "node_modules" \
  --exclude ".env" \
  --exclude ".git" \
  "$DEPLOY_TMP/remote-modboard/" "$LIVE/"

echo
echo "=== 5) Server-Hilfsscripte installieren ==="
if [ -d "$SERVER_TOOLS_SRC" ]; then
  mkdir -p "$SERVER_TOOLS_LIVE"
  rsync -a --delete "$SERVER_TOOLS_SRC/" "$SERVER_TOOLS_LIVE/"
  find "$SERVER_TOOLS_LIVE" -type f -name "*.sh" -exec chmod 0755 {} \;
  echo "[ok] Server-Hilfsscripte installiert: $SERVER_TOOLS_LIVE"
else
  echo "[info] Keine Server-Hilfsscripte im Repo gefunden: $SERVER_TOOLS_SRC"
fi

echo
echo "=== 6) Rechte setzen ==="
chown -R sccremote:sccremote "$LIVE"

echo
echo "=== 7) JS-Syntaxcheck ==="
cd "$LIVE/backend"
node --check server.js
node --check src/app.js

if [ -f package.json ]; then
  node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
fi

echo
echo "=== 8) Service neu starten ==="
systemctl restart "$SERVICE"

echo
echo "=== 9) Readiness warten ==="
READY=0
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "[fehler] Service wurde nicht rechtzeitig bereit."
  systemctl status "$SERVICE" --no-pager || true
  echo "Backup liegt hier: $BACKUP"
  exit 1
fi

echo
echo "=== 10) Lokale API testen ==="
curl -fsS http://127.0.0.1:3010/api/remote/status | head -c 500
echo
curl -fsS http://127.0.0.1:3010/api/remote/routes | head -c 500
echo

echo
echo "=== 11) Lokale UI testen ==="
curl -fsSI http://127.0.0.1:3010/ | head

echo
echo "=== 12) Public UI/API testen ==="
curl -fsSI https://mods.forrestcgn.de/ | head
curl -fsS https://mods.forrestcgn.de/api/remote/status | head -c 500
echo

echo
echo "=== 13) OAuth/Login Safety testen ==="
START_CODE="$(curl -s -o /dev/null -w "%{http_code}" https://mods.forrestcgn.de/api/remote/auth/twitch/start)"
CALLBACK_CODE="$(curl -s -o /dev/null -w "%{http_code}" https://mods.forrestcgn.de/api/remote/auth/twitch/callback)"
echo "twitch/start HTTP $START_CODE"
echo "twitch/callback HTTP $CALLBACK_CODE"

case "$START_CODE" in
  302)
    echo "[ok] Twitch-Start liefert 302: Login/OAuth-Start ist bewusst aktiv/freigegeben."
    ;;
  403)
    echo "[ok] Twitch-Start liefert 403: Login/OAuth-Start ist gesperrt."
    ;;
  *)
    echo "[fehler] Unerwarteter Twitch-Start-Status. Erwartet 302 bei aktivem Login oder 403 bei gesperrtem Login."
    echo "Backup liegt hier: $BACKUP"
    exit 1
    ;;
esac

if [ "$CALLBACK_CODE" != "403" ]; then
  echo "[fehler] OAuth Callback ohne gueltigen State muss 403 bleiben."
  echo "Backup liegt hier: $BACKUP"
  exit 1
fi

echo
echo "============================================================"
echo "[ok] Remote-Modboard Deploy fertig"
echo "============================================================"
echo "Backup liegt hier: $BACKUP"
echo "Deploy-Clone liegt hier: $DEPLOY_TMP"
echo "Server-Hilfsscripte liegen hier: $SERVER_TOOLS_LIVE"
