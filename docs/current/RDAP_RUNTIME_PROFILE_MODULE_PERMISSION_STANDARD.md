# RDAP Runtime Profile / Modul- / Sync- / Rechte-Standard

Stand: 2026-06-29  
Step: `RDAP_0.2.26_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD_DOCS`

## Harte Architekturregeln

```text
1. Eine UI, zwei Runtime-Profile.
2. Module sind fachlich, nicht technisch.
3. Sync ist Infrastruktur, kein eigenes Navigationsmodul.
4. Agent ist Infrastruktur, kein Fachmodul.
5. Jede Funktion wird von Anfang an mit User-/Rollen-/Permission-Modell gedacht.
6. Keine Write-Funktion ohne serverseitige Permission-Pruefung, Confirm, Audit und Readback.
7. Keine zweite lokale UI und keine Online-Sonder-UI.
```

## Single UI / Dual Runtime Profile

Die Remote-Modboard UI ist die einzige UI-Wahrheit.

```text
Remote-Modboard UI
├─ runtimeMode: local
│  ├─ gleiche UI
│  ├─ Daten direkt vom lokalen SCC/Agent
│  ├─ echte lokale Dateien/OBS/Sounds verfuegbar
│  └─ Cloud nicht erforderlich
│
└─ runtimeMode: online
   ├─ gleiche UI
   ├─ Daten vom Webserver
   ├─ Stream-PC-Daten nur ueber Agent-Sync/Memory-Cache
   └─ zentrale Auth/Rechte/Audit-Schicht
```

Wichtig:

```text
Die Seite Media ist dieselbe Seite.
Die Seite OBS ist dieselbe Seite.
Die Seite Sound ist dieselbe Seite.
Nur Runtime-Profil und Datenquelle unterscheiden sich.
```

## Fachliche Module statt Technikmodule

Nicht nach Transport, Cache oder Sync-Art splitten.

Nicht bauen:

```text
media-agent-sync
media-local-inventory
media-online-cache
obs-live
obs-inventory
obs-actions
sound-agent-status
```

Stattdessen:

```text
Media
OBS
Sound
Alerts / Events
Commands
Twitch / Channelpoints
Admin
Account
System
Module
```

Regel:

```text
Ein Modul darf realtimePush, pullOnDemand und slowSync gleichzeitig haben.
Es bleibt trotzdem ein fachliches Modul.
```

## Datenklassen / Sync-Klassen

### A. Realtime Push

Fuer kleine Zustaende, die schnell sichtbar sein muessen.

Beispiele:

```text
OBS: aktuelle Szene, verbunden/getrennt, spaeter Mute-/Streamstatus
Sound: aktuell spielender Sound, Queue-Status, Start/Ende
Alerts/Events: aktuell laufendes Event, Queue, Countdown
Agent: connected/stale/offline
```

Technik:

```text
Agent -> Webserver WSS
Event-basiert oder kurzes Intervall
Memory-only
kleine Payloads
keine Listen mit hunderten Eintraegen
keine Datei-Inhalte
```

### B. Pull on Demand

Fuer Daten, die nur bei Seitenaufruf, Detailansicht, Filter oder Reload benoetigt werden.

Beispiele:

```text
Admin: Userliste, Rollen, Audit-Details
Media: Datei-Details, Suche, Filter, spaeter Vorschau/Metadaten
Sound: Sound-Konfiguration, Presets, Detailansicht
Commands: Liste/Detail/Edit-Ansicht
```

Technik:

```text
Browser/Modboard -> API GET
local: direkte lokale API
online: Webserver Cache oder spaeter gezielte sichere Agent-Request-Route
```

### C. Slow Sync

Fuer Daten, die dauerhaft verfuegbar sein sollen, aber nicht in Echtzeit vorliegen muessen.

Beispiele:

```text
Media: Medieninventar, Anzahl, Groesse, Änderungsdatum
OBS: Szenen-/Quellen-/Audio-Inventar
Sound: Soundliste, Kategorien, begrenzter Playback-Verlauf
System: Komponentenstatus, Versionen, Modulverfuegbarkeit
```

Technik:

```text
Agent -> Webserver WSS
Intervall 30s bis 5min
Memory-only zuerst
spaeter optional DB-Cache nur nach eigenem Step
sanitized und limitiert
```

## Standard pro Modul

Jedes Modul soll kuenftig diese Felder/Aspekte dokumentieren:

```text
dataModes:
  realtimePush: true/false
  pullOnDemand: true/false
  slowSync: true/false

transport:
  local: direct-local-api
  online: webserver-memory-cache | agent-wss-memory-cache | webserver-db | planned

permissions:
  readPermission
  writePermission
  adminPermission
  dangerPermission

safety:
  readOnly
  noFileWrite
  noDatabaseWrite
  noMigration
  noShellOrProcessActions
  noAgentActions
  noSecrets
```

