# STEP200.6 – Sound-System target/outputTarget Aufruferprüfung

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Analyse-/Doku-STEP  
Status: vorbereitet

## Ziel

Prüfen, ob im Sound-System und den angebundenen Modulen `target` und `outputTarget` sauber getrennt genutzt werden.

Grundregel:

```text
outputTarget = echtes Ausgabeziel: overlay / device / both
target       = Legacy/Semantik/Kompatibilität: stream / discord / both
```

## Grundlage

Live-/Repo-Analyse aus `D:\gpt\last_api.json`.

Geprüfte Dateien:

```text
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/soundalerts.js
```

## Ergebnis

Es ist kein akuter Code-Fix nötig.

Die aktuelle Nutzung ist grundsätzlich konsistent:

- `sound_system.js` trennt `target` und `outputTarget`.
- `outputTarget` steuert die echte Ausgabe.
- `target` bleibt für Legacy-/Semantik-Zwecke bestehen.
- Alerts übergeben das Sound-Ausgabeziel als `outputTarget`.
- SoundAlerts nutzt `outputTarget` für Audio/Video-Regeln.
- TTS nutzt `soundSystemOutputTarget`.
- Das Sound-Dashboard zeigt bevorzugt `outputTarget` und nutzt `target` nur als Fallback.
- Die Warnung `legacy_targets_and_output_targets_both_present` bleibt erwartet und korrekt.

---

## Detailbefund pro Datei

### backend/modules/sound_system.js

Status: sauber / bewusst getrennt

Wichtige Logik:

```text
normalizeTarget(rawTarget)
  -> stream / discord / both

normalizeOutputTarget(rawOutputTarget, legacyTarget)
  -> overlay / device / both

shouldUseOverlay(item)
  -> outputTarget overlay/both

shouldUseDevice(item)
  -> outputTarget device/both
```

Bewertung:

```text
outputTarget ist echtes Ausgabeziel.
target ist Legacy/Semantik und bleibt erhalten.
```

Kein Fix nötig.

### backend/modules/alert_system.js

Status: sauber

Befund:

```text
liveAlert.soundSystemOutputTarget
validateSoundOutputTarget()
params.set('outputTarget', ...)
```

Bewertung:

```text
Alert-System übergibt das Sound-Ausgabeziel korrekt als outputTarget.
```

Kein Fix nötig.

### backend/modules/soundalerts_bridge.js

Status: sauber

Befund:

```text
audioOutputTarget
videoOutputTarget
normalizeOutputTarget()
output_target DB-Feld
```

Bewertung:

```text
SoundAlerts trennt Audio/Video-Ziel sauber und übergibt outputTarget ans Sound-System.
```

Kein Fix nötig.

### backend/modules/tts_system.js

Status: sauber

Befund:

```text
chatTts.soundSystemOutputTarget
outputTarget: chatCfg.soundSystemOutputTarget || 'device'
```

Bewertung:

```text
TTS nutzt outputTarget korrekt für Sound-System-Wiedergabe.
```

Kein Fix nötig.

### backend/modules/vip_sound_overlay.js

Status: beobachten

Befund:

```text
target: "stream"
outputTarget: "device"
```

Bewertung:

```text
Aktuell kein akuter Fehler erkennbar.
Die Kombination entspricht der Legacy-/Output-Trennung.
VIP sollte später bei einer eigenen Standardisierung genauer geprüft werden.
```

Kein Sofort-Fix.

### htdocs/dashboard/modules/sound.js

Status: sauber

Befund:

```text
cur.outputTarget || cur.target
sound.outputTarget || sound.target
item.outputTarget || item.target
```

Bewertung:

```text
Dashboard bevorzugt outputTarget und nutzt target nur als Anzeige-Fallback.
```

Kein Fix nötig.

### htdocs/dashboard/modules/alerts.js

Status: nicht relevant

Befund:

```text
target-Treffer beziehen sich auf DOM/Event-/Placeholder-Variablen.
Keine Sound-System-outputTarget-Nutzung gefunden.
```

Kein Fix nötig.

### htdocs/dashboard/modules/soundalerts.js

Status: sauber

Befund:

```text
defaultOutputTargetForMedia()
normalizeOutputTarget()
audioOutputTarget
videoOutputTarget
outputTarget
```

Bewertung:

```text
SoundAlerts-Dashboard arbeitet bereits mit outputTarget.
```

Kein Fix nötig.

---

## Entscheidung

Aktuelle verbindliche Regel bleibt:

```text
outputTarget = echtes Ausgabeziel für Sound-System
target       = Legacy/Semantik/Kompatibilität
```

`targets` in `config/sound_system.json` bzw. Effective Config darf nicht entfernt werden, solange nicht alle alten Aufrufer und Streamer.bot-Flows endgültig migriert sind.

## Bekannte Warnung

Der Sound-Integration-Check meldet weiterhin:

```text
legacy_targets_and_output_targets_both_present
```

Diese Warnung ist aktuell erwartet und soll bleiben, bis eine spätere Migration abgeschlossen ist.

## Nicht geändert

Dieser STEP ändert bewusst nichts an:

```text
backend code
dashboard code
DB schema
JSON config
Streamer.bot flows
Overlay code
```

## Folgeaufgaben

### STEP200.7 – test_ping / Sound-Preset-Entscheidung

Prüfen:

```text
Wer nutzt test_ping?
Ist sounds[] nur Diagnose?
Soll test_ping in DB?
Brauchen wir sound_presets?
Kann vorhandene Asset-Struktur genutzt werden?
```

### STEP200.8 – globaler Installer-/Seed-Plan

Planen:

```text
Settings-Seeds
Text-Seeds
Preset-Seeds
Modul-Defaults
keine Secrets
keine lokalen Geräte-IDs
keine produktiven DB-Daten überschreiben
```

### Später: VIP-Sound-System-Standardisierung

Bei einem VIP-Block prüfen:

```text
target/outputTarget Nutzung
Device-Ausgabe
Sound-System-Anbindung
Dashboard-Anbindung
DB/JSON-Strategie
```
