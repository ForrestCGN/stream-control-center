# NEXT_STEPS Ergänzung – nach STEP200.2

Stand: 2026-05-08

## Nächste Schritte Sound-System

### STEP200.3 – Sound-System Dashboard prüfen

Ziel:

- prüfen, ob Dashboard nur Backend-APIs nutzt
- prüfen, ob `/api/sound/settings` korrekt gelesen/geschrieben wird
- prüfen, ob `settings` und `effective` sinnvoll dargestellt werden
- prüfen, ob UX zu technisch/überladen ist
- prüfen, ob `output.targets` und Legacy-`targets` sauber getrennt sind

Benötigte Dateien:

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
backend/modules/sound_system.js
config/sound_system.json
```

### STEP200.4 – Settings-Source-Anzeige

Ziel:

- pro Block Quelle anzeigen: database/json_fallback/default
- keine rohen JSON-Massenblöcke in normaler Ansicht
- Expert-Felder sauber trennen

### STEP200.5 – JSON/Seed-Bereinigung planen

Ziel:

- `test_ping` als Seed/Fallback oder DB-Preset sauber einordnen
- JSON nicht blind leeren
- Installer-Seed beachten

### STEP200.6 – target vs outputTarget Aufruferprüfung

Ziel:

- alle Module auf Nutzung von `target` und `outputTarget` prüfen
- Legacy-Kompatibilität erhalten
- keine Funktionalität entfernen
