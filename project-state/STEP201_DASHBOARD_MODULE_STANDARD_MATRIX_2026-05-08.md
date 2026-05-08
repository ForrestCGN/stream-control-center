# STEP201 – Dashboard-/Modul-Standard-Matrix
Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Analyse-/Doku-STEP  
Status: vorbereitet
## Grundlage
Analyse-Datei:

```text
D:\gpt\last_api.json
```
Git-Stand der Analyse:

```text
eb90fae docs: document global installer seed plan
```
## Zielstandard
Langfristig sollen Module möglichst einheitlich folgende Endpunkte anbieten:

```text
GET  /api/<module>/status
GET  /api/<module>/config
GET  /api/<module>/settings
GET  /api/<module>/routes
GET  /api/<module>/integration-check
POST /api/<module>/reload
```

Nicht jedes Modul muss sofort alles haben. STEP201 ist eine Matrix, keine Umbau-Freigabe.
## Gesamtbefund
- Geprüfte Module: **18**
- Vollständig nach Zielstandard: **2**
- Teilweise standardisiert: **3**
- Hohe Nachzieh-Priorität: **2**
## Modul-Matrix
| Modul | Base | Backend | Dashboard | Config-Datei | Status | Config | Settings | Routes | Integration | Reload | Priorität |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Sound-System | `/api/sound` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Niedrig |
| Alert-System | `/api/alerts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Mittel |
| SoundAlerts | `/api/soundalerts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Mittel |
| TTS | `/api/tts` | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Niedrig |
| VIP | `/api/vip` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Hoch |
| Tagebuch | `/api/tagebuch` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Mittel |
| Todo | `/api/todo` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Mittel |
| Messages | `/api/messages` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Mittel |
| Message Rotator | `/api/message-rotator` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Mittel |
| Hug/Rehug | `/api/hug` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Clips | `/api/clip` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| OBS | `/api/obs` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Discord | `/api/discord` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Twitch | `/api/twitch` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Hoch |
| Chat Overlay | `/api/overlay/chat` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Core Database | `/api/database` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Dashboard Auth | `/api/auth` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |
| Dashboard Controlcenter | `/api/dashboard/controlcenter` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mittel |

## Wichtigste Abweichungen
### Alert-System
- Base: `/api/alerts`
- Fehlende Zielstandard-Endpunkte: `routes`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 80
- Text-/Message-Hinweise gefunden: 33
- JSON-/Fallback-Hinweise gefunden: 80

### SoundAlerts
- Base: `/api/soundalerts`
- Fehlende Zielstandard-Endpunkte: `routes, integrationCheck`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 80
- JSON-/Fallback-Hinweise gefunden: 80

### VIP
- Base: `/api/vip`
- Fehlende Zielstandard-Endpunkte: `status, config, settings, routes, integrationCheck, reload`
- Priorität: **Hoch**
- DB-/Settings-Hinweise gefunden: 80
- Text-/Message-Hinweise gefunden: 7
- JSON-/Fallback-Hinweise gefunden: 80

### Tagebuch
- Base: `/api/tagebuch`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 57
- Text-/Message-Hinweise gefunden: 34
- JSON-/Fallback-Hinweise gefunden: 74

### Todo
- Base: `/api/todo`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 66
- Text-/Message-Hinweise gefunden: 26
- JSON-/Fallback-Hinweise gefunden: 22

### Messages
- Base: `/api/messages`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck`
- Priorität: **Mittel**
- Text-/Message-Hinweise gefunden: 2
- JSON-/Fallback-Hinweise gefunden: 7

### Message Rotator
- Base: `/api/message-rotator`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck`
- Priorität: **Mittel**
- Text-/Message-Hinweise gefunden: 1
- JSON-/Fallback-Hinweise gefunden: 68

### Hug/Rehug
- Base: `/api/hug`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 33
- Text-/Message-Hinweise gefunden: 76
- JSON-/Fallback-Hinweise gefunden: 50

### Clips
- Base: `/api/clip`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 75
- Text-/Message-Hinweise gefunden: 25
- JSON-/Fallback-Hinweise gefunden: 80

### OBS
- Base: `/api/obs`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 10
- JSON-/Fallback-Hinweise gefunden: 35

### Discord
- Base: `/api/discord`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- JSON-/Fallback-Hinweise gefunden: 44

### Twitch
- Base: `/api/twitch`
- Fehlende Zielstandard-Endpunkte: `status, config, settings, routes, integrationCheck, reload`
- Priorität: **Hoch**
- DB-/Settings-Hinweise gefunden: 36
- JSON-/Fallback-Hinweise gefunden: 80

### Chat Overlay
- Base: `/api/overlay/chat`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- Text-/Message-Hinweise gefunden: 1
- JSON-/Fallback-Hinweise gefunden: 14

### Core Database
- Base: `/api/database`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 3
- JSON-/Fallback-Hinweise gefunden: 1

### Dashboard Auth
- Base: `/api/auth`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- DB-/Settings-Hinweise gefunden: 38
- JSON-/Fallback-Hinweise gefunden: 16

### Dashboard Controlcenter
- Base: `/api/dashboard/controlcenter`
- Fehlende Zielstandard-Endpunkte: `config, settings, routes, integrationCheck, reload`
- Priorität: **Mittel**
- JSON-/Fallback-Hinweise gefunden: 40

## Erste Einordnung
### Bereits gut standardisiert

- Sound-System
- TTS

Diese Module haben `/routes` und `/integration-check` und sind als Vorbild für andere Module geeignet.

### Stark DB-basiert, aber Standard-Endpunkte fehlen teilweise

- Alert-System: sehr weit entwickelt, aber `/api/alerts/routes` fehlt.
- SoundAlerts: DB-Settings/Entries vorhanden, aber `/routes` und `/integration-check` fehlen.
- VIP: nutzt andere API-Prefixe (`/api/vip-sound-overlay`, `/api/vip-sound`) statt `/api/vip`; deshalb schlägt die Zielstandard-Prüfung unter `/api/vip` fehl.
- Tagebuch/Todo/Messages/Rotator: funktional vorhanden, aber Zielstandard-Endpunkte teilweise noch nicht einheitlich.

### Wichtig

Diese Matrix beweist nicht, dass ein Modul kaputt ist. Sie zeigt nur, ob es dem neuen Zielstandard entspricht.
## Empfohlene Folge-STEPs
### STEP201.1 – API-Prefix-/Alias-Entscheidung

Klären, ob Module mit alten Prefixen zusätzlich neue Alias-Routen bekommen sollen.

Beispiele:

```text
/api/vip -> Alias auf /api/vip-sound-overlay oder /api/vip-sound
/api/message-rotator -> bestehend prüfen
/api/hug -> tatsächliche Routen prüfen
```

### STEP201.2 – Routes-Endpunkte nachziehen

Priorität:

```text
alerts
soundalerts
tagebuch
todo
messages
message_rotator
vip
```

### STEP201.3 – Integration-Checks nachziehen

Priorität:

```text
soundalerts
alerts routes + ggf. erweiterter integration-check
tagebuch
todo
messages
message_rotator
vip
```

### STEP201.4 – Settings-/Config-Quellen pro Modul dokumentieren

Ziel:

```text
DB
JSON-Fallback
ENV/Secrets
Dashboard-API
```

### STEP202 – Technisches Installer-/Seed-Konzept vorbereiten

Erst nach der Matrix bereinigen, nicht vorher.
## Nicht Teil dieses STEPs
Dieser STEP ändert bewusst nichts an:

```text
Backend-Code
Dashboard-Code
DB-Schema
JSON-Dateien
SQLite-Datei
Routen
Overlays
```
