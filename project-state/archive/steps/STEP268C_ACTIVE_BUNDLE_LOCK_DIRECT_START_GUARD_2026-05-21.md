# STEP268C - Active Bundle Lock Direct Start Guard

Stand: 2026-05-21

## Problem

Nach STEP268B liefen Alert-Hauptsound und TTS grundsätzlich wieder zusammen, gleiche Alert-Sounds wurden nicht mehr durch `cooldown_same_sound` gedroppt.

Ein Trace zeigte aber noch ein anderes Problem:

```text
Alert-Hauptsound läuft
Alert-Hauptsound endet
activeBundleLock zeigt noch auf das Alert-Bundle
Alert-TTS liegt bereits in der Queue
SoundAlert/Kanalpunkte kommt neu rein
SoundAlert startet direkt
Alert-TTS kommt erst danach
```

Das ist falsch. Solange ein locked Alert-Bundle aktiv ist, darf kein fremder Sound zwischen Main und TTS starten.

## Ursache

In `enqueueOrStart(item)` wurde bei `state.current === null` ein neu eintreffender Sound direkt gestartet:

```js
startItem(item, "started");
```

Dabei wurde `state.activeBundleLock` nicht hart genug beachtet.

In der kurzen Lücke zwischen zwei Bundle-Items kann `state.current` null sein, obwohl das Bundle durch `state.activeBundleLock` noch aktiv ist.

## Fix

`backend/modules/sound_system.js` wurde erweitert:

- `itemMatchesActiveBundleLock(item)`
- `queueBehindActiveBundleLock(item)`
- Guard in `enqueueOrStart(item)` direkt nach `clearQueue`

Neue Regel:

```text
Wenn state.activeBundleLock gesetzt ist
und das neue Item nicht zu diesem Bundle gehoert:
  nicht direkt starten
  in Queue legen
  reason = active_bundle_lock
```

## Erwartetes Verhalten

Richtig:

```text
Alert Sound
Alert TTS
SoundAlert
VIP
```

Falsch und durch STEP268C verhindert:

```text
Alert Sound
SoundAlert
Alert TTS
VIP
```

## Geaendert

```text
backend/modules/sound_system.js
```

## Nicht geaendert

```text
backend/modules/alert_system.js
app.sqlite
config
Streamer.bot-Flows
Overlay-HTML
VIP-Logik
```

## Einbau nach Projektstandard

Repo ist nicht Live.

Empfohlener Ablauf:

1. Datei aus diesem ZIP nach `D:\Git\stream-control-center\backend\modules\sound_system.js` kopieren.
2. Status pruefen.
3. Commit/push.
4. Mit `01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` nach Live deployen.
5. Live verifizieren.
6. Node neu starten.
7. Kontrolliert testen.

Direkt-Live-Kopie fuer Notfall:

```powershell
Copy-Item "D:\Downloads\STEP268C_ACTIVE_BUNDLE_LOCK_DIRECT_START_GUARD\backend\modules\sound_system.js" "D:\Streaming\stramAssets\backend\modules\sound_system.js" -Force
```

## Live-Verifikation

```powershell
Select-String -Path "D:\Streaming\stramAssets\backend\modules\sound_system.js" -Pattern "STEP268C","itemMatchesActiveBundleLock","queueBehindActiveBundleLock","active_bundle_lock" -SimpleMatch
```

## Test

Kontrollierter Test:

```text
Alert mit TTS
waehrend/kurz nach Alert-Sound einen SoundAlert ausloesen
```

Erwartung:

```text
Alert-Sound
Alert-TTS
SoundAlert
```

Wenn ein Problem auftritt: Trace aufnehmen, keine weitere Codeaenderung ohne Trace.
