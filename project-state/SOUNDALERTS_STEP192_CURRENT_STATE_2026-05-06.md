# SoundAlerts / Sound-System – aktueller Stand STEP192

Stand: 2026-05-06

## Projekt

Repo:
https://github.com/ForrestCGN/stream-control-center

Branch:
dev

Lokales Repo:
D:\Git\stream-control-center

Live-System:
D:\Streaming\stramAssets

Wichtige Regel:
Keine bestehende Funktionalitaet entfernen. Bestehende Systeme muessen weiterlaufen.

## Aktueller Arbeitsbereich

SoundAlerts Bridge + Sound-System + Dashboard SoundAlerts.

## Erfolgreich abgeschlossen

### STEP192.1 – SoundAlerts Entries in DB

Ziel:
SoundAlert-Eintraege/Mappings nicht mehr hauptsaechlich aus JSON lesen, sondern DB-basiert verwalten.

Status:
Erfolgreich getestet.

Neue Hauptquelle:
SQLite DB:
D:\Streaming\stramAssets\data\sqlite\app.sqlite

Tabelle:
soundalerts_bridge_entries

Weiter vorhanden:
config/soundalerts_bridge.json bleibt Seed/Fallback, nicht loeschen.

Wichtig:
JSON rules werden nicht geloescht.
DB wird bevorzugt genutzt.
Wenn DB nicht verfuegbar ist, bleibt JSON als Fallback.

### STEP192.1.1 – SoundAlerts Defaults/Save Cleanup

Status:
Erfolgreich getestet.

Version:
soundalerts_bridge version = 0.1.3

Fixes:
- category leer/falsch wird sauber normalisiert.
- Standard fuer normale SoundAlerts: channel_reward.
- Video bekommt outputTarget overlay.
- Audio bekommt outputTarget device.
- priority bleibt leer/null, wenn kein Override gesetzt ist.
- Dashboard speichert Eintraege korrekt.
- Sound-System bekommt korrekte Kategorie/Output-Werte.

## Getesteter Eintrag

SoundAlert:
Fahrstuhl Sound

Aktueller korrekter DB-Zustand:

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

Priority:
Kein Override gesetzt. Effektiv kommt die Prioritaet aus Kategorie channel_reward = 70.

## Erfolgreiche Tests

### Entries API

PowerShell:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Erwartung:
- source = db
- category = channel_reward
- outputTarget = overlay
- volume = 100
- priority fehlt/null

### Status API

PowerShell:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
```

Gesehener Stand:
- version = 0.1.3
- database.ok = true
- entriesTable = soundalerts_bridge_entries
- entriesStats.total = 1
- entriesStats.active = 1

### Manuelles Sound-System

PowerShell:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=soundalerts/video/3cgn.mp4&category=channel_reward&outputTarget=overlay&volume=100" | ConvertTo-Json -Depth 30
```

Erfolgreich:
- started = true
- file = soundalerts/video/3cgn.mp4
- category = channel_reward
- outputTarget = overlay
- priority = 70
- volume = 100
- source = manual

### Echter SoundAlerts-Bridge-Test

Echter Twitch/SoundAlerts-Chattrigger:
ForrestCGN spielt Fahrstuhl Sound fuer 0 Bits!

Erfolgreich:
soundalerts_bridge:
- seen = 1
- parsed = 1
- matched = 1
- queued = 1
- failed = 0
- fileMissing = 0
- lastEvent.soundAlertName = Fahrstuhl Sound
- lastEvent.status = queued
- matchedRuleId = fahrstuhl_sound

sound_system:
- source = soundalerts_bridge
- requestedBy = ForrestCGN
- file = soundalerts/video/3cgn.mp4
- category = channel_reward
- outputTarget = overlay
- priority = 70
- volume = 100

## Aktuelle Dateien aus letzter ZIP

Zuletzt eingespielte ZIP:
STEP192_1_1_SOUNDALERTS_DEFAULTS_SAVE_CLEANUP_2026-05-06.zip

Geaenderte Dateien:
- backend/modules/soundalerts_bridge.js
- htdocs/dashboard/modules/soundalerts.js
- project-state/STEP192_1_1_SOUNDALERTS_DEFAULTS_SAVE_CLEANUP_2026-05-06.md

