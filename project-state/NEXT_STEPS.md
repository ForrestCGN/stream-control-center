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


## Nach STEP299

1. Dashboard öffnen und Tab `Sound-System → Bus-Monitor` prüfen.
2. `test_ping` auslösen und beobachten, ob `emitted` steigt und `errors` bei 0 bleibt.
3. Danach entscheiden, ob als STEP300 ein Live-Event-Feed im Dashboard oder ein Consumer-/Overlay-Audit folgt.
