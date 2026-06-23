# NEXT STEPS

Stand: RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION
```

## Ziel von RDAP5I

RDAP5I soll die echte, kontrollierte Installation des RDAP5F/RDAP5H Remote-Modboard-Node-Basisdienstes auf `web.cgn.community` vorbereiten und ausfuehren, aber weiterhin nur read-only.

Ziel:

```text
Remote-Modboard-Node-Service als read-only Basisdienst betreiben
/api/remote/health
/api/remote/status
/api/remote/routes
```

## RDAP5I Reihenfolge

```text
1. Server-Lesetest ausfuehren
2. Zielpfade pruefen/anlegen
3. Service-User pruefen/anlegen
4. Service-Code nach /opt/stream-control-center/remote-modboard/backend kopieren
5. ENV-Datei auf Server aus Vorlage erstellen, Passwort nur direkt auf Server eintragen
6. npm install --omit=dev nur im Remote-Paket ausfuehren
7. npm run check ausfuehren
8. lokalen Node-Dry-Run testen
9. systemd-Service installieren/starten
10. lokale Healthchecks ausfuehren
11. nginx-Reverse-Proxy fuer /api/remote/ einbinden
12. nginx -t und reload
13. HTTPS-Healthchecks pruefen
14. Rollback pruefbar halten
```

## Vor RDAP5I auszufuehrende Lesebefehle

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

## RDAP5I darf nach separatem Go

```text
Serverpfade pruefen/anlegen
Service-User pruefen/anlegen
Dateien auf Webserver kopieren
npm install nur im separaten Remote-Paket ausfuehren
systemd-Service installieren/starten
nginx-Reverse-Proxy fuer /api/remote/ einbinden
read-only Healthchecks ausfuehren
Rollback ausfuehren, falls Test scheitert
```

## RDAP5I darf nicht ohne eigenes separates Go

```text
keine DB-Migration
keine MariaDB-Schreibaktion
keine Auth-/Session-Erstellung
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
keine Secrets im Repo oder Chat posten
kein /ws/agent produktiv aktivieren
```

## Danach mögliche Schritte

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Erst nach stabil laufendem read-only Remote-Node-Basisdienst und separatem DB-Migrationsplan.

Oder:

```text
RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING
```

Nur falls vor Auth noch Logging/Monitoring/Hardening vertieft werden soll.