Syntax wurde vor Lieferung geprueft:
- node -c backend/modules/soundalerts_bridge.js OK
- node -c htdocs/dashboard/modules/soundalerts.js OK

## Wichtige Erkenntnisse / Regeln

### Datenhaltung

Zielregel:
DB ist Hauptspeicher fuer dashboardfaehige Daten.
JSON bleibt Bootstrap / Seed / Fallback / Notfall.
.env bleibt fuer Secrets/Tokens/private Keys.

### SoundAlerts

Eintraege/Mappings:
DB: soundalerts_bridge_entries

Events/Logs:
DB: soundalerts_bridge_events

Config aktuell noch:
config/soundalerts_bridge.json

Noch nicht umgesetzt:
SoundAlerts technische Settings in DB.

### Admin vs Nutzer

Admin-Einstellungen:
- Upload-Pfade
- Limits
- erlaubte Endungen
- Bot-/Parser-/System-Defaults
- Dedupe-/Cooldown-Werte
- globale Modulaktivierung

Nutzer-/Modul-Einstellungen:
- SoundAlert-Eintrag bearbeiten
- Datei hochladen/zuweisen
- aktiv/inaktiv
- Label
- Kategorie
- Prioritaet-Override
- Lautstaerke
- Testen
- Loeschen/Ignorieren

## Noch offen / naechste Schritte

### Direkt danach

1. Commit/Sync ausfuehren, falls noch nicht gemacht:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: normalize soundalerts entry defaults"
```

2. Danach GitHub/Live-Sync wie gewohnt pruefen.

### Naechster fachlicher Step

STEP192.2 – SoundAlerts Settings in DB

Ziel:
Admin-/dashboardfaehige technische SoundAlerts-Settings aus JSON in DB ziehen.

Beispiele:
- enabled
- soundSystem.defaultCategory
- soundSystem.defaultPriority
- soundSystem.audioOutputTarget
- soundSystem.videoOutputTarget
- soundSystem.defaultVolume
- upload.audioDir
- upload.videoDir
- upload.maxAudioSizeBytes
- upload.maxVideoSizeBytes
- upload.allowedAudioExtensions
- upload.allowedVideoExtensions
- upload.allowOverwrite
- chatMessages.enabled
- chatMessages.onMissingFile
- chatMessages.cooldownMs
- dedupe.windowMs

Wichtig:
Vorher pruefen, ob es bereits ein zentrales Settings-System gibt.
Nicht blind neue Parallelstruktur bauen.

### Danach

STEP193 – SoundAlerts Inbox / Auto Entries

Ziel:
Wenn ein SoundAlerts-Chateintrag kommt, der noch keinen Eintrag hat:
- DB-Eintrag automatisch als new_detected erstellen.
- Wenn Datei fehlt: missing_file.
- Wenn Datei vorhanden: file_matched/ready.
- Dashboard zeigt neue automatische Eintraege direkt sichtbar an.
- Datei hochladen/zuweisen aus dem Eintrag heraus.

### Spaeter

Admin-Config UI:
- eigener Bereich "SoundAlerts"
- nicht unter Sound-System Experten
- Admin-Einstellungen und Nutzer-/Modul-Einstellungen sauber trennen

Upload:
- Max Audio/Video sichtbar anzeigen
- file_too_large lesbar anzeigen
- Overwrite-Abfrage, wenn Datei existiert
- Upload-Limits config-/DB-basiert
- Pfade immer konfigurierbar

## Aktuelle bekannte Werte

config/soundalerts_bridge.json upload:
- maxAudioSizeBytes = 15728640
- maxVideoSizeBytes = 104857600 aktuell 100 MB
Hinweis:
Das getestete grosse Video hatte ca. 390 MB und braucht fuer Upload ein hoeheres Limit, z.B. 524288000.
Das ist noch Admin-/Settings-Thema.

## Wichtig fuer naechsten Chat

Nicht wieder bei null anfangen.

Aktueller stabiler Stand:
SoundAlerts-Bridge 0.1.3
DB Entries aktiv
Fahrstuhl Sound erfolgreich ueber echten SoundAlerts-Chattrigger gestartet
Video ueber Overlay
Kategorie channel_reward
Prioritaet effektiv 70
Volume 100

Keine Funktionalitaet entfernen.
Bei weiteren Aenderungen immer GitHub/dev und echte Dateien als Single Source of Truth nehmen.
