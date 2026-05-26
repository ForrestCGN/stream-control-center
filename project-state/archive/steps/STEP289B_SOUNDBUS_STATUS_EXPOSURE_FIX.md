# STEP289B – SoundBus Status Exposure Fix

Datum: 2026-05-24T14:00:00Z

## Ausgangspunkt

STEP289 wurde erfolgreich geladen (`step = 289`). Beim Live-Statuscheck zeigte sich aber:

- `config.soundBus` war korrekt vorhanden.
- Das direkte Top-Level-Feld `soundBus` fehlte in `/api/sound/status`.

Dadurch war die einfache Prüfung per PowerShell nicht möglich:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object step, soundBus
```

## Änderung

In `backend/modules/sound_system.js` wurde `publicState()` erweitert:

```js
soundBus: publicSoundBusStatus(),
```

## Bewusst nicht geändert

- Keine Sound-Playback-Logik.
- Keine Queue-Logik.
- Keine Bundle-/activeBundleLock-Logik.
- Keine Dedupe-/Cooldown-/Interrupt-Regeln.
- Keine Caller-Module.
- Keine DB-Migration.
- Kein Aktivieren von `soundBus.enabled`.

## Erwarteter Test

Nach Deploy/Restart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object step, soundBus
```

Erwartung:

- `step = 289`
- `soundBus` ist sichtbar.
- `soundBus.enabled = False`
- `soundBus.communicationBusAvailable = True`

## Nächster Schritt

Wenn der Status sichtbar ist:

1. SoundBus gezielt über `/api/sound/settings` aktivieren.
2. Kleinen Test-Sound auslösen.
3. `soundBus.stats.emitted > 0` und `soundBus.stats.errors = 0` prüfen.
