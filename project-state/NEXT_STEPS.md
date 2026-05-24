# NEXT STEPS – nach STEP300

## STEP301 – Sound Dashboard Monitoring Backend/Auth Validation

Ziel:

- Sound Dashboard Monitoring gegen bestehende Auth-/Controlcenter-Konventionen prüfen.
- Sicherstellen, dass der Bus-Monitor rein lesend bleibt.
- Sicherstellen, dass keine neuen ungeschützten Admin-/Steuerrouten benötigt werden.
- Prüfen, ob spätere Refresh-/Live-Update-Verbesserungen sauber über bestehende Dashboard-Strukturen umgesetzt werden können.

Mögliche Dateien zur Prüfung:

```text
backend/modules/dashboard_auth.js
backend/modules/dashboard_controlcenter.js
backend/modules/communication_bus.js
backend/modules/sound_system.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

## Danach möglich

STEP302 – Sound Dashboard Monitoring Live-Refresh/UX Plan oder Umsetzung.

Mögliche Ziele:

- Auto-Refresh optional.
- bessere Anzeige für `soundBus.stats`.
- kompaktere Darstellung für Current Sound / Bundle Lock.
- keine Steuerung, solange nicht separat freigegeben.

## Wichtig

- Keine Funktionalität entfernen.
- SoundBus bleibt Event-/Status-Schicht.
- Steueraktionen weiter über Backend-APIs.
- Keine Sound-Queue-/Bundle-/Playback-Logik ändern.
