# UPDATE – Sound-System Expertenwerte im Admin-Bereich

Stand: 2026-05-02
Branch: `dev`
Projekt: `stream-control-center` / Sound-System

## Zweck

Dieses Update dokumentiert die finale Sortierung der Sound-System-Konfiguration:

```txt
Normale Sound-Seite:
- Bedienung
- Ausgabe
- Queue
- normale Runtime-Settings
- Sounds

Admin → Configs → Sound-System Experten:
- technische Expertenwerte
- Helper/Pfade/Extensions/Overlay-URL
```

Der zuvor testweise in die normale Sound-Seite eingebaute Expertenbereich wurde wieder entfernt. Das war korrekt, weil diese Werte nicht in eine normale Bedienoberfläche gehören.

## Status

Aktueller Stand ist getestet und funktioniert:

```txt
✅ normale Sound-Seite läuft wieder sauber
✅ Expertenwerte liegen im Admin-Bereich
✅ Admin → Configs → Sound-System Experten speichert über /api/sound/settings
✅ SQLite sound_settings enthält die Expertenwerte
✅ Git-Status lokal sauber nach Commit/Push
```

## Richtiger Ort im Dashboard

Der Expertenbereich befindet sich unter:

```txt
Admin → Configs → Sound-System Experten
```

Technisch ist das in folgenden Dateien umgesetzt:

```txt
htdocs/dashboard/modules/adminconfigs.js
htdocs/dashboard/modules/adminconfigs.css
```

Die normale Sound-Seite bleibt in:

```txt
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

## Betroffene Backend-Datei

```txt
backend/modules/sound_system.js
```

Backend-Erweiterung:

```txt
SOUND_SETTINGS_BLOCKS enthält zusätzlich:
- soundsBaseDir
- allowedExtensions
```

Außerdem erlaubt `sanitizeSoundSettingsPayload()`:

```txt
soundsBaseDir      als String
allowedExtensions  als Array
```

## Admin-Expertenwerte

In `Admin → Configs → Sound-System Experten` editierbar:

```txt
Overlay URL
Sounds Base Dir
Helper-Pfad
Helper Timeout ms
Playback Mode
Allowed Extensions
Parallel-Kategorien
```

Speicherung läuft über:

```txt
POST /api/sound/settings
```

Persistenz:

```txt
D:\Streaming\stramAssets\data\sqlite\app.sqlite
Tabelle: sound_settings
```

## Getesteter Speicherstand

Nach Speichern im Adminbereich enthält `/api/sound/settings`.settings unter anderem:

```txt
output.targets.overlay.overlayUrl
output.targets.device.helper.path
output.targets.device.helper.timeoutMs
output.targets.device.helper.playbackMode
queue.parallelCategories
soundsBaseDir
allowedExtensions
```

Beispielwerte:

```txt
output.targets.overlay.overlayUrl = /overlays/sound_system_overlay.html
output.targets.device.helper.path = tools/audio-device-helper/dist/AudioDeviceHelper.exe
output.targets.device.helper.timeoutMs = 8000
output.targets.device.helper.playbackMode = auto
queue.parallelCategories = [system, admin, ui, test]
soundsBaseDir = htdocs/assets/sounds
allowedExtensions = [.mp3, .wav, .ogg, .webm, .m4a]
```

## Prüfbefehle

Settings prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

Nur gespeicherte SQLite-Overrides prüfen:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings").settings | ConvertTo-Json -Depth 20
```

Erwartung nach Admin-Speichern:

```txt
settings enthält:
- queue.parallelCategories
- output.targets.overlay.overlayUrl
- output.targets.device.helper
- soundsBaseDir
- allowedExtensions
```

Syntax prüfen:

```powershell
node --check "D:\Streaming\stramAssets\backend\modules\sound_system.js"
node --check "D:\Streaming\stramAssets\htdocs\dashboard\modules\sound.js"
node --check "D:\Streaming\stramAssets\htdocs\dashboard\modules\adminconfigs.js"
```

## Wichtige Sortierregel ab jetzt

### Normale Sound-Seite

Hierhin gehören nur Werte, die man im Streambetrieb realistisch bedienen darf:

```txt
- aktueller Sound
- Queue
- Sounds starten/stoppen/skippen
- Ausgabe-Modus
- normale Lautstärken
- Alert-Sync
- Prioritäten/Cooldowns/Regeln soweit streamnah
```

### Admin → Configs

Hierhin gehören technische/systemnahe Werte:

```txt
- Pfade
- Helper-Pfad
- Helper-Timeout
- Playback-Mode
- Datei-Erweiterungen
- Base-Verzeichnisse
- Overlay-URLs
- Secrets/Tokens nur maskiert
- Reload/Restart/Danger-Zone
```

## Wichtig für spätere Rechteverwaltung

Der Adminbereich ist aktuell strukturell vorbereitet. Später müssen Änderungen hier mit Rollen/Rechten und Audit-Logging abgesichert werden:

```txt
- nur Admin/Owner darf technische Werte ändern
- Secrets nie im Klartext anzeigen
- Änderungen müssen ins Audit-Log
- Reload/Restart-Aktionen brauchen Schutz/Bestätigung
```

## GitHub-Sicherung

Der Code wurde lokal als sauber gemeldet nach Commit/Push.

Relevante Dateien, die in diesem Arbeitsblock gesichert sein müssen:

```txt
backend/modules/sound_system.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/dashboard/modules/adminconfigs.js
htdocs/dashboard/modules/adminconfigs.css
```

## Nächste sinnvolle Schritte

```txt
1. STABLE-Hauptdoku bei Gelegenheit mit diesem Update zusammenführen.
2. Admin-Config-Seite später mit echter Rechteprüfung versehen.
3. Audit-Logging für Admin-Speicheraktionen aktivieren.
4. Sound-Bibliothek/Upload/Dateiverwaltung planen.
5. Discord-Ausgabe über Sound-System planen.
```
