# STABLE – Sound-System + Alert-Handoff + Runtime Settings Dashboard

Stand: 2026-05-02
Branch: `dev`
Projekt: `stream-control-center` / Sound-System

## Zweck

Dieser STABLE-Stand hält den aktuellen funktionierenden Zwischenstand fest, damit später in einem neuen Chat oder nach weiteren Umbauten sauber weitergearbeitet werden kann.

Der Stand ist kein finaler Release, aber ein stabiler Arbeitsstand für:

```txt
- Sound-System Backend
- AudioDeviceHelper Device-Ausgabe
- Alert-System-Handoff an Sound-System
- SQLite Runtime Settings
- Sound-Dashboard Settings UI Teil 1
- Sound-Dashboard Tab-Layout im Alert-Control-Center-Stil
```

## Wichtige Commits

Bekannte relevante Commits:

```txt
d625421 Apply sound core priority policy
430bcdf Prepare alert visual lead sync
79d3904 Add alert live sound handoff
3924458 Update sound system docs for runtime settings dashboard
```

Zusätzlich lokal/aktuell prüfen:

```powershell
git log --oneline -15
```

Der Code-Commit für `backend/modules/sound_system.js`, `htdocs/dashboard/modules/sound.js` und `htdocs/dashboard/modules/sound.css` muss lokal bereits gepusht sein. Falls unsicher:

```powershell
cd D:\Git\stream-control-center
git status
git log --oneline -10
```

## Betroffene Dateien

```txt
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/sound_output_config.js
backend/modules/sqlite_core.js
backend/modules/helpers/helper_media.js
config/sound_system.json
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/dashboard/modules/alerts.js
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/_overlay-alerts-v2.html
docs/sound_system/STEP_sound_system_2026-05-02.md
docs/settings/SETTINGS_DASHBOARD_COVERAGE.md
docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md
```

## Aktiver Live-Pfad

Für Dashboard-Module gilt:

```txt
Repo:
D:\Git\stream-control-center\htdocs\dashboard\modules\

Live:
D:\Streaming\stramAssets\htdocs\dashboard\modules\
```

Nicht verwenden für aktive Dashboard-Module:

```txt
D:\Streaming\stramAssets\dashboard\modules\
```

## Sound-System Backend

Aktueller Stand:

```txt
- /api/sound/status funktioniert
- /api/sound/play funktioniert
- /api/sound/stop funktioniert
- /api/sound/skip funktioniert
- /api/sound/clear funktioniert
- /api/sound/reset funktioniert
- /api/sound/devices funktioniert
- /api/sound/devices/select funktioniert
- /api/sound/output funktioniert
- /api/sound/settings funktioniert
```

Wichtig:

```txt
sound_system.js muss in /api/_status unter modules gelistet sein.
Wenn nicht: Backend-Startlog prüfen.
```

Prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 10
```

Erwartung:

```txt
modules enthält sound_system.js
rootDir = D:\Streaming\stramAssets
webrootDir = D:\Streaming\stramAssets\htdocs
modulesDir = D:\Streaming\stramAssets\backend\modules
```

## AudioDeviceHelper

Getestetes Gerät:

```txt
Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)
{0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}
```

Getestete Eigenschaften:

```txt
- WASAPI funktioniert
- echte Sounddauer wird per ffprobe ermittelt
- dynamischer Helper-Timeout funktioniert
- lange Sounds brechen nicht mehr wegen Timeout ab
- Device-Ausgabe funktioniert direkt auf Voicemeeter AUX
```

Kurzer Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100" | ConvertTo-Json -Depth 20
```

## Alert-Handoff an Sound-System

Live-Alerts können ihren Sound über das Sound-System starten.

Ablauf:

```txt
1. Alert-System erzeugt Alert-Event.
2. Alert-System sendet prepare an Alert-Overlay.
3. Alert-System ruft /api/sound/play auf.
4. Sound-System queued/sortiert nach Priorität.
5. Wenn Sound-Item dran ist, sendet Sound-System item_starting.
6. Alert-Overlay zeigt den vorbereiteten Alert.
7. Sound-System wartet visualLeadMs, aktuell 150 ms.
8. Sound startet über outputTarget, meist device.
```

Ziel:

```txt
Sound startet nicht vor dem Overlay.
Overlay erscheint möglichst gleichzeitig oder minimal vor Sound.
```

Aktive Werte:

```txt
queue.alertSync.enabled=true
queue.alertSync.visualLeadMs=150
queue.alertSync.maxVisualLeadMs=500
```

## Dashboard Alert-Vorschau vs. Live-Test

In `htdocs/dashboard/modules/alerts.js` sind Vorschau und Live-Test getrennt.

```txt
👁 Lokale Vorschau:
- nur auf Bearbeiter-Rechner
- Popout/Iframe lokal
- Sound lokal im Dashboard-Browser
- kein OBS
- keine Alert-Queue
- kein Sound-System
- kein Voicemeeter

● Live-Test:
- echte Alert-Pipeline
- OBS-Overlay
- Sound-System
- Audiogerät/Voicemeeter
```

## SQLite Runtime Settings

Aktive Datenbank:

