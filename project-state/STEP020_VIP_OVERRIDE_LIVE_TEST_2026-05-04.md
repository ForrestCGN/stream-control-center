# STEP020 - VIP Override Live-Test

Stand: 2026-05-04

## Ziel

VIP-Sound-Override im Live-System pruefen und dokumentieren.

## Live-Umgebung

- Repo/Arbeitsstand: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- Backend: lokal auf `http://127.0.0.1:8080`
- VIP-Modul: `backend/modules/vip_sound_overlay.js`
- VIP-Version: `1.7.0`
- Sound-System-Version: `0.1.8`
- SQLite: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Gepruefte Statusrouten

### VIP Status

Route:

- `GET /api/vip-sound/status`

Ergebnis:

- `ok=true`
- `version=1.7.0`
- `phase=idle`
- `visible=false`
- `isActive=false`
- `queuedCount=0`
- DB bereit:
  - `initialized=true`
  - `schemaVersion=1`
  - `messageTemplates=15`

### VIP Overlay State

Route:

- `GET /api/vip-sound-overlay/state`

Ergebnis:

- `overlay.visible=false`
- `overlay.phase=idle`
- `isActive=false`
- `queuedCount=0`
- Kein haengender VIP-Overlay-State.

### VIP DB Status

Route:

- `GET /api/vip-sound/db/status`

Ergebnis nach Tests:

- `ok=true`
- `schemaVersion=1`
- `messageTemplates=15`
- `dailyUsageRows=3`
- `lastError=""`

### Sound-System Status

Route:

- `GET /api/sound/status`

Ergebnis nach Tests:

- `ok=true`
- `enabled=true`
- `paused=false`
- `current=null`
- `queuedCount=0`
- `device.lastOk=true`
- `stats.started=2`
- `stats.deviceStarted=2`
- `device.lastResult.file=D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3`
- `device.lastResult.message=Playback beendet.`

## Funktionstests

### 1. Normale VIP-Ausloesung fuer araglor

Test:

- Actor: `araglor`
- Target: implizit `araglor`
- SoundType: `vip`
- Source: `powershell-test`

Ergebnis:

- `accepted=true`
- `duplicate=false`
- `override=false`
- `dailyUsageWritten=true`
- `soundSystemQueued=true`
- `soundSystemStarted=true`
- `soundFile=vip/araglor.mp3`
- Chat-Ausgabe ueber Bot erfolgreich.

Bewertung:

- Normale VIP-Ausloesung funktioniert.
- Daily-Usage wird nach erfolgreichem Sound-System-Start geschrieben.

### 2. Broadcaster-Override fuer araglor

Test:

- Actor: `forrestcgn`
- ActorDisplayName: `ForrestCGN`
- `actorIsBroadcaster=true`
- Target: `araglor`
- SoundType: `vip`
- Source: `powershell-override-test`

Ergebnis:

- `accepted=true`
- `override=true`
- `overrideAllowed=true`
- `dailyUsageWritten=false`
- `soundSystemQueued=true`
- `soundSystemStarted=true`
- `eventKey=accepted_override_vip`
- Chat-Ausgabe ueber Bot erfolgreich.

Bewertung:

- Broadcaster-Override funktioniert.
- Override schreibt keine zusaetzliche Daily-Usage.
- Sound wird trotzdem erneut ueber das Sound-System abgespielt.

### 3. Echter Duplicate-Test ohne Override

Test:

- Actor: `araglor`
- Target: implizit `araglor`
- SoundType: `vip`
- Source: `powershell-duplicate-test`

Ergebnis:

- `accepted=false`
- `duplicate=true`
- `override=false`
- `overrideAllowed=false`
- `dailyUsageWritten=false`
- `eventKey=duplicate_vip`
- `previousTriggeredAt=2026-05-04T06:43:33.300Z`
- Chat-Ausgabe ueber Bot erfolgreich.

Bewertung:

- Duplicate-Block funktioniert.
- Kein Sound-System-Request bei Duplicate.
- Keine zweite Daily-Usage fuer denselben User/SoundType/Tag.

### 4. Unerlaubter Override durch normalen User

Test:

- Actor: `normaluser`
- ActorDisplayName: `NormalUser`
- Target: `araglor`
- SoundType: `vip`
- Source: `powershell-denied-override-test`

Ergebnis:

- `accepted=false`
- `duplicate=false`
- `override=true`
- `overrideAllowed=false`
- `dailyUsageWritten=false`
- `soundSystemQueued=false`
- `eventKey=denied_override_vip`
- Chat-Ausgabe ueber Bot erfolgreich.

Bewertung:

- Unerlaubter Override wird korrekt blockiert.
- Kein Sound-System-Request.
- Keine Daily-Usage-Aenderung.

## Ergebnis

STEP020 ist erfolgreich live getestet.

Bestaetigt:

- VIP-Statusrouten funktionieren.
- VIP-DB ist bereit.
- Sound-System ist bereit.
- Normaler VIP-Sound funktioniert.
- Duplicate-Block funktioniert.
- Broadcaster-Override funktioniert.
- Unerlaubter Override wird geblockt.
- Chat-Ausgabe laeuft ueber den Bot/zentralen Chat-Output.
- Sound wird ueber AudioDeviceHelper auf das konfigurierte Device abgespielt.

## Bewusst offen

- `soundSystemRequestId` ist in der VIP-Response noch leer.
- Fuer echte Streamer.bot-Produktion muessen die real gelieferten Rollen-/Badge-Parameter noch gegen `actorCanOverride()` verifiziert werden.
- Falls Streamer.bot andere Feldnamen liefert, nur Rollen-/Badge-Mapping erweitern.
- VIP-Soundpfad spaeter konfigurierbar ueber Config/DB/Dashboard machen.
- VIP-Dashboard fuer Texte/Settings spaeter bauen.

## Keine Aenderungen an

- SQLite-Datei selbst wurde nicht committed oder ersetzt.
- Keine Secrets oder `.env`-Dateien committed.
- Keine Codeaenderung in diesem STEP.
- Keine Funktionalitaet entfernt.
