# Remote Modboard - Server Install Handoff

Stand: RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE  
Status: Handoff/Doku, keine automatische Installation

## Ziel

Dieses Verzeichnis enthaelt Vorlagen und Befehlsnotizen fuer die spaetere Installation des Remote-Modboard-Node-Service auf:

```text
web.cgn.community
mods.forrestcgn.de
```

Der produktive Service-Code liegt im Repo unter:

```text
remote-modboard/backend/
```

## Grundregeln

- Keine Secrets ins Repo.
- Keine Passwoerter im Chat posten.
- Keine lokale SQLite anfassen.
- Keine DB-Migration in diesem Schritt.
- Node-Service nur intern auf `127.0.0.1:3010` betreiben.
- Oeffentlicher Zugriff nur ueber nginx/HTTPS.
- Keine freien Shell-/Datei-/Prozessbefehle aus der App.

## Server-Zielstruktur spaeter

Empfohlen:

```text
/opt/stream-control-center/remote-modboard/backend/
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

nginx-Snippet wird je nach ISPConfig/nginx-Struktur bewusst manuell eingebunden, nicht blind ueberschrieben.

## Vor der echten Installation pruefen

Nur lesende Befehle:

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

## Installationsreihenfolge spaeter

1. Zielpfade pruefen/anlegen.
2. Service-User planen/anlegen, z. B. `sccremote`.
3. Service-Code nach `/opt/stream-control-center/remote-modboard/backend/` kopieren.
4. ENV-Datei aus Vorlage erstellen, Passwort nur direkt auf dem Server eintragen.
5. `npm install --omit=dev` nur im Remote-Paket ausfuehren.
6. Lokalen Dry-Run auf `127.0.0.1:3010` testen.
7. systemd-Service installieren und starten.
8. nginx-Reverse-Proxy fuer `/api/remote/` einbinden.
9. Healthchecks lokal und ueber HTTPS pruefen.
10. Rollback-Pfad bereithalten.

## Healthchecks spaeter

Lokal auf dem Webserver:

```bash
curl -sS http://127.0.0.1:3010/api/remote/health
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/routes
```

Oeffentlich nach nginx-Einbindung:

```bash
curl -sS https://mods.forrestcgn.de/api/remote/health
curl -sS https://mods.forrestcgn.de/api/remote/status
curl -sS https://mods.forrestcgn.de/api/remote/routes
```

## Rollback spaeter

- systemd-Service stoppen.
- nginx-Snippet deaktivieren oder auskommentieren.
- nginx configtest + reload.
- Vorherige Service-Dateien nicht blind loeschen, sondern sichern.
- ENV-Datei wegen Secrets nicht ins Repo kopieren.
