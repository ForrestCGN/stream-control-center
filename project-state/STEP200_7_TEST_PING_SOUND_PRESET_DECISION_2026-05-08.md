# STEP200.7 – test_ping / Sound-Preset-Entscheidung

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Analyse-/Doku-STEP  
Status: vorbereitet

## Ziel

Prüfen, ob `test_ping` aus `config/sound_system.json` entfernt, migriert oder vorerst behalten werden soll.

Grundregel aus STEP200.5:

```text
JSON nicht blind leeren.
Keine Funktionalität entfernen.
Seed/Fallback darf in JSON bleiben.
Dashboardfähige Werte sollen langfristig in DB/API.
```

---

## Analysegrundlage

Analyse-Datei:

```text
D:\gpt\last_api.json
```

Geprüft wurden:

```text
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/alerts.js
config/sound_system.json
/api/sound/list
/api/sound/config
/api/sound/integration-check
```

---

## Befund

### /api/sound/list

`/api/sound/list` liefert aktuell genau ein JSON-/Seed-Preset:

```json
{
  "id": "test_ping",
  "label": "Test Ping",
  "type": "generated_beep",
  "category": "system",
  "priority": 100,
  "target": "stream",
  "outputTarget": "overlay",
  "volume": 80,
  "durationMs": 350,
  "frequency": 880,
  "enabled": true,
  "canInterrupt": true,
  "canBeInterrupted": false,
  "queueIfBusy": false,
  "dropIfBusy": false,
  "parallelAllowed": false,
  "cooldownMs": 0
}
```

### config/sound_system.json

`config/sound_system.json` enthält `test_ping` als:

```text
id: test_ping
type: generated_beep
```

### sound_system.js

Das Sound-System kann Presets aus `config.sounds` laden:

```text
getSoundList()
findSound(soundId)
body.soundId / body.id / body.sound
preset = findSound(soundId)
```

Außerdem gibt es eine generierte Beep-Route:

```text
GET /api/sound/generated/beep.wav
```

### Dashboard

`htdocs/dashboard/modules/sound.js` kann Sounds/Preset-Sounds per `soundId` abspielen:

```text
POST /api/sound/play
{ soundId: ..., source: 'dashboard', override: true }
```

### Andere Module

Kein direkter fachlicher Bedarf für `test_ping` gefunden in:

```text
alert_system.js
soundalerts_bridge.js
tts_system.js
vip_sound_overlay.js
soundalerts.js
alerts.js
```

---

## Entscheidung

`test_ping` bleibt vorerst in `config/sound_system.json`.

Begründung:

- Es ist ein technisches Diagnose-/Seed-Preset.
- Es ist klein und erzeugt keine externe Datei.
- Es nutzt `generated_beep`, also keine Asset-Abhängigkeit.
- Dashboard und Sound-System können Presets über `soundId` nutzen.
- Entfernen könnte Diagnose-/Testfunktionen beschädigen.
- Eine Migration ohne Preset-Konzept wäre unnötiges Risiko.

Verbindliche Entscheidung:

```text
test_ping nicht entfernen.
test_ping vorerst als technisches JSON-Seed-Preset behalten.
```

---

## Langfristiges Ziel

Langfristig sollte `sounds[]` in JSON nicht zu einer wachsenden Hauptverwaltung für Benutzer-/Systemsounds werden.

Zieloption:

```text
sound_presets oder bestehende geeignete DB-/Asset-Struktur
```

Ein späteres Preset-System sollte unterscheiden:

```text
system preset
diagnostic preset
user preset
generated preset
file preset
```

---

## Mögliche spätere DB-Struktur

Noch nicht umsetzen.

Beispiel:

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
- frequency
- enabled
- can_interrupt
- can_be_interrupted
- queue_if_busy
- drop_if_busy
- parallel_allowed
- cooldown_ms
- is_system
- is_seeded
- meta_json
- created_at
- updated_at
```

Alternativ muss geprüft werden, ob vorhandene Asset-/Media-Strukturen wiederverwendet werden können.

Regel:

```text
Keine neue Parallelstruktur bauen, wenn vorhandene Helper/Tabellen geeignet sind.
```

---

## Installer-Regel

Ein späterer Installer darf `test_ping` als technisches Seed-Preset bereitstellen.

Regeln:

```text
test_ping darf beim Erstsetup gesetzt werden.
Bestehende DB-/User-Presets dürfen nicht überschrieben werden.
Lokale Device-IDs dürfen nicht aus Forrests System übernommen werden.
JSON darf als Fallback bleiben.
```

---

## Nicht Teil dieses STEPs

Dieser STEP ändert bewusst nichts an:

```text
backend/modules/sound_system.js
config/sound_system.json
htdocs/dashboard/modules/sound.js
data/sqlite/app.sqlite
AudioDeviceHelper
Overlay
```

---

## Folgeaufgaben

### STEP200.8 – globaler Installer-/Seed-Plan

Ziel:

- einheitlicher Seed-Standard für alle Module
- Settings-Seeds
- Text-Seeds
- Preset-Seeds
- keine Secrets
- keine lokalen Geräte-IDs
- keine produktiven DB-Daten überschreiben

### Später – Sound-Preset-DB-Konzept

Nur falls nötig:

- Prüfen, ob `sound_presets` gebraucht wird
- Prüfen, ob vorhandene Asset-/Media-Strukturen reichen
- Dashboard-UX für Presets planen