## Rechte-/User-/Rollen-Regeln

Fuer jede Funktion muss vor der Umsetzung klar sein:

```text
- Wer darf lesen?
- Wer darf ausfuehren?
- Welche Permission ist erforderlich?
- Welche Rolle bekommt die Permission standardmaessig?
- Ist Confirm erforderlich?
- Ist Audit erforderlich?
- Ist Lock erforderlich?
- Ist Readback erforderlich?
- Ist die Aktion lokal, online oder in beiden Profilen erlaubt?
```

UI-Regel:

```text
Buttons duerfen niemals die Sicherheitsgrenze sein.
Backend muss immer pruefen.
Solange Backend-Enforcement fehlt, bleiben UI-Aktionen disabled/planned.
```

Lokale Regel:

```text
Lokal darf mehr direkt gelesen werden.
Writes duerfen trotzdem nicht an der zentralen Permission-/Audit-/Confirm-Schicht vorbei laufen.
```

## Rollen-Presets als Zielmodell

```text
readonly:
  read-only Zugriff auf freigegebene Module

mod:
  normale Mod-Funktionen, standardmaessig viele read-Rechte

lead_mod:
  erweiterte Mod-/Team-Funktionen

media_manager:
  Media read/upload/edit, aber kein delete ohne separate Freigabe

admin:
  Verwaltung freigegebener Module, gefaehrliche Aktionen nur mit Permission/Audit/Confirm

owner:
  Vollzugriff, Notfall-/Systemhoheit, sehr sparsam vergeben
```

## Modul-Matrix Startstand

```text
Modul                Realtime Push        Pull on Demand              Slow Sync
----------------------------------------------------------------------------------------
System               Agent online/offline Details/Diagnose            Versionen/Komponenten
Module               nein                 Moduldetails                Manifest/Readiness
OBS                  Szene/Live-State     Details je Quelle           Szenen/Quellen/Audio
Media                nein/selten          Details/Suche/Filter        Inventar
Sound                Current/Queue        Config/Presets/Details      Soundliste/Playback
Alerts / Events      Current Event        Eventdetails                letzte Events
Commands             nein                 Liste/Details               optionale Liste
Twitch/Channelpoints nein                 Rewarddetails              Rewardliste
Admin                nein                 User/Rollen/Audit           optionaler Cache
Account              Sessionstatus        Profil/Rechte               optionaler Cache
```

## Media-Entscheidung

Media ist kein Realtime-Modul.

```text
local:
  direkte lokale Media-API liest htdocs/assets/* read-only

online:
  Agent sendet Media-Inventar als slow-sync, memory-only

nicht tun:
  keine Datei-Inhalte uebertragen
  keine absoluten Pfade uebertragen
  kein Upload/Delete im Sync
```

## OBS-Entscheidung

OBS hat zwei Datenklassen:

```text
Realtime:
  aktuelle Szene / Live-State / Verbindung

Slow Sync:
  Szenenliste / Quellenliste / Audioquellen
```

OBS-Steuerung bleibt spaeter nur ueber feste Action-Endpunkte mit Allowlist, Permission, Confirm/Audit, niemals ueber freie OBS-Payloads.

## Sound-Entscheidung

Sound hat drei Datenklassen:

```text
Realtime:
  current playback, queue, started/ended/error

Pull:
  Config, Presets, Details

Slow Sync:
  Soundliste, Kategorien, begrenzte Recent-Playback-Daten
```

Sound-System bleibt Owner fuer Playback, Queue, Gating, Pause und Ausgabe.

## Installationsziel fuer andere Streamer

Zielarchitektur:

```text
[Streamer-PC]
  Lokaler SCC/Agent
  - liest OBS, Media, Sound lokal
  - verbindet sich ausgehend zum Webserver
  - keine Portfreigabe am Heimrouter erforderlich

        ↓ ausgehende WSS-Verbindung

[Cloud/Webserver]
  Remote-Modboard Backend
  - Auth
  - Rechte
  - Audit
  - Online UI
  - Memory-Cache vom Agent

        ↓ Browser

[Mods/Admins]
  Online-Modboard
```

Lokaler Betrieb bleibt eigenstaendig moeglich:

```text
http://127.0.0.1:8080/dashboard-v2
http://LAN-IP:8080/dashboard-v2
```

Cloud ist Erweiterung fuer Team-/Mod-Zugriff, nicht Voraussetzung fuer lokalen Betrieb.

## Naechste technische Ableitung

Erst nach diesem Standard:

```text
RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY
```

Der Step darf Media-Agent-Sync nur innerhalb des fachlichen Moduls `Media` umsetzen, nicht als neues Technikmodul.
