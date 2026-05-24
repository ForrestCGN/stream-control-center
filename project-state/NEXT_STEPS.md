# NEXT STEPS – nach STEP298

## STEP299 – Sound Dashboard Monitoring Modul Plan/Scaffold

Ziel:

- SoundBus/Sound-System Monitoring im Dashboard vorbereiten.
- Zunächst lesend.
- Keine Queue-/Bundle-/Playback-Logik ändern.

Mögliche Dateien:

```text
htdocs/dashboard/modules/soundbus.js
htdocs/dashboard/modules/soundbus.css
```

Optional später:

```text
backend/modules/dashboard_soundbus.js
config/dashboard_soundbus.json
```

## Wichtig

- Keine Funktionalität entfernen.
- SoundBus bleibt Event-/Status-Schicht.
- Steueraktionen weiter über Backend-APIs.
- Rechte-/Rollenprüfung für spätere Admin-Aktionen berücksichtigen.
