# NEXT STEPS

Stand: RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN
```

## Ziel von RDAP5G

RDAP5G soll planen, wie das in RDAP5F vorbereitete Remote-Modboard-Node-Basispaket auf `web.cgn.community` installiert wird.

Planungspunkte:

```text
Webserver-Zielpfad pruefen
Service-User planen
ENV-/Secret-Datei planen
npm install nur im separaten remote-modboard/backend planen
systemd-Service planen
nginx-Reverse-Proxy fuer /api/remote/ planen
optionalen /ws/agent Pfad fuer spaeter planen
Healthcheck nach Start planen
Rollback/Undo planen
```

## Vor RDAP5G einmalig als Lesetest erlaubt

```bash
whoami
pwd
node -v
npm -v
mysql --version
which node
ls -la /opt
ls -la /etc/stream-control-center 2>/dev/null || true
```

Keine Installation ohne separates Go.

## RDAP5G darf

```text
Plan erstellen
Lesebefehle fuer Serverpfade nennen
systemd/nginx/ENV-Konzept konkretisieren
Installationsreihenfolge planen
Tests planen
Rollback planen
```

## RDAP5G darf nicht ohne separates Go

```text
kein produktiver Node-Service starten
kein npm install ausfuehren
keine nginx-Aenderung ausfuehren
keine systemd-Aenderung ausfuehren
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
keine Secrets posten/dokumentieren
keine Agent-Actions aktivieren
```

## Danach mögliche Schritte

```text
RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE
```

Erst nach RDAP5G-Plan und separatem Go.

Oder spaeter:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Erst nach stabil laufendem Remote-Node-Basisdienst und separatem DB-Migrationsplan.
