# NEXT STEPS

Stand: RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION_DOCUMENTED  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK
```

## Ziel von RDAP5D

RDAP5D soll klaeren, ob und wie Node fuer das Remote-Modboard auf `web.cgn.community` / `mods.forrestcgn.de` laufen kann.

Noch keine Umsetzung.

Zu klaeren:

- Ist Node auf dem Webserver installiert?
- Welche Node-Version?
- Gibt es NPM?
- Gibt es SSH/Shell-Zugriff?
- Wo liegt der Webroot fuer `mods.forrestcgn.de`?
- Wie kann ein Node-Prozess dauerhaft laufen?
  - systemd?
  - PM2?
  - ISPConfig App/Proxy?
  - anderer Hosting-Mechanismus?
- Wie werden ENV/Secrets sicher gespeichert?
- Kann Node die DB `c1stream_control` per localhost erreichen?
- Gibt es Reverse Proxy fuer `/api` oder eigene Portweiterleitung?
- Welche Grenzen setzt ISPConfig/Hosting?

## Vor RDAP5D prüfen

Zuerst echte aktuelle Dateien aus Repo/Live prüfen, insbesondere:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
package.json
```

Am Server spaeter nur lesende Checks:

```bash
node -v
npm -v
which node
which npm
whoami
pwd
```

Keine Installation ohne separates Go.

## RDAP5D darf

- Server-/Node-/ENV-Moeglichkeiten klaeren
- Befehle fuer reine Checks vorbereiten
- ISPConfig-/Webserver-Optionen dokumentieren
- naechsten Umsetzungsweg empfehlen

## RDAP5D darf nicht

- kein npm install
- keine DB-Migration ausfuehren
- keine MariaDB schreiben
- keine lokale SQLite anfassen
- keinen Node-Service produktiv starten
- keine Secrets ins Repo oder Frontend schreiben
- keine Firewall-/Proxy-Aenderungen ohne separates Go

## Spätere mögliche Schritte

```text
RDAP5E_REMOTE_NODE_BASE_SKELETON_PLAN
```

Oder:

```text
RDAP6_MINIMAL_REMOTE_AUTH_IMPLEMENTATION
```

erst nach Server-/Node-/ENV-Klärung und separatem Go.
