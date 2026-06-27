# Lokaler Dashboard-Ersatz - Plan

Stand: 2026-06-27  
Gilt ab: `0.2.10 - Stream-PC Status read-only vorbereitet`

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

Die neue lokale Oberflaeche entsteht unter:

```text
/dashboard-v2
```

`/dashboard-v2` wird die neue Oberflaeche. `/dashboard` bleibt zuerst stabil/alt und kann spaeter auf `/dashboard-v2` zeigen oder ersetzt werden.

## Migrationsregel

Die alten Dashboard-Funktionen werden nach und nach uebernommen.

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

## Aktuell umgesetzt

```text
0.2.10 - Stream-PC Status read-only vorbereitet
```

- `System -> Stream-PC` in `/dashboard-v2` aktiviert.
- Neue lokale Read-only-Statusseite vorbereitet.
- Nur bestehende sichere GET-Routen verwendet:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- Server-, Modul-, Routen-, WebSocket- und gecachter Streamstatus werden angezeigt.
- Keine Refresh-/Test-/Log-/Session-/Schreibrouten.
- Keine Buttons, Actions oder Steuerfunktionen.
- `/dashboard` bleibt unveraendert.

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

Nicht Bestandteil von 0.2.10:

```text
keine Backend-Aenderung
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

## Naechster sinnvoller technischer Schritt

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```

Moeglicher Scope:

```text
- vorhandenen Menuepunkt Module -> Moduluebersicht aktivieren
- nur sichere bestehende Status-/Diagnose-Daten lesen
- geladene lokale Module und geplante Migrationsbereiche anzeigen
- keine Modul-Actions, keine Reloads, keine Tests, keine Writes
- /dashboard bleibt stabil
```