```txt
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Tabelle:

```sql
CREATE TABLE IF NOT EXISTS sound_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);
```

Erlaubte Blöcke:

```txt
output
overlay
queue
priorities
defaults
categoryDefaults
targets
```

Merge-Logik:

```txt
DEFAULT_CONFIG
+ config/sound_system.json
+ SQLite sound_settings
= effektive Runtime-Config
```

Settings prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

Test-Override:

```powershell
$body = @{
  queue = @{
    maxLength = 55
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 20
```

Prüfen:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status").config.queue.maxLength
```

Zurücksetzen:

```powershell
$body = @{
  queue = @{
    maxLength = 50
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 20
```

## Sound-Dashboard

Dateien:

```txt
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

Aktuelles Layout:

```txt
Header / Hero
Tab-Leiste
Bereiche je Tab
```

Tabs:

```txt
Übersicht
Ausgabe
Queue
Einstellungen
Sounds
```

Tab-Mapping:

```txt
Übersicht:
- Status
- Aktuell
- Policy
- Queue

Ausgabe:
- Ausgabe-Modus
- Device-Auswahl
- Device-Lautstärke
- Ausgabe speichern
- Geräte neu laden
- Test Ausgabe

Queue:
- Policy
- Queue

Einstellungen:
- Runtime Settings UI Teil 1

Sounds:
- Sound-Liste
```

Wichtig:

```txt
Die Einstellungen-Karte darf nur im Tab Einstellungen erscheinen.
Der Tab-Name Übersicht muss korrekt angezeigt werden.
```

## Sound-Dashboard Settings UI Teil 1

Über das Dashboard editierbar und via `/api/sound/settings` in SQLite gespeichert:

```txt
Overlay-Lautstärke
Device-Lautstärke
Both-Lautstärke
Overlay fallbackFinishMs
Abstand zwischen Sounds
Queue aktiv
Max Queue
Drop when full
Sort by priority
Parallel erlauben
Max Parallel
Alert-Sync aktiv
visualLeadMs
maxVisualLeadMs
```

Noch nicht in Teil 1 enthalten:

```txt
Interrupt-Regeln
Drop-Regeln Details
Cooldowns
Dedupe
Prioritäten-Tabelle
Kategorie-Defaults
Expertenbereich Helper-Pfad/PlaybackMode/Extensions
```

## Bekannte Stolperfallen

### Keine `.js` Backup-Dateien in `backend/modules`

Der Server lädt alle `.js` Dateien im Modulordner. Deshalb niemals `.js`-Backups dort liegen lassen.

Richtig:

```txt
*.bak
*.js.bak
Backups außerhalb von backend/modules
```

Falsch:

```txt
sound_system.backup_before_xyz.js
```

### Backend-Start sichtbar prüfen

Wenn ein Modul nicht geladen wird:

```powershell
cd D:\Streaming\stramAssets
node backend\server.js
```

Oder das sichtbare Neustart-Script verwenden.

Wichtige Fehler aus diesem Step:

```txt
Cannot access 'SOUND_SETTINGS_SCHEMA_MODULE' before initialization
no such table: sound_settings
```

Beide wurden im aktuellen Stand behoben.

## Rollback-Hinweise

Vor den Patches wurden `.bak` Dateien erstellt, z. B.:

```txt
htdocs/dashboard/modules/sound.backup_before_settings_ui_part1_*.bak
htdocs/dashboard/modules/sound.backup_before_tabs_layout_*.js.bak
htdocs/dashboard/modules/sound.backup_before_tabs_layout_*.css.bak
backend/modules/sound_system.backup_before_runtime_settings_*.bak
backend/modules/sound_system.backup_before_runtime_settings_tdz_fix_*.bak
backend/modules/sound_system.backup_before_runtime_settings_schema_fix_*.bak
```

Rollback nur gezielt und nur wenn nötig. Nach Rollback immer:

```powershell
node --check <datei>
Backend neu starten
/api/_status prüfen
```

## Offene nächste Steps

### Kurzfristig

```txt
- git status lokal prüfen
- sicherstellen, dass sound_system.js, sound.js und sound.css auf origin/dev gepusht sind
- Device skip/stop nach Sound-System-Änderungen immer kurz testen
```

### Nächster Ausbau: Sound-Dashboard Settings UI Teil 2

```txt
- Interrupt-Regeln editierbar machen
- Drop-Regeln editierbar machen
- Cooldowns editierbar machen
- Dedupe editierbar machen
- Prioritäten-Tabelle editierbar machen
- Kategorie-Defaults editierbar machen
```

### Später

```txt
- Alert liveAlert/preview Settings ins Alert-Dashboard bringen
- Rollen/Rechte für Live-Test und Sound-Policy absichern
- Audit-Logging für Dashboard-Änderungen
- Discord-Ausgabe über Sound-System planen
- Sound-Bibliothek/Sound-Dateien später DB-/Dashboard-basiert verwalten
```

## Prüfbefehle für neuen Chat

```powershell
cd D:\Git\stream-control-center
git pull --rebase origin dev
git status

Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

Wenn alles passt:

```txt
/api/_status enthält sound_system.js
/api/sound/settings ok=true
/api/sound/status zeigt config.queue.maxLength=50
Dashboard Sound-System zeigt Tabs korrekt
```
