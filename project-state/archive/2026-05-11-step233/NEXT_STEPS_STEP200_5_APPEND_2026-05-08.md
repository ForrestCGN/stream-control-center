# NEXT_STEPS Ergänzung – nach STEP200.5

Stand: 2026-05-08

## Sound-System Folgeaufgaben

### STEP200.6 – target vs outputTarget Aufruferprüfung

Prüfen:

```text
alert_system.js
soundalerts_bridge.js
tts_system.js
vip_sound_overlay.js
sound.js
bekannte Streamer.bot-Aufrufe
```

Ziel:

```text
outputTarget als echtes Ausgabeziel bestätigen.
target als Legacy/Semantik dokumentieren oder später migrieren.
Keine Funktionalität entfernen.
```

### STEP200.7 – test_ping / Sound-Preset-Entscheidung

Prüfen:

```text
Wer nutzt test_ping?
Soll sounds[] in JSON bleiben?
Brauchen wir sound_presets?
Kann vorhandene Asset-Struktur genutzt werden?
```

### STEP200.8 – Installer-Seed-Plan global

Ziel:

```text
einheitlicher Seed-Standard für Settings, Texte, Presets und Modul-Defaults.
Keine Secrets.
Keine lokalen Geräte-IDs.
Keine produktiven Daten überschreiben.
```
