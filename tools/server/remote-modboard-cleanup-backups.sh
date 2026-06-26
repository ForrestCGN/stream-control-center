#!/usr/bin/env bash
set -euo pipefail

BASE="${SCC_BASE:-/opt/stream-control-center}"
RUNTIME_TMP="$BASE/_runtime_tmp"
DEPLOY_TMP="$BASE/_deploy_tmp"
KEEP_BACKUPS="${KEEP_BACKUPS:-6}"
KEEP_DEPLOY_TMP="${KEEP_DEPLOY_TMP:-6}"

echo "================================================------------"
echo "[remote-modboard-cleanup] Start"
echo "================================================------------"

if [ "$(id -u)" -ne 0 ]; then
  echo "[fehler] Dieses Script muss als root laufen. Kein sudo verwenden; als root ausfuehren."
  exit 2
fi

case "$KEEP_BACKUPS" in
  ''|*[!0-9]*)
    echo "[fehler] KEEP_BACKUPS muss eine Zahl sein."
    exit 2
    ;;
esac

case "$KEEP_DEPLOY_TMP" in
  ''|*[!0-9]*)
    echo "[fehler] KEEP_DEPLOY_TMP muss eine Zahl sein."
    exit 2
    ;;
esac

cleanup_dirs() {
  local label="$1"
  local dir="$2"
  local pattern="$3"
  local keep="$4"

  echo
  echo "=== $label ==="
  echo "dir=$dir"
  echo "pattern=$pattern"
  echo "keep=$keep"

  if [ ! -d "$dir" ]; then
    echo "[ok] Ordner existiert nicht, nichts zu tun."
    return 0
  fi

  mapfile -t entries < <(find "$dir" -mindepth 1 -maxdepth 1 -type d -name "$pattern" -printf '%T@ %p\n' 2>/dev/null | sort -rn)

  local count="${#entries[@]}"
  echo "found=$count"

  if [ "$count" -le "$keep" ]; then
    echo "[ok] Anzahl <= keep, nichts wird geloescht."
    if [ "$count" -gt 0 ]; then
      echo "behalten:"
      for entry in "${entries[@]}"; do
        echo "  ${entry#* }"
      done
    fi
    return 0
  fi

  echo "behalten:"
  local i=0
  for entry in "${entries[@]}"; do
    i=$((i + 1))
    local path="${entry#* }"
    if [ "$i" -le "$keep" ]; then
      echo "  $path"
    fi
  done

  echo "loeschen:"
  i=0
  for entry in "${entries[@]}"; do
    i=$((i + 1))
    local path="${entry#* }"
    if [ "$i" -le "$keep" ]; then
      continue
    fi

    case "$path" in
      "$dir"/*)
        echo "  $path"
        rm -rf -- "$path"
        ;;
      *)
        echo "[fehler] Unsicherer Pfad ausserhalb von $dir: $path"
        exit 1
        ;;
    esac
  done
}

mkdir -p "$RUNTIME_TMP" "$DEPLOY_TMP"

cleanup_dirs "Remote-Modboard Live-Backups" "$RUNTIME_TMP" "backup_remote_modboard_*" "$KEEP_BACKUPS"
cleanup_dirs "RDAP Deploy-Clones" "$DEPLOY_TMP" "RDAP*" "$KEEP_DEPLOY_TMP"

echo
echo "================================================------------"
echo "[ok] remote-modboard-cleanup fertig"
echo "================================================------------"
