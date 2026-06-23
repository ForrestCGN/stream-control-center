# REMOTE DASHBOARD WEB SERVER STATUS

Stand: 2026-06-23  
Step: RDAP2.WEB1 / Webserver-Grundlage geprüft  
Status: Infrastruktur-/Doku-Stand, keine Projekt-Runtime-Umsetzung

## Zweck

Diese Datei dokumentiert den geprüften Webserver-Basisstand für das spätere Remote-Modboard / Dashboard-v2 von ForrestCGN.

Der Stand betrifft nur die öffentliche Webserver-Grundlage. Es wurde kein `stream-control-center`-Backend-Code, kein Dashboard-Code, kein Agent-Code, keine produktive SQLite und keine Stream-PC-Runtime geändert.

## Ergebnis

Die geplante öffentliche Remote-Modboard-Subdomain wurde geändert und erfolgreich vorbereitet:

```text
Remote-Modboard: https://mods.forrestcgn.de
```

Die alte Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.

## Geprüfte Webserver-Basis

Server:

```text
Hostname: web
Typ: KVM-VM
OS: Debian GNU/Linux 13 (trixie)
Public IPv4: 138.201.122.159
Public IPv6: 2a01:4f8:172:25d5::10
```

Installiert / geprüft:

```text
git: 2.47.3
nginx: 1.26.3
MariaDB-Client: 11.8.6-MariaDB
Node.js: v20.19.2
npm: 9.2.0
npx: 9.2.0
```

## DNS / HTTPS

Cloudflare DNS:

```text
A    mods -> 138.201.122.159
Proxy: DNS only
```

IPv6 ist ebenfalls erreichbar über:

```text
2a01:4f8:172:25d5::10
```

Geprüft:

```text
curl -I https://mods.forrestcgn.de
curl -4 -I https://mods.forrestcgn.de
curl -6 -I https://mods.forrestcgn.de
```

Ergebnis:

```text
HTTP/2 200
```

## nginx / ISPConfig / Let's Encrypt

`mods.forrestcgn.de` ist im nginx-vHost der Website `forrestcgn.de` enthalten.

Aktueller vHost-Pfad:

```text
/etc/nginx/sites-enabled/100-forrestcgn.de.vhost
/etc/nginx/sites-available/forrestcgn.de.vhost
```

Zertifikat:

```text
Issuer: Let's Encrypt
SAN enthält:
- forrestcgn.de
- forrestcgn.info
- mods.forrestcgn.de
- www.forrestcgn.de
- www.forrestcgn.info
```

nginx-Test:

```text
nginx -t
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Hinweis:

Die nginx-Warnung zur veralteten `listen ... http2`-Syntax betrifft ISPConfig-vHosts und ist aktuell kein Blocker.

## Ports / Firewall

Öffentlich relevant:

```text
80/tcp  -> nginx / HTTP / ACME
443/tcp -> nginx / HTTPS / später WSS
22/tcp  -> SSH, aktuell offen
```

Nicht öffentlich für das Remote-Modboard öffnen:

```text
3000/tcp -> spätere Node-App nur intern auf 127.0.0.1:3000
3306/tcp -> MariaDB nicht öffentlich freigeben
8080/tcp -> lokales Stream-PC-Backend bleibt lokal
8006/tcp -> Proxmox nicht öffentlich für das Modboard
```

MariaDB lauschte beim Check auf `0.0.0.0:3306` und `[::]:3306`, war aber nicht per UFW freigegeben. Das sollte später sicherheitlich geprüft werden, darf aber nicht blind geändert werden, weil ISPConfig-/Mail-/Hosting-Funktionen davon abhängen können.

## apt / Rspamd-Key

`apt update` war zunächst durch einen fehlenden Rspamd-Repository-Key blockiert.

Behoben:

```text
fehlender Key: 3FA347D5E599BE4595CA2576FFA232EDBF21E25E
Rspamd-Key aktualisiert
Backup der alten rspamd.list nach /root/apt-backups verschoben
apt update läuft wieder sauber
```

Aktueller Stand:

```text
apt update: ok
1 Paket updatebar laut apt-Hinweis
```

Kein Full-Upgrade wurde durchgeführt.

## Node.js / npm

Node.js wurde aus den offiziellen Debian-13-Paketquellen installiert.

```text
node -v -> v20.19.2
npm -v  -> 9.2.0
npx -v  -> 9.2.0
```

Es wurde kein NodeSource-Fremdrepo eingebunden.

## Nicht geändert

Durch diesen Webserver-Basisstand wurde nicht geändert:

```text
kein stream-control-center Backend-Code
kein Dashboard-Code
kein Agent-Code
kein Frontend-Code
keine produktive SQLite
keine Projekt-Config
keine OBS-Quelle
keine Stream-PC-Runtime
kein lokaler Node-Neustart für stream-control-center
kein Repo-Deploy
kein Reverse-Proxy auf 127.0.0.1:3000
kein systemd-Service für eine Remote-Node-App
```

## Nächster sinnvoller Schritt

Nächster Projektstep:

```text
RDAP3 / Minimal-Agent-Konzept planen
```

RDAP3 bleibt zunächst Planung und soll noch keinen produktiven Agent-Code bauen.

RDAP3 soll behandeln:

```text
separater Node-Agent-Prozess
Agent-Config
WSS-Verbindung
Auth mit agentId + Secret
Heartbeat
Basisstatus
agent.ping
agent.status.request
Request/Result/Audit-Struktur
Reconnect-/Offline-Verhalten
keine produktiven Aktionen
```

Nicht in RDAP3:

```text
keine Sound-Steuerung
keine OBS-Steuerung
keine Overlay-Steuerung
keine Media-Schreiboperation
keine Text-/Config-Änderung
keine Commands/Kanalpunkte
keine DB-Aktionen
keine Datei-/Shell-/Prozessaktionen
```

## Node-Neustart

Für diesen Doku-/Infrastrukturstand ist kein lokaler `stream-control-center`-Node-Neustart nötig.

Grund:

```text
keine Backend-Datei geändert
keine Dashboard-Datei geändert
keine Overlay-Datei geändert
keine Config geändert
keine DB geändert
kein Agent-Code erstellt
```
