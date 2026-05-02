# Settings Dashboard Coverage

Stand: 2026-05-02
Projekt: `stream-control-center` / Sound-System / Alert-System
Branch: `dev`

## Ziel dieser Datei

Diese Datei hält fest, welche Einstellungen aktuell existieren, wo sie gespeichert werden, ob sie im Dashboard sichtbar/editierbar sind und ob sie künftig in SQLite-/Runtime-Settings überführt werden sollen.

Grundregel für künftige Arbeit:

```txt
Bestehende Funktionalität nicht entfernen.
Vor Änderungen immer aktuellen Repo-/Live-Dateistand prüfen.
Dashboard-Module liegen im Repo unter htdocs/dashboard/modules/.
Live-System soll denselben Pfad nutzen: D:\Streaming\stramAssets\htdocs\dashboard\modules\.
Konfigurierbare Werte sollen langfristig über Dashboard steuerbar sein.
Runtime-/User-/Dashboard-Settings sollen bevorzugt in SQLite liegen, nicht hart im Code.
Secrets/Tokens niemals im Klartext im Dashboard anzeigen.
```

## Speicherorte / Config-Strategie

### Aktueller Zustand

```txt
Sound-System:
- Hauptconfig: config/sound_system.json
- Runtime-Ausgabeänderungen: aktuell JSON/API-basiert über /api/sound/output
- SQLite-Settings: noch nicht sauber vorhanden

Alert-System:
- Hauptconfig: config/alert_system.json
- viele fachliche Daten in SQLite:
  - alert_rules
  - alert_assets
  - alert_events
  - alert_text_variants
  - alert_test_presets
  - alert_display_profiles
  - alert_chat_blocks
  - alert_chat_outbox
  - alert_settings
- Runtime-Settings vorbereitet über /api/alerts/settings
```

### Zielbild

```txt
DEFAULT_CONFIG im Code
+ JSON-Basisconfig als portable Grundkonfiguration
+ SQLite Runtime Settings für Dashboard-Änderungen
= effektive Runtime-Config
```

Wichtig:

```txt
SQLite nie neu bauen/überschreiben.
Nur sanfte Migrationen per CREATE TABLE IF NOT EXISTS / ALTER TABLE IF NOT EXISTS-Logik.
Bestehende Daten nicht löschen.
```

## Modul: Sound-System

Wichtige Dateien:

```txt
backend/modules/sound_system.js
backend/modules/sound_output_config.js
backend/modules/helpers/helper_media.js
config/sound_system.json
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/overlays/sound_system_overlay.html
tools/audio-device-helper/Program.cs
tools/audio-device-helper/AudioDeviceHelper.csproj
tools/audio-device-helper/build-helper.ps1
```

### Sound-System Coverage-Tabelle

