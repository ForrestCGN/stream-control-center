# NEXT STEPS

Stand: RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE
```

## Ziel von RDAP5H

RDAP5H soll aus dem RDAP5G-Plan ein konkretes Installationspaket bzw. konkrete Installationsanweisungen fuer `web.cgn.community` vorbereiten.

Geplante Punkte:

```text
Webserver-Zielpfad final anhand echter Lesebefehle bestaetigen
Service-User sccremote anlegen oder pruefen
Remote-Modboard-Paket nach /opt/stream-control-center/remote-modboard/backend bringen
ENV-/Secret-Datei unter /etc/stream-control-center/remote-modboard.env vorbereiten
npm install --omit=dev nur im separaten remote-modboard/backend ausfuehren
systemd-Service scc-remote-modboard.service vorbereiten
nginx-Reverse-Proxy fuer /api/remote/ vorbereiten
nginx -t vor reload pruefen
Healthcheck lokal und ueber https://mods.forrestcgn.de pruefen
Rollback/Undo griffbereit halten
```

## Vor RDAP5H als Lesetest erlaubt

```bash
whoami
pwd
node -v
npm -v
mysql --version
which node
ls -la /opt
ls -la /etc/stream-control-center 2>/dev/null || true
nginx -T 2>/dev/null | grep -n "mods.forrestcgn.de" -A 30 -B 10 || true
```

Keine Installation ohne separates Go.

## RDAP5H darf erst nach separatem Go

```text
npm install im separaten remote-modboard/backend ausfuehren
Service-User anlegen
Dateien nach /opt kopieren
/etc/stream-control-center/remote-modboard.env anlegen
systemd-Service anlegen
nginx-Site sichern und Reverse-Proxy einbauen
Service starten
Healthchecks ausfuehren
```

## RDAP5H darf nicht ohne separaten DB-/Auth-/Agent-Plan

```text
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
kein Login/Auth aktivieren
keinen produktiven Agent aktivieren
keine Agent-Actions aktivieren
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine freie Shell-/Datei-/Prozesssteuerung
keine Secrets ins Repo oder Frontend schreiben
```

## Danach mögliche Schritte

```text
RDAP5I_REMOTE_NODE_PROXY_HEALTH_TEST
```

oder spaeter:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

RDAP6 erst nach stabil laufendem Remote-Node-Basisdienst und separatem DB-Migrationsplan.
