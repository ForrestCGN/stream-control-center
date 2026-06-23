# RDAP5H - Command Notes

Status: Befehlsnotizen, kein Auto-Install-Script.

## Lesetest vor Installation

```bash
whoami
pwd
node -v
npm -v
mysql --version
which node
ls -la /opt
ls -la /etc/stream-control-center 2>/dev/null || true
nginx -T | grep -n "mods.forrestcgn.de" -A 30 -B 10
```

## Spaetere Zielpfade anlegen

Nur nach separatem Go:

```bash
mkdir -p /opt/stream-control-center/remote-modboard
mkdir -p /etc/stream-control-center
```

## Service-User spaeter

Nur nach separatem Go und wenn noch nicht vorhanden:

```bash
id sccremote || useradd --system --home /opt/stream-control-center/remote-modboard --shell /usr/sbin/nologin sccremote
```

## ENV-Datei spaeter

```bash
cp remote-modboard/deploy/env/remote-modboard.env.example /etc/stream-control-center/remote-modboard.env
nano /etc/stream-control-center/remote-modboard.env
chown root:sccremote /etc/stream-control-center/remote-modboard.env
chmod 640 /etc/stream-control-center/remote-modboard.env
```

Passwort nur direkt auf dem Server eintragen, nicht ins Repo, nicht in den Chat.

## npm install spaeter

Nur im separaten Remote-Paket:

```bash
cd /opt/stream-control-center/remote-modboard/backend
npm install --omit=dev
npm run check
```

Nicht im Repo-Root ausfuehren, wenn es um den Remote-Webserver-Service geht.

## Lokaler Service-Test spaeter

```bash
cd /opt/stream-control-center/remote-modboard/backend
REMOTE_MODBOARD_ENV_FILE=/etc/stream-control-center/remote-modboard.env node server.js
```

In zweiter SSH-Session:

```bash
curl -sS http://127.0.0.1:3010/api/remote/health
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/routes
```

## systemd spaeter

```bash
cp remote-modboard/deploy/systemd/scc-remote-modboard.service.example /etc/systemd/system/scc-remote-modboard.service
systemctl daemon-reload
systemctl start scc-remote-modboard
systemctl status scc-remote-modboard --no-pager
```

Enable erst nach erfolgreichem Test:

```bash
systemctl enable scc-remote-modboard
```

## nginx spaeter

Erst echten vhost pruefen. Dann Snippet passend einbinden.

```bash
nginx -t
systemctl reload nginx
```

## Rollback spaeter

```bash
systemctl stop scc-remote-modboard
systemctl disable scc-remote-modboard
# nginx snippet entfernen/auskommentieren
nginx -t
systemctl reload nginx
```