| Bereich | Setting | Aktueller Speicherort | Dashboard sichtbar | Dashboard editierbar | Soll in SQLite Runtime Settings | Priorität | Bemerkung |
|---|---|---:|---:|---:|---:|---:|---|
| Basis | `enabled` | JSON | ja | nein | ja | hoch | Globaler Modul-Schalter. Sollte Streamer/Admin editieren können. |
| Basis | `version` | JSON | ja/status | nein | nein | niedrig | Technisch, nicht editierbar. |
| Routes | `routes.prefix` | JSON | nein | nein | nein | niedrig | Technisch. Nicht im normalen Dashboard. |
| WebSocket | `websocket.enabled` | JSON | nein | nein | optional | mittel | Expertenbereich/Local Admin. |
| WebSocket | `websocket.op` | JSON | nein | nein | nein | niedrig | Technisch. |
| Overlay | `overlay.enabled` | JSON | indirekt | teilweise über Output | ja | hoch | Sollte sauber in Output/Overlay-Settings sichtbar sein. |
| Overlay | `overlay.clientRequired` | JSON | nein | nein | ja | mittel | Experten-/Fallback-Option. |
| Overlay | `overlay.fallbackFinishMs` | JSON | nein | nein | ja | mittel | Wichtig für Ausfallsicherheit. |
| Overlay | `overlay.introMs` | JSON | nein | nein | ja | niedrig | Overlay-Timing. |
| Overlay | `overlay.outroMs` | JSON | nein | nein | ja | niedrig | Overlay-Timing. |
| Overlay | `overlay.gapBetweenSoundsMs` | JSON | nein | nein | ja | mittel | Queue-Abstand. |
| Output | `output.defaultTarget` | JSON/API | ja | ja | ja | hoch | Aktuell über Dashboard editierbar. |
| Output | `output.allowPerSoundOverride` | JSON | nein | nein | ja | mittel | Sollte später editierbar sein. |
| Output Overlay | `output.targets.overlay.enabled` | JSON/API | ja | ja über Modus | ja | hoch | Aktuell indirekt über Ausgabemodus. |
| Output Overlay | `output.targets.overlay.label` | JSON | nein | nein | optional | niedrig | Anzeige-Text. |
| Output Overlay | `output.targets.overlay.mode` | JSON | nein | nein | nein | niedrig | Technisch. |
| Output Overlay | `output.targets.overlay.overlayUrl` | JSON | nein | nein | optional | mittel | Expertenbereich. |
| Output Overlay | `output.targets.overlay.defaultVolume` | JSON | nein | nein | ja | mittel | Fehlt im Dashboard. |
| Output Device | `output.targets.device.enabled` | JSON/API | ja | ja über Modus | ja | hoch | Aktuell indirekt über Ausgabemodus. |
| Output Device | `output.targets.device.selectedDeviceId` | JSON/API | ja | ja | ja | hoch | Aktuell editierbar. |
| Output Device | `output.targets.device.selectedDeviceName` | JSON/API | ja | ja | ja | hoch | Aktuell editierbar. |
| Output Device | `output.targets.device.defaultVolume` | JSON/API | ja | ja | ja | hoch | Aktuell editierbar. |
| Output Device | `output.targets.device.helper.enabled` | JSON | nein | nein | ja | mittel | Expertenbereich. |
| Output Device | `output.targets.device.helper.path` | JSON | nein | nein | optional | mittel | Local Admin/Expertenbereich. |
| Output Device | `output.targets.device.helper.timeoutMs` | JSON | nein | nein | ja | mittel | Dynamischer Timeout existiert, Basiswert sollte editierbar sein. |
| Output Device | `output.targets.device.helper.playbackMode` | JSON | nein | nein | ja | mittel | auto/wasapi/etc. Expertenbereich. |
| Output Both | `output.targets.both.enabled` | JSON/API | ja | ja über Modus | ja | hoch | Aktuell indirekt über Ausgabemodus. |
| Output Both | `output.targets.both.defaultVolume` | JSON | nein | nein | ja | mittel | Fehlt. |
| Queue | `queue.enabled` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Queue | `queue.maxLength` | JSON | ja | nein | ja | hoch | Wird angezeigt, nicht editierbar. |
| Queue | `queue.dropWhenFull` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Queue | `queue.defaultPriority` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Queue | `queue.sortByPriority` | JSON | ja | nein | ja | hoch | Wird angezeigt, nicht editierbar. |
| Queue | `queue.allowParallel` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Queue | `queue.maxParallel` | JSON | ja | nein | ja | hoch | Wird angezeigt, nicht editierbar. |
| Queue | `queue.parallelCategories` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Queue | `queue.parallelSoundIds` | JSON | nein | nein | ja | mittel | Später Sound-Auswahl. |
| Alert Sync | `queue.alertSync.enabled` | JSON | ja | nein | ja | hoch | Wird angezeigt, nicht editierbar. |
| Alert Sync | `queue.alertSync.visualLeadMs` | JSON | nein/Status indirekt | nein | ja | hoch | Wichtig: Overlay vor Sound. |
| Alert Sync | `queue.alertSync.maxVisualLeadMs` | JSON | nein | nein | ja | mittel | Safety-Limit. |
| Interrupt | `queue.interruptRules.enabled` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Interrupt | `queue.interruptRules.minPriority` | JSON | ja | nein | ja | hoch | Wird angezeigt, nicht editierbar. |
| Interrupt | `queue.interruptRules.requireHigherPriority` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Interrupt | `queue.interruptRules.allowForce` | JSON | nein | nein | ja | mittel | Admin/Owner. |
| Interrupt | `queue.interruptRules.allowOverride` | JSON | nein | nein | ja | mittel | Vorsicht, kann Verhalten stark ändern. |
| Drop | `queue.dropRules.enabled` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Drop | `queue.dropRules.dropIfQueueFullBelowPriority` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Drop | `queue.dropRules.dropIfBusyBelowPriority` | JSON | nein | nein | ja | mittel | Muss editierbar werden. |
| Cooldown | `queue.cooldowns.enabled` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Cooldown | `queue.cooldowns.defaultMs` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Cooldown | `queue.cooldowns.sameSoundMs` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Cooldown | `queue.cooldowns.sameCategoryMs` | JSON | nein | nein | ja | mittel | Muss editierbar werden. |
| Cooldown | `queue.cooldowns.sameUserMs` | JSON | nein | nein | ja | mittel | Muss editierbar werden. |
| Dedupe | `queue.dedupe.enabled` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Dedupe | `queue.dedupe.sameSoundWindowMs` | JSON | nein | nein | ja | hoch | Muss editierbar werden. |
| Dedupe | `queue.dedupe.sameUserSoundWindowMs` | JSON | nein | nein | ja | mittel | Muss editierbar werden. |
| Targets | `targets.stream.enabled` | JSON | nein | nein | ja | mittel | Stream/Discord-Zielmodell später. |
| Targets | `targets.discord.enabled` | JSON | nein | nein | ja | mittel | Für spätere Discord-Ausgabe. |
| Targets | `targets.both.enabled` | JSON | nein | nein | ja | mittel | Für Stream+Discord. |
| Priorities | `priorities.*` | JSON | teilweise sichtbar | nein | ja | hoch | Muss als Tabelle editierbar werden. |
| Defaults | `defaults.*` | JSON | nein | nein | ja | hoch | Default für manuelle/API-Sounds. |
| Category Defaults | `categoryDefaults.*` | JSON | nein | nein | ja | hoch | Muss editierbar werden, besonders alert/fun/vip/admin. |
| Sounds | `sounds[]` | JSON | ja | Play ja, edit nein | später DB/SQLite | mittel | Langfristig eigene Sound-Bibliothek/Tabelle. |
| Files | `soundsBaseDir` | JSON | nein | nein | optional | mittel | Local Admin/Expertenbereich. |
| Files | `allowedExtensions` | JSON | nein | nein | optional | niedrig | Local Admin/Expertenbereich. |

