# NEXT_STEPS

Stand: 2026-06-19

## Direkt vor oder nach dem Abendstream prüfen

1. Sicherstellen, dass kein manueller Override aktiv ist:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" |
  Select-Object -ExpandProperty streamState |
  Select-Object live,status,provider,streamId,streamSessionId,manualOverride |
  ConvertTo-Json -Depth 6
```

2. Nach echtem Live-Start Twitch-Session prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-session" |
  ConvertTo-Json -Depth 10
```

3. Shot-Alarm Runtime prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status" |
  Select-Object -ExpandProperty runtime |
  ConvertTo-Json -Depth 8
```

Erwartung:

- `twitch_events.streamSession.streamSessionId` ist gefüllt.
- `shot_alarm.runtime.currentStreamSessionId` passt dazu.
- `streamLive` ist bei echtem Live-Stream `true`.
- `effectiveActive` wird erst true, wenn Shot-Alarm zusätzlich gestartet wurde.

## Bei Problemen

Wenn die neue echte Twitch-Session nicht automatisch übernommen wird:

- aktuellen Status aus `twitch_events` und `shot_alarm` sichern.
- keine Blindänderung machen.
- `backend/modules/twitch_events.js` und `backend/modules/shot_alarm.js` erneut prüfen.
- Manuellen Fallback-Button „Neue Shot-Session starten“ nur nutzen, wenn der Livebetrieb sonst gefährdet wäre.

## Empfohlener nächster Entwicklungsstep nach Live-Check

`SHOT-ALARM-2L Event-/Overlay-Queue absichern`

Ziel:

- Mehrere Support-Events kurz hintereinander werden zuverlässig nacheinander angezeigt.
- Pro Event/User eigene Chat-/Overlay-/Sound-Meldung.
- Keine Overlay-Meldung wird überschrieben.
- Sound-System bleibt Playback-/Queue-Owner.
- Offene Shots werden weiterhin in einem Gesamtzähler addiert.

## Weitere spätere Punkte

- Statistik-/History-Auswertung schöner machen.
- Filter nach Stream/Event im Dashboard weiter verbessern.
- Texte/Varianten weiter im zentralen Texte-System pflegen.
- Sound-Konfiguration weiter dashboardfähig halten.
- Benutzer-/Rollenrechte später zentral anbinden.
