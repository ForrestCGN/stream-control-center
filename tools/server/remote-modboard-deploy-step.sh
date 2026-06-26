#!/usr/bin/env bash
set -euo pipefail

STEP="${1:-}"
BRANCH="${2:-dev}"

BASE="/opt/stream-control-center"
DEPLOY_TMP="$BASE/_deploy_tmp"
REPO_URL="https://github.com/ForrestCGN/stream-control-center.git"
TARGET="$DEPLOY_TMP/$STEP"

echo "============================================================"
echo "[remote-modboard-deploy-step] Start"
echo "============================================================"

if [ -z "$STEP" ]; then
  echo "[fehler] Usage: bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> [branch]"
  echo "[beispiel] bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP105_NEXT_STEP dev"
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

if [ ! -d "$BASE" ]; then
  echo "[fehler] BASE fehlt: $BASE"
  exit 1
fi

if [ -d "$BASE/.git" ]; then
  echo "[fehler] $BASE darf kein Git-Repo sein. RDAP nutzt _deploy_tmp/_runtime_tmp und gezieltes rsync."
  exit 1
fi

mkdir -p "$DEPLOY_TMP"

case "$TARGET" in
  "$DEPLOY_TMP"/*) ;;
  *)
    echo "[fehler] Unsicherer TARGET-Pfad: $TARGET"
    exit 1
    ;;
esac

echo "STEP=$STEP"
echo "BRANCH=$BRANCH"
echo "DEPLOY_TMP=$DEPLOY_TMP"
echo "TARGET=$TARGET"

echo
echo "=== 1) Alten Wrapper-Clone fuer diesen STEP entfernen ==="
rm -rf -- "$TARGET"

echo
echo "=== 2) GitHub/dev frisch nach _deploy_tmp klonen ==="
cd "$DEPLOY_TMP"
git clone --depth 1 --branch "$BRANCH" --single-branch "$REPO_URL" "$STEP"

echo
echo "=== 3) Deploy-Engine aus frischem Clone starten ==="
cd "$TARGET"
test -f tools/remote-modboard-deploy.sh
bash tools/remote-modboard-deploy.sh "$STEP" "$BRANCH"

echo
echo "=== 4) Backup-/Deploy-Cleanup ausfuehren ==="
if [ -f "$BASE/tools/server/remote-modboard-cleanup-backups.sh" ]; then
  bash "$BASE/tools/server/remote-modboard-cleanup-backups.sh"
elif [ -f "$TARGET/tools/server/remote-modboard-cleanup-backups.sh" ]; then
  bash "$TARGET/tools/server/remote-modboard-cleanup-backups.sh"
else
  echo "[warn] Cleanup-Script noch nicht gefunden; nach RDAP104-Deploy sollte es unter $BASE/tools/server liegen."
fi

echo
echo "============================================================"
echo "[ok] remote-modboard-deploy-step fertig"
echo "============================================================"
