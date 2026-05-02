# UPDATE – Sound-Dashboard Settings UI Teil 2A

Stand: 2026-05-02
Branch: `dev`
Projekt: `stream-control-center` / Sound-System

## Zweck

Dieses Update ergänzt den STABLE-Stand:

```txt
docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md
```

um den erfolgreich getesteten Ausbau **Sound-Dashboard Settings UI Teil 2A**.

## Status

Teil 2A ist getestet und funktioniert.

Neu im Dashboard editierbar:

```txt
- Interrupt-Regeln
- Drop-Regeln
- Cooldowns
- Dedupe
- Prioritäten
- wichtigste Kategorie-Defaults
```

Speicherung läuft weiter über:

```txt
POST /api/sound/settings
→ SQLite Tabelle sound_settings
```

## Betroffene Dateien

```txt
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

Falls noch nicht erledigt, lokalen Live-Stand ins Repo übernehmen:

```powershell
Copy-Item "D:\Streaming\stramAssets\htdocs\dashboard\modules\sound.js" `
  "D:\Git\stream-control-center\htdocs\dashboard\modules\sound.js" `
  -Force

Copy-Item "D:\Streaming\stramAssets\htdocs\dashboard\modules\sound.css" `
  "D:\Git\stream-control-center\htdocs\dashboard\modules\sound.css" `
  -Force

cd D:\Git\stream-control-center
node --check "htdocs\dashboard\modules\sound.js"
git status
git add htdocs/dashboard/modules/sound.js htdocs/dashboard/modules/sound.css
git commit -m "Expand sound runtime settings dashboard"
git pull --rebase origin dev
git push origin dev
```

## Neue editierbare Bereiche im Tab Einstellungen

### Interrupt-Regeln

```txt
queue.interruptRules.enabled
queue.interruptRules.minPriority
queue.interruptRules.requireHigherPriority
queue.interruptRules.allowForce
queue.interruptRules.allowOverride
```

### Drop-Regeln

```txt
queue.dropRules.enabled
queue.dropRules.dropIfQueueFullBelowPriority
queue.dropRules.dropIfBusyBelowPriority
```

### Cooldowns

```txt
queue.cooldowns.enabled
queue.cooldowns.defaultMs
queue.cooldowns.sameSoundMs
queue.cooldowns.sameCategoryMs
queue.cooldowns.sameUserMs
```

### Dedupe

```txt
queue.dedupe.enabled
queue.dedupe.sameSoundWindowMs
queue.dedupe.sameUserSoundWindowMs
```

### Prioritäten

```txt
priorities.admin
priorities.system
priorities.alert_critical
priorities.alert
priorities.channel_reward
priorities.vip
priorities.crew
priorities.special
priorities.tts
priorities.fun
priorities.background
priorities.decor
```

### Kategorie-Defaults

Aktuell im Dashboard editierbar:

```txt
categoryDefaults.alert
categoryDefaults.alert_critical
categoryDefaults.admin
categoryDefaults.system
categoryDefaults.vip
categoryDefaults.fun
categoryDefaults.background
```

Pro Kategorie:

```txt
priority
canInterrupt
canBeInterrupted
queueIfBusy
dropIfBusy
parallelAllowed
```

## Test

Getesteter Ablauf:

```txt
1. Dashboard → Sound-System → Einstellungen öffnen.
2. Alert-Priorität von 80 auf 81 setzen.
3. Settings speichern.
4. /api/sound/status prüfen.
5. Ergebnis: config.priorities.alert = 81.
6. Danach wieder auf 80 zurücksetzen.
```

Prüfbefehl:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status").config.priorities.alert
```

Erwartung nach Rücksetzung:

```txt
80
```

## Wichtige Regeln

```txt
- Bestehende Sound-Funktionalität nicht entfernen.
- Settings werden blockweise in SQLite sound_settings gespeichert.
- config/sound_system.json bleibt Basis-Konfiguration.
- Effektive Runtime-Config kommt aus JSON + SQLite.
- Nach UI-Änderungen immer node --check htdocs/dashboard/modules/sound.js ausführen.
- Nach Sound-System-Änderungen kurz Device/Skip/Stop testen.
```

## Aktueller Dashboard-Aufbau

```txt
Sound-System
├─ Übersicht
│  ├─ Status
│  ├─ Aktuell
│  ├─ Policy
│  └─ Queue
├─ Ausgabe
│  └─ Output/Device-Steuerung
├─ Queue
│  ├─ Policy
│  └─ Queue
├─ Einstellungen
│  ├─ Ausgabe & Overlay
│  ├─ Queue & Alert-Sync
│  ├─ Interrupt-Regeln
│  ├─ Drop-Regeln
│  ├─ Cooldowns & Dedupe
│  ├─ Prioritäten
│  └─ Kategorie-Defaults
└─ Sounds
   └─ Sound-Liste
```

## Offene nächste Schritte

### Kurzfristig

```txt
- Doku/Stable-Hauptdatei bei Gelegenheit zusammenführen.
- Sicherstellen, dass Teil-2A-Codecommit auf origin/dev liegt.
- Nach Änderungen im Dashboard einmal hart neu laden: Strg+F5.
```

### Nächster Ausbau

```txt
Sound-Dashboard Settings UI Teil 2B / Expertenbereich:
- Helper-Pfad anzeigen/editierbar machen
- Helper timeoutMs
- Playback mode
- Overlay URL
- allowedExtensions
- soundsBaseDir
- Parallel-Kategorien komfortabel editierbar
- Sound-Bibliothek später DB-/Dashboard-basiert planen
```

### Danach

```txt
Alert-Dashboard Runtime Settings:
- preview.localBrowserAudio
- preview.sendToLiveOverlay
- preview.sendToSoundSystem
- liveAlert.soundSystemEnabled
- liveAlert.soundSystemOutputTarget
- liveAlert.waitForSoundItemStarted
- liveAlert.fallbackShowOnSoundError
- liveAlert.fallbackShowAfterMs
```
