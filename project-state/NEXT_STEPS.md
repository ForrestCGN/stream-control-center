# NEXT_STEPS – EVS52.26

Stand: 2026-06-19

## Direkt als Nächstes

1. Dashboard hart neu laden.
2. Beim beendeten Testevent `evs_event_mqkyu4hp_27b0cb030fad` prüfen, ob `Auswertung starten` sichtbar ist.
3. Finale/Auswertung starten.
4. Prüfen, ob das Winner-Overlay sichtbar wird und Ranking/Gewinner korrekt angezeigt werden.
5. Danach Finale manuell beenden.
6. Danach prüfen, ob `Auswertung erneut abspielen` erscheint und Replay dieselbe Auswertung erneut zeigt.

## API-Test für Finale-Start

```powershell
$eventUid = "evs_event_mqkyu4hp_27b0cb030fad"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale/start?confirm=1" `
  -ContentType "application/json" `
  -Body '{"actor":"dashboard"}' | ConvertTo-Json -Depth 8
```

Erwartung:

- `ok:true`
- Finale-/Winner-Daten vorhanden
- `startedAt` gefüllt
- Overlay bekommt den Finale-Start

## Danach: Reveal-Video / Sound-Queue-Safety

Problem aus dem Notfallstand:

- Richtige Sound-Antwort wurde erkannt.
- Reveal-Video startete.
- Danach blieb einmal das Sound-System bei `Sound läuft` hängen.
- Kanalpunkte-Sounds liefen nach `/api/sound/skip` wieder weiter.

Zu prüfen:

- Was sendet `backend/modules/stream_events.js` beim Reveal-Video ans Sound-System?
- Kommen `mediaType=video`, `durationMs`, `eventUid`, `roundUid`, `requestId` sauber an?
- Gibt das Sound-System nach Video-Ende zuverlässig die Queue frei?
- Gibt es einen zu langen oder fehlenden Fallback bei `video-ended`/`audio-ended`?

Notfallbefehl bleibt vorerst:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/skip"
```

## Danach: Soundrotation / Zufall

Beobachtung:

- Beim Test kamen mehrfach dieselben Schnipsel in gleicher Reihenfolge.

Zu prüfen:

- offene Schnipsel werden zufällig gewählt
- gelöste Schnipsel werden entfernt/markiert
- ungelöste Schnipsel werden später neu eingereiht
- ungelöste Schnipsel kommen nicht direkt als nächstes, wenn Alternativen vorhanden sind
- `avoidImmediateRepeat` und `minRepeatDistance: 3` greifen wirklich

## Offene, aber nicht streamkritische Auffälligkeit

`finaleActivity.active:true` bei `finaleStarted:false` ist logisch unsauber. Das blockiert aktuell nicht, sollte aber später sauber korrigiert werden, wenn Finale-Start/Replay stabil getestet sind.
