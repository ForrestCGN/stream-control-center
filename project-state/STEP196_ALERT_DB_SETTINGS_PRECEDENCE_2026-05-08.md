# STEP196 - Alert DB-Settings Vorrang + Live-Sound-System-Kopplung

Stand: 2026-05-08

## Ziel

Dieser STEP behebt den Integrationsbruch zwischen Alert-System und Sound-System.

Vorheriger Live-Befund:

- `/api/alerts/config` zeigte `liveAlert.soundSystemEnabled=false`.
- `/api/alerts/settings` enthielt DB-Setting `livealert.soundSystemEnabled=true`.
- Twitch-Follow-Alert wurde korrekt gematcht und im Alert-Overlay angezeigt.
- Der zugewiesene Follow-Sound war vorhanden und direkt über `/api/sound/play` abspielbar.
- Trotzdem wurde der Alert-Sound nicht über das neue Sound-System gestartet.

Ursache:

- Alert-System lud JSON-Konfiguration als aktive Runtime-Config.
- DB-Settings aus `alert_settings` wurden nicht sauber auf `state.config` angewendet.
- Casing-Abweichung `livealert` (DB-Key) vs. `liveAlert` (Runtime-Config) wurde nicht gemappt.
- `processQueue()` sendete Alerts direkt ans Overlay, ohne bei aktivierter `liveAlert.soundSystemEnabled`-Konfiguration das Sound-System aufzurufen.

## Geänderte Datei

- `backend/modules/alert_system.js`

## Nicht geändert

- Keine DB-Datei.
- Keine DB-Schemaänderung.
- Keine Alert-Regeln.
- Keine Alert-Assets.
- Keine Alert-Events.
- Keine Sound-Dateien.
- Keine Secrets.
- Keine `.env`.
- Keine JSON-Umschaltung von `liveAlert.soundSystemEnabled`.

## Änderungen

### 1. Runtime-Defaults erweitert

`DEFAULT_CONFIG` enthält jetzt auch die bisher nur aus JSON bekannten Abschnitte:

- `preview`
- `liveAlert`
- `dashboardSettings`

Damit existieren diese Werte auch dann sauber, wenn sie nicht aus JSON geladen werden.

### 2. DB-Settings gewinnen vor JSON-Fallback

Neue Runtime-Logik:

- `applyRuntimeSettingsFromDb()`
- `sanitizeRuntimeConfig()`
- `canonicalConfigSectionKey()`
- `setConfigPath()`
- `mergePlainConfig()`

Regel:

```text
DB-Setting > JSON-Fallback > Code-Default
```

Provider-Settings mit Prefix `provider_` werden bewusst nicht in die Alert-Runtime-Config gemerged.

### 3. livealert/liveAlert Mapping

DB-Key `livealert` wird auf Runtime-Section `liveAlert` gemappt.

Damit kann das vorhandene DB-Setting:

```text
livealert.soundSystemEnabled = true
```

korrekt die aktive Runtime-Config setzen:

```text
state.config.liveAlert.soundSystemEnabled = true
```

### 4. Settings-Speichern aktualisiert Runtime

`saveSettings()` schreibt weiterhin nach `alert_settings`, wendet danach aber die DB-Settings direkt auf `state.config` an und gibt zusätzlich die aktive Config zurück.

### 5. Reload/Start wendet DB-Settings an

Nach `reloadConfig()`, `ensureSchema()` und `seedDefaults()` werden DB-Settings angewendet.

Das gilt für:

- Serverstart
- `/api/alerts/reload`

### 6. Live-Alert-Sound-System-Kopplung

`processQueue()` ruft vor dem Overlay-Start jetzt `playLiveAlertSound(event)` auf.

Wenn aktiv:

```text
state.config.liveAlert.soundSystemEnabled === true
```

und die gematchte Regel ein `sound_url` besitzt, wird der Sound über `/api/sound/play` gestartet.

Beispiel-Mapping:

```text
/assets/sounds/alerts/1777641693891_I_Will_Follow_Him-stream.mp3
-> alerts/1777641693891_I_Will_Follow_Him-stream.mp3
```

Übergabe an Sound-System:

- `file`
- `label`
- `category`
- `priority`
- `outputTarget`
- `source`
- `requestedBy`
- optional `volume`

### 7. Integration-Check erweitert

`/api/alerts/integration-check` prüft jetzt zusätzlich:

- ob DB-Setting `livealert.soundSystemEnabled` von aktiver Runtime-Config abweicht
- ob bei aktivem Sound-System eine Play-URL gesetzt ist
- ob aktive Regeln mit Sound-Assets existieren

## Erwarteter Zustand nach Deploy

Nach Backend-Neustart oder `/api/alerts/reload` sollte gelten:

```text
/api/alerts/config -> config.liveAlert.soundSystemEnabled = true
```

wenn in `alert_settings` weiterhin `livealert.soundSystemEnabled=true` gespeichert ist.

Ein Twitch-Follow-Test sollte dann:

- Alert-Karte/Bild im Alert-Overlay anzeigen
- Follow-Sound über das neue Sound-System auf `device` abspielen
- Sound-System-Status `deviceStarted` erhöhen
- Alert nach Client-Ack sauber beenden

## Tests nach Deploy

### 1. Syntax

```powershell
cd D:\Git\stream-control-center
node --check .\backend\modules\alert_system.js
```

### 2. Live-Deploy

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: enable alert live sound system settings"
```

### 3. Danach Live prüfen

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/reload" -Method POST | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/config" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/integration-check" | ConvertTo-Json -Depth 30
```

### 4. Follow-Test

```powershell
cd D:\Streaming\stramAssets
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Result = [ordered]@{}
$Result.test = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/follow?user=ForrestCGN&userLogin=forrestcgn"

Start-Sleep -Seconds 4

$Result.alertStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$Result.soundStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$Result.alertQueue = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/queue"

$Result | ConvertTo-Json -Depth 80 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
```

## Erwartetes Testergebnis

- Follow-Alert wird gematcht.
- Alert-Overlay zeigt Karte/Bild.
- Sound-System startet den Follow-Sound.
- `soundStatus.stats.deviceStarted` steigt.
- `soundStatus.deviceFailed` bleibt `0`.
- Nach Ablauf: `alertStatus.current = null`, Queue leer, History enthält Event.

## Offene Punkte

- `/api/alerts/settings` kann Provider-Settings mit sensiblen Werten ausgeben. Das sollte in einem separaten Security-/Masking-STEP behoben werden.
- Langfristiger Zielstandard bleibt: Dashboard-editierbare Settings in DB, JSON nur Seed/Fallback/technische Boot-Konfig.
- Nicht automatisch alle JSON-Werte entfernen; zuerst pro Modul sauber migrieren.
