# STEP188.2 - Alert Rule Sound Routing Backend

Stand: 2026-05-06

## Zweck

Backend-Grundlage fuer regelbasiertes Sound-Routing im Alert-System.

Jede einzelne Alert-Regel kann kuenftig eigene Sound-System-Werte bekommen, ohne die bestehende globale `liveAlert`-Fallback-Logik zu entfernen.

## Geaenderte Datei

```text
backend/modules/alert_system.js
```

## Nicht geaendert

```text
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
SQLite-Datei / app.sqlite
Secrets / .env
```

## Schema

`SCHEMA_VERSION` wurde von `5` auf `6` erhoeht.

Sanfte Migration fuer `alert_rules`:

```text
sound_output_target TEXT NOT NULL DEFAULT ''
sound_category      TEXT NOT NULL DEFAULT ''
sound_priority      INTEGER
sound_volume        INTEGER
```

Leere Werte bedeuten: bestehende Fallbacks bleiben aktiv.

## Neue Regel-Felder

Pro Alert-Regel koennen jetzt gespeichert werden:

```text
sound_output_target
sound_category
sound_priority
sound_volume
```

Unterstuetzte `sound_output_target` Werte:

```text
device
overlay
both
```

Unterstuetzte `sound_category` Werte:

```text
alert
alert_critical
channel_reward
vip
crew
special
tts
fun
background
decor
admin
system
ui
test
```

`sound_priority` und `sound_volume` werden auf `0..100` begrenzt.

## Fallback-Reihenfolge fuer Sound-System-Request

Bei Alert-Sounds nutzt `buildSoundSystemPayload()` jetzt:

### Volume

```text
raw.soundVolume / raw.volume
-> rule.sound_volume
-> rule.meta.soundVolume / rule.meta.volume
-> liveAlert.soundSystemVolume
-> overlayAlert.soundVolume
-> 85
```

### Priority

```text
raw.soundPriority
-> rule.sound_priority
-> rule.meta.soundPriority
-> liveAlert.soundSystemPriority
-> rule.priority
-> 80
```

### OutputTarget

```text
raw.outputTarget / raw.soundOutputTarget
-> rule.sound_output_target
-> rule.meta.outputTarget / rule.meta.soundOutputTarget
-> liveAlert.soundSystemOutputTarget
-> device
```

### Category

```text
raw.soundCategory
-> rule.sound_category
-> rule.meta.soundCategory
-> liveAlert.soundSystemCategory
-> alert
```

## Kompatibilitaet

Bestehende Regeln bleiben lauffaehig, weil alle neuen Felder Defaults bzw. NULL-Werte haben und auf bisherige globale Settings zurueckfallen.

Bestehende `meta_json`-Overrides funktionieren weiter.

## Fachlicher Nutzen

Damit koennen spaeter im Dashboard pro Regel getrennt gesetzt werden:

```text
Bits 100-249      -> alert, priority 85, device
Ko-fi Donation    -> alert, priority 85, device
Tipeee Donation   -> alert, priority 85, device
Kanalpunkte       -> channel_reward, priority 60/70, device oder overlay
Raid gross        -> alert_critical, priority 90, device
```

Wichtig:

```text
alert_rules.priority bleibt die Alert-/Regelprioritaet.
sound_priority ist die Sound-System-Queue-Prioritaet.
```

## Test

Syntaxcheck:

```powershell
node -c backend/modules/alert_system.js
```

Ergebnis:

```text
OK
```

## Nach Deploy testen

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/reload" -Method POST | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 30
```

Erwartung:

```text
schemaVersion = 6
step = 188
enabled = true
```

Danach bestehenden Bits-Test ausfuehren:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/bits?user=ForrestCGN&amount=100&message=SoundRoutingTest" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 30
```

Da die bestehenden Regeln noch keine neuen Routing-Felder haben, muss die Ausgabe wie bisher ueber globale `liveAlert`-Fallbacks laufen:

```text
category = alert
outputTarget = device
device.lastOk = true
```

## Naechster Schritt

### STEP188.3 - Dashboard fuer Regel-Sound-Routing

Dafuer muessen die neuen Felder im Regel-Editor angezeigt und gespeichert werden:

```text
sound_output_target
sound_category
sound_priority
sound_volume
```

Wichtig: Dashboard schlank halten, keine ueberladene Regel-Uebersicht.
