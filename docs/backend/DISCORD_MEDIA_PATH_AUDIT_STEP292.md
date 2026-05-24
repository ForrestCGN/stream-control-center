# STEP292 – Discord Media Path/Routing Audit

Stand: 2026-05-24T14:15:00Z
Typ: Audit / Analyse, keine Codeänderung

## Ausgangslage

STEP291 hat bestätigt, dass der SoundBus mit aktiviertem `soundBus.enabled = true` die stabile Sound-/Queue-/Bundle-Reihenfolge nicht beschädigt. Der V5-Real-Mod-Test lief durch. Nebenbefund: Discord meldete bei Alert-Media-Registry-Dateien Fehler.

Beobachteter Fehler:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Gleichzeitig liefen Device/Stream und Sound-System-Queue korrekt weiter. `soundBus.stats.errors` blieb 0.

## Geprüfte Dateien

- `backend/modules/sound_system.js`
- `backend/modules/discord.js` aus `modules.zip`
- `sound_queue_full_order_v5_real_mod_20260524_160117.events.json`
- `live_sound_trace_20260524_160117.summary.txt`

## Technischer Befund

### 1. Sound-System erzeugt für Media-Registry-Assets andere Pfade als klassische Sound-Dateien

Klassische Sound-Dateien liegen relativ zu:

```text
htdocs/assets/sounds
```

Beispiele:

```text
tts/generated/...
soundalerts/audio/madchen.mp3
vip/Araglor.mp3
```

Media-Registry-Alert-Dateien liegen relativ zu:

```text
htdocs/assets
```

Beispiel aus STEP291:

```text
media/alerts/bits/100-249.mp3
/assets/media/alerts/bits/100-249.mp3
```

Das ist für Browser/Device/Sound-System okay, aber nicht automatisch für Discord.

### 2. Discord-Bridge löst Sounds aktuell nur über `MEDIA_DIR` auf

`discord.js` nutzt:

```js
const MEDIA_DIR = process.env.DISCORD_MEDIA_DIR || process.env.MEDIA_DIR || path.join(process.cwd(), 'media');
```

und `resolveMediaFile(key)` versucht nur:

```js
path.join(MEDIA_DIR, cleanKey)
path.join(MEDIA_DIR, `${cleanKey}.mp3`)
path.join(MEDIA_DIR, `${cleanKey}.wav`)
path.join(MEDIA_DIR, `${cleanKey}.ogg`)
```

Damit funktionieren Sound-Keys, die unter dem konfigurierten Discord-Media-Ordner liegen. Wenn `MEDIA_DIR` auf `htdocs/assets/sounds` zeigt, funktionieren z. B. TTS und VIP/Mod-Sounds. `media/alerts/bits/100-249.mp3` liegt aber nicht darunter, sondern unter `htdocs/assets/media/...`.

### 3. Sound-System übergibt an Discord aktuell `item.file`

In `sound_system.js` wird in `playDiscordOutput(item)` aktuell an die Discord-Bridge übergeben:

```js
bridge.enqueueSound(item.file)
```

Für klassische Sounds ist `item.file` passend. Für Media-Registry-Assets ist `item.file` aber ein `htdocs/assets`-relativer Pfad, nicht zwingend ein `htdocs/assets/sounds`-relativer Pfad.

### 4. Der Fehler ist kein SoundBus-Fehler

Im STEP291-Trace sendete der SoundBus weiter Events ohne Fehler. Der Discord-Fehler entstand beim Discord-Ausgabeziel, während Queue, Bundle-Lock und Device-Ausgabe weiter stabil blieben.

## Root Cause

Discord und Sound-System verwenden aktuell unterschiedliche Pfadwelten:

```text
Sound-System klassische Sounds:  htdocs/assets/sounds/<file>
Sound-System Media Registry:     htdocs/assets/<relativePath>
Discord Bridge:                  MEDIA_DIR/<key>
```

Bei Alert-Media-Registry-Assets bekommt Discord `media/alerts/bits/100-249.mp3`, sucht aber wahrscheinlich unter:

```text
htdocs/assets/sounds/media/alerts/bits/100-249.mp3
```

Die Datei liegt jedoch unter:

```text
htdocs/assets/media/alerts/bits/100-249.mp3
```

## Empfohlener Fix für STEP293

### Ziel

Discord soll sowohl klassische Sound-Dateien als auch Media-Registry-Dateien sauber auflösen können.

### Minimal-invasiver Ansatz

1. `discord.js` um sichere zusätzliche Suchwurzeln erweitern:
   - bisheriger `MEDIA_DIR`
   - `htdocs/assets/sounds`
   - `htdocs/assets`
2. `resolveMediaFile(key)` so erweitern, dass es:
   - absolute Pfade nur akzeptiert, wenn sie innerhalb erlaubter Roots liegen,
   - relative Pfade gegen mehrere erlaubte Roots prüft,
   - bestehendes Verhalten für klassische Sounds beibehält.
3. Optional im Sound-System zusätzlich `item.fullPath` bevorzugt an Discord geben, aber nur wenn Discord-Bridge absolute Pfade sicher prüfen kann.

### Nicht anfassen

- Keine Queue-/Bundle-/`activeBundleLock`-Logik ändern.
- Keine SoundBus-Logik ändern.
- Keine Alert-Output-Modi ändern.
- Keine Discord-Voice-Queue-Logik umbauen.
- Keine Datenbank-Migration.
- Keine Funktionalität entfernen.

## Verifikation nach STEP293

1. SoundBus kann aktiviert bleiben.
2. V5-Test erneut ausführen:

```cmd
tools\easy_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

3. Erwartung:

```text
soundBus.stats.errors = 0
sound.stats.failed = 0
deviceFailed = 0
discordFailed = 0
bundlesQueued >= 4
bundleItemsQueued >= 8
activeBundleLock am Ende leer
queuedCount am Ende 0
```

4. Zusätzlich prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/discord/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object current, queuedCount, currentBundle, activeBundleLock, soundBus, stats, discord
```

## Entscheidung

STEP292 ist ein Audit-/Planungsstand. Es wurden keine Dateien im Produktivcode geändert.

Empfohlener nächster Schritt:

```text
STEP293 – Discord Media Path Resolver Fix
```
