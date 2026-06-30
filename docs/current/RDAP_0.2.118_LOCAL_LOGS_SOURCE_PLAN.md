# RDAP 0.2.118 - Local Logs Source Plan

## Ziel

Lokale Logs fuer `Lokal / Stream-PC` sauber planen, bevor eine lokale read-only API gebaut wird.

Dieser Stand ist bewusst ein Plan-/Doku-Step.

## Ausgangslage

```text
Admin -> Logs
```

Die Logs-Hauptansicht ist bereinigt und bestaetigt.

Aktuell sichtbar:

```text
Log-Quelle
Log-Bereich
Status
Suche
Wer
Anzahl
Liste
Details
```

Log-Quelle:

```text
Remote-Modboard: aktiv
Lokal / Stream-PC: vorbereitet, aber noch ohne API
```

Remote-Modboard nutzt aktuell:

```text
GET /api/remote/admin/audit/log
```

## Grundsatz fuer lokale Logs

Lokale Logs werden nicht direkt in die bestehende Remote-Audit-Log-Route hineingemischt.

Stattdessen wird zuerst eine eigene lokale read-only Quelle geplant, die spaeter sauber ueber das Log-Quelle-Dropdown angebunden werden kann.

## Schutzregeln

```text
nur read-only
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Shell-/Datei-Actions vom Remote-Modboard aus
keine Retention-/Selbstbereinigung in der Logs-Hauptansicht
```

## Bevorzugte Quelle

Primaere Zielquelle fuer lokale Logs:

```text
Lokaler Stream-PC / Dashboard / Agent
http://127.0.0.1:8080
```

Die spaetere lokale API soll nur Daten lesen und normalisieren.

Keine direkte produktive Dateioperation vom Remote-Modboard aus.

## Moegliche lokale Log-Bereiche

### 1. Dashboard / Agent Status

Erste sinnvolle lokale Quelle.

Ziel:

```text
Verbindung
Runtime-Status
lokale Readiness
Agent erreichbar / nicht erreichbar
letzter bekannter Status
```

Wichtig:

```text
Status lesen, nicht steuern.
```

### 2. Media-System lokal

Sinnvoll als zweiter Bereich.

Ziel:

```text
lokale Media-Index-/Media-System-Ereignisse
lokale Read-Statusdaten
lokale Fehler-/Warnhinweise
```

Keine Uploads, keine Deletes, keine Index-Writes.

### 3. Sound / Playback spaeter

Ziel spaeter:

```text
letzte Playback-Starts
letzte Playback-Enden
Queue-/Playback-Fehler
```

Nur wenn eine bestehende read-only Status-/Recent-Route vorhanden ist oder sauber geplant wird.

### 4. OBS / Overlays spaeter

Ziel spaeter:

```text
Overlay-Status
OBS-Verbindungsstatus
ACK-/Heartbeat-Diagnose
```

Keine OBS-Actions.

### 5. System / Lokaler Server spaeter

Ziel spaeter:

```text
lokaler Serverstatus
Modulstatus
Fehler-/Warnhinweise aus sicheren Statusquellen
```

Keine Prozesssteuerung.

## API-Konzept fuer spaeter

Noch nicht bauen in 0.2.118.

Moeglicher spaeterer Remote-Modboard-Endpunkt:

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

Oder, falls der Agent bereits passende Ownerschaft hat:

```text
GET /api/remote/agent/local-logs/status
GET /api/remote/agent/local-logs/list
```

Die genaue Route wird erst nach Pruefung der bestehenden lokalen Status-/Agent-Struktur festgelegt.

## Datenmodell-Idee fuer lokale Log-Items

Spaeter einheitlich normalisieren auf:

```text
source: local
area: dashboard | media | sound | overlays | obs | system
createdAt
actor: system | agent | module
status: success | attempt | failure | warning | info
action
resourceType
resourceKey
summary
detailsSafe
```

Keine Secrets, Tokens, Cookies, ENV-Werte oder Rohpayloads.

## UI-Verhalten spaeter

Aktueller Stand bleibt:

```text
Lokal / Stream-PC vorbereitet, aber noch nicht aktiv
```

Erst wenn eine lokale read-only API existiert:

```text
Dropdown-Option aktivieren
lokale Quelle abfragen
Fehlerzustand sauber anzeigen, wenn Stream-PC nicht erreichbar ist
Remote-Logs unveraendert lassen
```

## Nicht Teil dieses Steps

```text
keine Code-Aenderung
keine neue lokale API
keine UI-Aktivierung der lokalen Quelle
keine Remote-Audit-Route-Aenderung
keine Admin-Notizen-Erweiterung
keine Retention-UI
keine Cleanup-/Prune-Funktion
kein Webserver-Deploy
```

## Naechster sinnvoller Step

```text
RDAP_0.2.119_LOCAL_LOGS_READONLY_API_DESIGN
```

Ziel fuer 0.2.119:

```text
bestehende lokale 8080 Status-/Log-/Recent-Routen pruefen
Agent-/Dashboard-Owner klaeren
konkrete read-only Route planen
Antwortformat festlegen
Fehler-/Offline-Verhalten festlegen
noch keine Writes
```

## Test / Abschluss

Doku-only.

Lokal pruefen:

```powershell
cd D:\Git\stream-control-center
git status
```

Kein Node-Neustart.
Kein Webserver-Deploy.