### Sound-System Dashboard-Seiten, Zielstruktur

```txt
Sound-System Hauptseite:
- Status
- Current
- Queue
- Schnellaktionen

Sound-System > Ausgabe:
- Modus overlay/device/both
- Overlay-Volume
- Device wählen
- Device-Volume
- Both-Volume
- Helper-Status

Sound-System > Queue & Policy:
- Queue aktiv
- Max Queue
- Sortierung nach Priorität
- Drop bei voller Queue
- Parallel aktiv
- Max Parallel
- Parallel-Kategorien

Sound-System > Alert Sync:
- Alert-Sync aktiv
- visualLeadMs
- maxVisualLeadMs
- Test-Hinweis: Overlay zuerst, Sound minimal später

Sound-System > Prioritäten:
- Tabelle priorities.*
- Werte editierbar

Sound-System > Kategorie-Defaults:
- Kategorie
- priority
- canInterrupt
- canBeInterrupted
- queueIfBusy
- dropIfBusy
- parallelAllowed

Sound-System > Expertenbereich:
- Helper-Pfad
- Helper-Timeout
- Playback-Mode
- allowedExtensions
- soundsBaseDir
```

## Modul: Alert-System

Wichtige Dateien:

```txt
backend/modules/alert_system.js
config/alert_system.json
htdocs/dashboard/modules/alerts.js
htdocs/overlays/_overlay-alerts-v2.html
```

### Alert-System SQLite-Tabellen

Aktuell vorhanden/vorgesehen:

```txt
alert_types
alert_assets
alert_rules
alert_events
alert_text_variants
alert_test_presets
alert_display_profiles
alert_chat_blocks
alert_chat_outbox
alert_settings
```

### Alert-System Dashboard Coverage

