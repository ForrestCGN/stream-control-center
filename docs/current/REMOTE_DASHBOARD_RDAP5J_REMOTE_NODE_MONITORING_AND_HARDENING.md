# REMOTE DASHBOARD - RDAP5J Remote Node Monitoring and Hardening

Stand: 2026-06-23

## Ziel

RDAP5J baut auf `RDAP5I_REMOTE_READONLY_LIVE` auf und beschreibt Monitoring- und Hardening-Pruefungen fuer den bereits live laufenden read-only Remote-Node.

Dieser Step aktiviert keine produktiven Schreibaktionen und aendert keine Runtime-Konfiguration. Er ist ein sicherer Runbook-/Planungsstand.

## Ausgangslage

Bestaetigter RDAP5I-Stand:

```text
Remote API: https://mods.forrestcgn.de/api/remote/
Read-only: true
Write enabled: false
Action enabled: false
Agent enabled: false
Agent actions enabled: false
Migration enabled: false
Service: scc-remote-modboard.service
Listen: 127.0.0.1:3010
User: sccremote
```

Kritische DB-Zuordnung:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Secrets stehen nur auf dem Server in:

```text
/etc/stream-control-center/remote-modboard.env
```

## Nicht-Aenderungen

In RDAP5J nicht aendern:

- keine Remote-Schreibfunktionen aktivieren
- keine Auth-/Session-Erstellung aktivieren
- keine DB-Migration aktivieren
- keine Agent-Aktionen aktivieren
- keine OBS-/Sound-/Overlay-/Command-Steuerung aktivieren
- keine freien Shell-/Datei-/Prozessbefehle einfuehren
- keine Secrets ins Repo, Frontend oder Chat schreiben
- keine produktive SQLite ersetzen, loeschen oder neu bauen
- keine MariaDB-Struktur ohne separaten RDAP6-Plan aendern

## Monitoring-Pruefung: Server lokal

Auf dem Webserver ausfuehren:

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
systemctl status scc-remote-modboard.service --no-pager
journalctl -u scc-remote-modboard.service -n 80 --no-pager
```

Erwartung:

```text
enabled
active
keine wiederholten Crashes
keine Secret-Ausgaben im Journal
keine DB-Passwort-Ausgaben
keine unerwarteten Write-/Action-/Migration-Meldungen
```

## Monitoring-Pruefung: lokaler Node-Port

Auf dem Webserver ausfuehren:

```bash
ss -ltnp | grep ':3010'
```

Erwartung:

```text
127.0.0.1:3010
```

Nicht gewuenscht:

```text
0.0.0.0:3010
:::3010
```

Der Node-Service soll lokal gebunden bleiben und nur ueber nginx/ISPConfig erreichbar sein.

## Monitoring-Pruefung: lokale API

Auf dem Webserver ausfuehren:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/health
curl -fsS http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes
curl -fsS "http://127.0.0.1:3010/api/remote/health?db=1"
```

Erwartung:

- `ok` ist `true`
- `readOnly` ist `true`
- `writeEnabled` ist `false`
- `actionEnabled` ist `false`
- `agent.enabled` ist `false`
- `agent.actionsEnabled` ist `false`
- DB-Lesetest ist erreichbar

## Monitoring-Pruefung: oeffentliche API

Von einem externen Rechner oder lokalem PC aus pruefen:

```powershell
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/health" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/routes" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/health?db=1" | ConvertTo-Json -Depth 8
```

Erwartung:

- API erreichbar
- read-only Status unveraendert
- keine Schreib-/Agent-/Auth-/Migration-Funktion aktiv

## nginx-/Proxy-Pruefung

Auf dem Webserver ausfuehren:

```bash
nginx -t
systemctl reload nginx
```

Danach optional pruefen:

```bash
curl -I https://mods.forrestcgn.de/api/remote/health
```

Erwartung:

- `nginx -t` erfolgreich
- keine neuen blockierenden Fehler
- `/api/remote/` wird an `127.0.0.1:3010` weitergeleitet

## Sicherheits-/Hardening-Checkliste

### systemd

Pruefen, ob der Service bereits unter eigenem User laeuft:

```bash
systemctl cat scc-remote-modboard.service
```

Erwartung:

```text
User=sccremote
```

Moegliche spaetere Hardening-Optionen nur nach separatem Plan:

```ini
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/stream-control-center/remote-modboard/backend /etc/stream-control-center
```

Wichtig: `ProtectSystem=strict` und `ReadWritePaths` koennen Services brechen, wenn Pfade fehlen. Daher nur testen, nicht blind setzen.

### nginx

Pruefen:

- Proxy nur fuer `/api/remote/`
- keine versehentliche Freigabe des Node-Ports nach aussen
- keine Secrets in Error-/Access-Logs
- Timeouts plausibel

### Logging

Pruefen:

- Keine DB-Passwoerter im Journal
- Keine kompletten `.env`-Ausgaben
- Keine Tokens
- Keine personenbezogenen Daten unnoetig loggen

### Rate-Limit / Schutz

Fuer spaeter planen:

- nginx Rate-Limit fuer `/api/remote/`
- ggf. Fail2ban/nginx-Log-basierte Sperren
- klare Health-Endpunkte ohne Write-Funktion
- spaeter Auth vor sensiblen Endpunkten, aber nicht in RDAP5J aktivieren

## Akzeptanzkriterien RDAP5J

RDAP5J gilt als bestanden, wenn:

- Service ist `enabled` und `active`
- Journal zeigt keine Fehler/Crash-Loops
- Node lauscht nur auf `127.0.0.1:3010`
- lokale API liefert Health/Status/Routes
- oeffentliche API liefert Health/Status/Routes
- `health?db=1` bestaetigt DB-Lesetest
- Status bleibt read-only
- Writes/Auth/Migration/Agent-Actions bleiben deaktiviert
- keine Secrets werden ausgegeben oder dokumentiert

## Naechster moeglicher Step danach

Nach RDAP5J:

```text
RDAP4B_REMOTE_AGENT_RDAP5C3_ROLE_GROUP_REVISION
```

oder:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

RDAP6 nur mit Backup-/Migrationsplan und separatem Go.
