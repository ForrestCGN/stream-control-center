# Lokaler Dashboard-Ersatz - Plan

Stand: 2026-06-27  
Gilt ab: `0.2.9 - Dashboard-v2 Navigation angeglichen`
Step: `RDAP130_LOCAL_DASHBOARD_REPLACEMENT_PLAN`

## Zweck

Diese Datei legt fest, wie die neue Modboard-Oberflaeche spaeter das alte lokale Dashboard ersetzt.

Wichtig: Gemeint ist nicht ein Menuepunkt in der Online-Modoberflaeche. Gemeint ist die lokale Oberflaeche auf dem Streaming-PC ueber den bestehenden lokalen Server.

## Verbindliche Entscheidung

```text
Lokale Wahrheit:
http://127.0.0.1:8080
LAN spaeter ueber Streaming-PC-IP:8080
```

Der bestehende lokale Server bleibt der Owner fuer die lokale Oberflaeche:

```text
backend/server.js
Port: 8080
```

Die neue lokale Oberflaeche soll unter diesem lokalen Server entstehen:

```text
/dashboard-v2
```

`/dashboard-v2` wird die neue Oberflaeche. `/dashboard` bleibt zuerst stabil/alt und kann spaeter auf `/dashboard-v2` zeigen oder ersetzt werden.

## Aktueller lokaler Server-Stand

Der lokale Server liefert aktuell bereits aus:

```text
/dashboard
/dashboard-v2
/overlays
/assets
/alerts
/data
/public
```

Die Pfade liegen unter:

```text
D:\Streaming\stramAssets\htdocs
```

Der Repo-Pfad fuer den lokalen Server ist:

```text
backend/server.js
backend/core/paths.js
```

## Online/Lokal-Trennung

Online bleibt getrennt:

```text
mods.forrestcgn.de
remote-modboard/backend
interner Port 3010
Runtime online
```

Lokal ist der Ersatz fuer das alte Dashboard:

```text
Streaming-PC
backend/server.js
Port 8080
/dashboard-v2
```

Es wird keine neue Fantasie-Struktur gebaut. Die Remote-Modboard-UI/Optik/Modulidee darf als Vorlage dienen, aber lokale Einbindung muss zum bestehenden 8080-Server passen.

## Migrationsregel

Die alten Dashboard-Funktionen werden nach und nach uebernommen, aehnlich wie beim Online-Modboard.

Reihenfolge je Modul:

```text
1. echte alte Datei/Funktion lesen
2. Ziel im neuen /dashboard-v2 definieren
3. erst read-only Ansicht bauen
4. danach gezielt Aktionen/Writes freigeben, wenn Rechte/Sicherheit sauber sind
```

## Read-only bedeutet

Read-only heisst: anzeigen ja, ausloesen/aendern erstmal nein.

Beispiele:

```text
Sounds: Liste/Status anzeigen ja; abspielen, loeschen, speichern erstmal nein.
Alerts: Konfiguration anzeigen ja; testen oder speichern erstmal nein.
OBS: Status/Szenen anzeigen ja; Szene/Quelle wechseln erstmal nein.
Commands: Liste anzeigen ja; Command aendern erstmal nein.
Texte/Configs: anzeigen ja; speichern erstmal nein.
```

Das ist nur die Start-Sicherheitsstufe. Funktionen koennen spaeter einzeln freigegeben werden.

## Kritische lokale Module

Folgende Bereiche muessen spaeter einzeln geprueft werden:

```text
Sounds
Alerts
Texte / Configs
Commands / Channelpoints
OBS / Szenen / Quellen
Overlays
Streamer.bot / lokale Bridges
Uploads / Dateien
```

Keine dieser Funktionen wird pauschal freigeschaltet.

## Sicherheitsgrenze

Nicht Bestandteil dieses Plan-Steps:

```text
keine Codeaenderung
keine DB-Migration
keine neuen produktiven Writes
keine Agent-Actions
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Command-/Channelpoints-Steuerung
keine Shell-/Datei-/Prozess-Actions
kein Autostart
kein Windows-Dienst
keine Firewall-Aenderung
kein Webserver-Deploy noetig
```

## Aktuell umgesetzt

```text
0.2.9 - Dashboard-v2 Navigation angeglichen
```

- System, Module und Admin an die Online-Struktur angeglichen
- lokale Zukunftsbereiche beibehalten
- nur System -> Uebersicht aktiv
- alle weiteren Menuepunkte deaktiviert
- `/dashboard` unveraendert

## Naechster sinnvoller technischer Schritt

```text
0.2.10 - Stream-PC Status read-only vorbereitet
```

Moeglicher Scope:

```text
- vorhandenen Stream-PC-Menuepunkt aktivieren
- nur `/api/_status`, `/api/stream-status/current` und `/api/diag/ws` lesen
- Server-, WebSocket- und gecachten Streamstatus anzeigen
- keine Refresh-, Test- oder Log-Routen
- keine Actions oder Writes
- /dashboard bleibt stabil
```