| Bereich | Setting/Daten | Speicherort | Dashboard sichtbar | Dashboard editierbar | Soll SQLite | Priorität | Bemerkung |
|---|---|---:|---:|---:|---:|---:|---|
| Basis | `enabled` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Alert-System aktiv. |
| Basis | `overlayEnabled` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Overlay aktiv. |
| Basis | `queueEnabled` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Queue aktiv. |
| Upload | `uploadEnabled` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Uploads aktiv. |
| Upload | `allowLanUploads` | JSON | ja | ja Config-Seite | optional Runtime | mittel | LAN Uploads. |
| Upload | `soundsDir` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Pfad. |
| Upload | `imagesDir` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Pfad. |
| Upload | `maxSoundSizeBytes` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Upload-Limit. |
| Upload | `maxImageSizeBytes` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Upload-Limit. |
| Duration | `defaultDurationMs` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Standarddauer. |
| Duration | `soundDurationPaddingMs` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Sound-Puffer. |
| Duration | `minAutoDurationMs` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Mindestdauer. |
| Duration | `maxAutoDurationMs` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Maxdauer. |
| ffprobe | `ffprobeTimeoutMs` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Scan/Upload. |
| Chat | `chatMessageEnabled` | JSON | ja | ja Config-Seite | optional Runtime | hoch | Chat-Outbox. |
| Chat | `chatMessagePostUrl` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Darf keine Secrets zeigen. |
| Chat | `chatMessagePostMethod` | JSON | ja | ja Config-Seite | optional Runtime | mittel | POST/GET. |
| Chat | `chatMessageTimeoutMs` | JSON | ja | ja Config-Seite | optional Runtime | mittel | Timeout. |
| Preview | `preview.localBrowserAudio` | JSON/alert_settings | nein | nein | ja | hoch | Für Dashboard-Vorschau wichtig. |
| Preview | `preview.sendToLiveOverlay` | JSON/alert_settings | nein | nein | ja | mittel | Sollte nur Experten/Streamer. |
| Preview | `preview.sendToSoundSystem` | JSON/alert_settings | nein | nein | ja | mittel | Vorsicht, kann Tests live machen. |
| Live Alert | `liveAlert.soundSystemEnabled` | JSON/alert_settings | nein | nein | ja | hoch | Muss im Dashboard editierbar werden. |
| Live Alert | `liveAlert.soundSystemPlayUrl` | JSON/alert_settings | nein | nein | ja | mittel | Local Admin/Experte. |
| Live Alert | `liveAlert.soundSystemOutputTarget` | JSON/alert_settings | nein | nein | ja | hoch | device/overlay/both. |
| Live Alert | `liveAlert.soundSystemCategory` | JSON/alert_settings | nein | nein | ja | mittel | Standard: alert. |
| Live Alert | `liveAlert.soundSystemSource` | JSON/alert_settings | nein | nein | ja | niedrig | Standard: alert_system. |
| Live Alert | `liveAlert.waitForSoundItemStarted` | JSON/alert_settings | nein | nein | ja | hoch | Muss an bleiben für Sync. |
| Live Alert | `liveAlert.fallbackShowOnSoundError` | JSON/alert_settings | nein | nein | ja | hoch | Safety. |
| Live Alert | `liveAlert.fallbackShowAfterMs` | JSON/alert_settings | nein | nein | ja | mittel | Safety-Timer. |
| Dashboard Settings | `dashboardSettings.preferSqliteSettings` | JSON | nein | nein | nein | niedrig | Technisch. |
| Dashboard Settings | `dashboardSettings.allowRuntimeEdit` | JSON | nein | nein | nein | niedrig | Technisch. |
| Dashboard Settings | `dashboardSettings.settingsTable` | JSON | nein | nein | nein | niedrig | Technisch. |
| Regeln | `alert_rules` | SQLite | ja | ja | ja | erledigt | Regeln/Staffelungen. |
| Assets | `alert_assets` | SQLite | ja | ja | ja | erledigt | Upload/Sounds/Grafiken. |
| Textvarianten | `alert_text_variants` | SQLite | ja | ja | ja | erledigt | Overlay-Texte. |
| Chat-Blöcke | `alert_chat_blocks` | SQLite | ja | ja | ja | erledigt | Chat-Texte. |
| Display-Profile | `alert_display_profiles` | SQLite | ja | ja | ja | erledigt | Design/Live-Vorschau. |
| Testpresets | `alert_test_presets` | SQLite | ja | ja | ja | erledigt | Testwerte. |
| Events/History | `alert_events` | SQLite | ja | Replay ja | ja | erledigt | History. |

