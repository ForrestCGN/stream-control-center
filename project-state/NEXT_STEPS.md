# NEXT STEPS

Stand: RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

## Ziel von RDAP5E

RDAP5E soll planen, wie der Remote-Modboard-Node-Service auf `web.cgn.community` für `mods.forrestcgn.de` aufgebaut wird.

Keine Umsetzung.

Planungspunkte:

- Service-Pfad auf dem Webserver
- Start-/Service-Konzept
- nginx-/Reverse-Proxy-Konzept für Remote-API
- ENV-/Secret-Ablage
- MariaDB-Verbindungsstrategie
- erste read-only Health/API
- Logging/Audit-Vorbereitung
- spätere Agent-Anbindung
- keine freien Shell-/Datei-/Prozessbefehle
- Rollback-/Undo-Konzept

## Bereits bekannte Server-Fakten

Nicht nochmal als großen Check planen:

```text
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 läuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
```

Ein kurzer Gegencheck direkt vor echter Installation ist okay.

## RDAP5E darf

- Plan erstellen
- Ziel-Dateistruktur vorschlagen
- Service-/nginx-/ENV-Konzept vorschlagen
- Healthcheck-Konzept planen
- erste read-only API planen
- Tests planen
- Rollback/Undo planen

## RDAP5E darf nicht

- kein npm install
- keine DB-Migration
- keine MariaDB-Schreibaktion
- keine lokale SQLite-Aenderung
- keinen produktiven Node-Service starten
- keine nginx-/Firewall-/Proxy-Aenderung
- keine Secrets ins Repo oder Frontend schreiben
- keine Agent-Actions aktivieren
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine freie Shell-/Datei-/Prozesssteuerung

## Danach mögliche Schritte

```text
RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE
```

Erst nach RDAP5E-Plan und separatem Go.

Oder:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Erst nach Service-/ENV-/Secret-Klärung.
