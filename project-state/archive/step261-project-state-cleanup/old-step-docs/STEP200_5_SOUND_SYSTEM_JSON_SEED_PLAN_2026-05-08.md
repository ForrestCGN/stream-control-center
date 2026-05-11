# STEP200.5 – Sound-System JSON/Seed-Plan

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Doku-/Planungs-STEP  
Status: vorbereitet

## Ausgangslage

Der Sound-System-Block ist aktuell funktional sauber:

```text
STEP200.1  /api/sound/routes + /api/sound/integration-check
STEP200.2  Sound-System Zielarchitektur dokumentiert
STEP200.3  Sound-Dashboard Diagnose ergänzt
STEP200.4  Sound-Dashboard zeigt Settings-Quelle
```

Aktueller Standard:

```text
sound_settings      = Zielquelle für dashboardfähige Settings
sound_system.json   = Seed/Fallback/technische Boot-Konfiguration
output.targets      = aktives Ausgabezielmodell
targets             = Legacy/Kompatibilität
```

## Ziel dieses STEPs

Dieser STEP legt fest, wie `config/sound_system.json` künftig behandelt werden soll.

Wichtig:

```text
JSON wird nicht blind geleert.
JSON bleibt als Seed/Fallback nötig.
Dashboardfähige Werte sollen langfristig in DB/Helper-Strukturen.
```

---

## Was in sound_system.json bleiben darf

### 1. Technische Boot-Konfiguration

Darf in JSON bleiben:

```text
routes.prefix
websocket.enabled
websocket.op
soundsBaseDir
allowedExtensions
output.targets.*.mode
output.targets.*.helper.path
```

Begründung:

- Wird zum Starten benötigt.
- Muss auch funktionieren, wenn DB noch nicht bereit ist.
- Gehört teilweise zur technischen Infrastruktur.
- Installer braucht diese Werte als Defaults.

### 2. Fallback-Werte für Erststart

Darf in JSON bleiben:

```text
overlay.fallbackFinishMs
overlay.gapBetweenSoundsMs
queue.maxLength
queue.defaultPriority
priorities
categoryDefaults
defaults
```

Aber nur als Fallback/Seed.

Regel:

```text
Wenn DB-Wert vorhanden ist, gewinnt DB.
Wenn DB-Wert fehlt, darf JSON-Fallback greifen.
```

### 3. Maschinenabhängige lokale Defaults

Darf in JSON bleiben, aber nicht blind portabel übernehmen:

```text
output.targets.device.selectedDeviceId
output.targets.device.selectedDeviceName
```

Diese Werte sind maschinenspezifisch.

Regel für Installer/Portabilität:

```text
selectedDeviceId/selectedDeviceName nicht ungeprüft auf fremde Systeme übernehmen.
Beim Setup Gerät neu erkennen/auswählen lassen.
```

---

## Was langfristig nicht als Hauptverwaltung in JSON bleiben soll

### 1. Dashboardfähige Settings

Langfristig DB-basiert:

```text
output.defaultTarget
output.targets.overlay.defaultVolume
output.targets.device.defaultVolume
output.targets.both.defaultVolume
overlay timing values
queue behavior
interruptRules
dropRules
cooldowns
dedupe
priorities
categoryDefaults
defaults
```

Diese Werte sollen über Dashboard/API verwaltet werden.

### 2. Benutzer-/Preset-Sounds

Aktuell liegt mindestens `test_ping` als JSON-Preset in:

```text
sounds[]
```

Das ist kurzfristig okay, langfristig aber unsauber, wenn weitere Sounds/Preset-Sounds dazukommen.

Ziel:

```text
Technische Test-Presets sauber als Seed markieren
oder in eine DB-Preset-Struktur migrieren.
```

Nicht erlaubt:

```text
test_ping blind entfernen.
```

Grund:

- Kann für Diagnose/Testausgabe genutzt werden.
- Kann in Tests/Dashboard erwartet werden.
- Entfernung ohne Aufruferprüfung kann Funktionalität brechen.

---

## Vorgeschlagene künftige DB-Struktur

Noch nicht umsetzen, nur Zielbild.

### Option A: sound_presets

Mögliche Tabelle:

```text
sound_presets
- id
- label
- type
- file
- media_type
- category
- target
- output_target
- priority
- volume
- duration_ms
- enabled
- is_system
- is_seeded
- meta_json
- created_at
- updated_at
```

Vorteile:

- Test-Sounds und System-Sounds sauber verwaltbar.
- Dashboard kann Sounds später anzeigen/bearbeiten.
- Installer kann Defaults seeden.
- Keine wachsenden JSON-Soundlisten.

### Option B: vorhandene Asset-/Sound-Strukturen nutzen

Vor einer neuen Tabelle prüfen:

```text
alert assets
soundalerts entries
sound_settings
bestehende media/helper Strukturen
```

Regel:

```text
Keine neue Parallelstruktur bauen, wenn vorhandene Helper/Tabellen geeignet sind.
```

---

## Installer-Regel Sound-System

Ein späterer Installer muss:

1. `config/sound_system.json` mit technischen Defaults bereitstellen.
2. DB-Tabelle `sound_settings` anlegen/migrieren.
3. Fehlende Settings aus JSON seeden.
4. Bestehende DB-Werte nie blind überschreiben.
5. AudioDeviceHelper prüfen.
6. ffmpeg/ffprobe prüfen, falls relevant.
7. Overlay-Datei prüfen.
8. `soundsBaseDir` prüfen/anlegen.
9. AllowedExtensions inkl. `.mp4` und `.webm` setzen.
10. Lokale AudioDevice-ID nicht aus Forrests System übernehmen.
11. Test-Sound/Preset sauber seeden oder als technisches JSON-Fallback markieren.

---

## Migrationsregel

Wenn später JSON-Werte in DB migriert werden:

```text
CREATE TABLE IF NOT EXISTS
INSERT nur wenn Setting fehlt
bestehende DB-Werte nicht überschreiben
Rollback-fähig bleiben
JSON-Fallback behalten
```

Keine harte Migration, die Live-Systeme bricht.

---

## Offene konkrete Folgeaufgaben

### STEP200.6 – Aufruferprüfung target/outputTarget

Prüfen:

```text
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound.js
Streamer.bot-Aufrufe soweit dokumentiert
```

Ziel:

```text
outputTarget = echtes Ausgabeziel
target = Legacy/Semantik/Kompatibilität
```

### STEP200.7 – Sound-Preset-/test_ping-Entscheidung

Prüfen:

```text
Wer nutzt test_ping?
Ist sounds[] nur Diagnose?
Soll test_ping in DB?
Brauchen wir sound_presets?
Kann vorhandene Asset-Struktur genutzt werden?
```

### STEP200.8 – Installer-Seed-Plan allgemein

Nicht nur Sound-System, sondern global:

```text
Settings-Seeds
Text-Seeds
Preset-Seeds
Modul-Defaults
keine Secrets
keine lokalen Geräte-IDs
keine produktiven DB-Daten überschreiben
```

---

## Nicht Teil dieses STEPs

Dieser STEP ändert bewusst nichts an:

```text
backend/modules/sound_system.js
config/sound_system.json
data/sqlite/app.sqlite
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
overlays
AudioDeviceHelper
```

---

## Ergebnis

`config/sound_system.json` bleibt erlaubt, aber klar begrenzt:

```text
Seed
Fallback
technische Boot-Konfiguration
lokale Infrastrukturwerte
```

Die Hauptverwaltung dashboardfähiger Werte soll langfristig über DB/API laufen.