### Alert Dashboard, aktueller besonderer Stand

`htdocs/dashboard/modules/alerts.js` trennt:

```txt
👁 Lokale Vorschau:
- lokal am Rechner des Bearbeiters
- Popout/Iframe für Bild
- Sound direkt über Dashboard-Browser per playSoundUrl(...)
- kein OBS
- keine Queue
- kein Sound-System

● Live-Test:
- echte Pipeline
- /api/alerts/test mit mode=live und isTest=true
- OBS-Overlay
- Sound-System
- Audiogerät/Voicemeeter je nach Config
```

## Rollen-/Rechte-Relevanz

Noch nicht technisch vollständig umgesetzt, aber beim Dashboard-Ausbau berücksichtigen:

```txt
Mod:
- lesen/senden über eigenen Twitch-Account
- Userinfo
- Clips
- Alerts ansehen/replay
- einfache Sounds stoppen
- Tagebuch/Todo schreiben

SuperMod:
- zusätzlich OBS Quick
- Sound-Queue verwalten
- Alert-Queue verwalten
- Deathcounter/Challenges bedienen

Streamer:
- Sound-System konfigurieren
- Alerts konfigurieren
- OBS Details/Overlays
- Stream-Control

Local Admin:
- technische Configs, Logs, Diagnose, Backup, Module reload
- nur lokal/LAN

Owner:
- alles, inkl. Rollen, Tokens, Secrets, Restore/Danger Zone
```

Konsequenz:

```txt
Live-Test in OBS: mindestens Streamer/SuperMod, besser Streamer/Owner bis Rechte sauber umgesetzt sind.
Sound-Policy ändern: Streamer/Owner.
Technische Pfade/Helper/Secrets: Local Admin/Owner.
```

## Konkrete nächste Umsetzungsschritte

### Step 1: Sound Runtime Settings vorbereiten

Neue SQLite-Tabelle, z. B.:

```sql
CREATE TABLE IF NOT EXISTS sound_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);
```

Neue API:

```txt
GET  /api/sound/settings
POST /api/sound/settings
```

Merge-Reihenfolge:

```txt
DEFAULT_CONFIG
+ config/sound_system.json
+ SQLite sound_settings
```

### Step 2: Sound-Dashboard Settings-Seite bauen

In `htdocs/dashboard/modules/sound.js`:

```txt
- eigene Settings-Sektion oder Tabs
- Ausgabe
- Queue
- Alert-Sync
- Interrupt
- Drop/Cooldown/Dedupe
- Prioritäten
- Kategorie-Defaults
- Expertenbereich
```

### Step 3: Alert liveAlert/preview Settings ins Dashboard

In `htdocs/dashboard/modules/alerts.js`, Config-Seite erweitern:

```txt
- preview.localBrowserAudio
- preview.sendToLiveOverlay
- preview.sendToSoundSystem
- liveAlert.soundSystemEnabled
- liveAlert.soundSystemOutputTarget
- liveAlert.waitForSoundItemStarted
- liveAlert.fallbackShowOnSoundError
- liveAlert.fallbackShowAfterMs
```

Technische Felder wie `soundSystemPlayUrl` nur im Expertenbereich.

### Step 4: Rollen/Rechte absichern

```txt
- Live-Test Button rechtlich/rollentechnisch absichern
- Sound-Policy nur Streamer/Owner
- technische Felder nur Local Admin/Owner
- jede Änderung später audit-loggen
```

## Offene Entscheidung

Für Sound-System-Settings ist noch zu entscheiden:

```txt
Variante A:
Einzelne Keys in sound_settings, z. B. queue.maxLength

Variante B:
Ganze Blöcke als JSON, z. B. key='queue', value_json={...}

Empfehlung:
Blockweise speichern:
- output
- overlay
- queue
- priorities
- defaults
- categoryDefaults
- targets
```

Vorteil: leichter im Dashboard zu speichern und später zu migrieren.

Nachteil: Einzelne Werte sind weniger direkt SQL-filterbar, was hier aber egal ist.
