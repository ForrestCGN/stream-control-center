# Modul-Doku – Stream Events / EventSound Runtime

Datei: `backend/modules/stream_events.js`  
Stand: mindestens `0.5.51` / `STEP_EVENT_RUNTIME_UNRESOLVED_CARD_1`  
Zuletzt aktualisiert: 2026-06-17

## Aufgabe

`stream_events` verwaltet Event-Runden wie Sound-Snippet-Spiele und Text-/Chat-basierte Eventlogik. Für EventSound bereitet das Modul Runden vor, verarbeitet Antwortfenster/Resultate/Punkte und delegiert Audio-/Video-Playback an das Sound-System.

Wichtig:

```text
stream_events ist nicht Playback-Owner.
sound_system bleibt Playback-/Queue-Owner.
Runtime-Overlay zeigt nur Status/Counter/Result-Cards.
```

## EventSound Runtime – aktueller Ablauf

```text
1. Runde wird gestartet.
2. Sound-System bekommt Playback-Job mit EventSound-PreRoll.
3. Runtime-Overlay zeigt 3 / 2 / 1 / LOS.
4. Sound-Schnipsel läuft.
5. Während Countdown/Sound sind Antworten ungültig.
6. Nach Sound-Ende öffnet stream_events das Antwortfenster.
7. Runtime-State liefert answerWindow.active=true.
8. Overlay zeigt Counter oben rechts.
9a. Richtige Antwort:
    - Antwort wird erkannt.
    - Punkte werden vergeben.
    - Gewinner-Card wird angezeigt.
    - Reveal-Video wird nach Card über Sound-System geplant.
9b. Timeout:
    - keine Punkte.
    - keine Reveal-Auflösung.
    - Keine-Lösung-Kachel wird angezeigt.
    - Schnipsel bleibt je nach Config später wiederholbar.
```

## Wichtige Runtime-State-Felder

```json
{
  "phase": {
    "key": "sound_answer_window",
    "visible": false
  },
  "display": {
    "overlayMode": "hidden"
  },
  "answerWindow": {
    "active": true,
    "seconds": 60,
    "remainingSeconds": 42,
    "startedAt": "...",
    "endsAt": "...",
    "roundUid": "..."
  }
}
```

`answerWindow.active=true` ist entscheidend für den Counter. Wenn der Counter nicht erscheint, zuerst diesen State prüfen.

## Wichtige Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
GET  /api/stream-events/runtime-overlay/state
POST /api/stream-events/sound-runtime/reset-test-state?confirm=1
POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
POST /api/stream-events/sound-runtime/test-chat
```

## Ergebnis-Anzeigen

### Gewinner-Card

Position: Mitte rechts.  
Inhalt:

```text
Username
hat den Schnipsel erkannt · +X Punkte
Titel des Schnipsels
```

Layout-Regeln:

```text
- Username eigene Zeile.
- Username möglichst vollständig sichtbar.
- Punkte immer sichtbar.
- Titel eigene Titelbox, maximal zwei Zeilen.
- Card nicht endlos verbreitern.
```

### Keine-Lösung-Kachel

Position: oben mittig.  
Dauer: ca. 10 Sekunden.  
Text:

```text
KEINE LÖSUNG
Die Heimleitung hat im Chat
keine richtige Antwort erkannt.
Der Schnipsel bleibt im Archiv.
```

Regeln:

```text
- Lösung nicht spoilern.
- Kein Avatar.
- Kein Username.
- Keine Punkte.
- Kein Reveal-Video.
```

## Reveal-Video

Reveal wird bei richtiger Antwort über das Sound-System geplant. Das Reveal darf kein EventRuntime-PreRoll auslösen.

Nicht mehr gewünscht:

```text
AUFLOESUNG
AUFLOESUNG LAEUFT
LOS!
JETZT RATEN!
```

Wichtig: Sichtbares Reveal-Video läuft über:

```text
htdocs/overlays/sound_system_overlay.html
```

Nicht über:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

## Auto-Schedule

Regel:

```text
random_auto / sequence_auto: nächste automatische Runde nach intervalMinutes ± intervalJitterMinutes.
roundDelaySeconds ist nur Mindestpause/Floor.
Manuelle next-round API darf weiterhin sofort auslösen.
```

Beispiel:

```text
Alle X Minuten = 15
Zufallsabweichung = 5
Erwartung = 600 bis 1200 Sekunden
```

## Diagnose

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/status" | ConvertTo-Json -Depth 12
```

## Bekannte Testhinweise

```text
- Normales 30s-Testscript ist zuverlässig für Counter/Gewinner-Card.
- Long-Winner-Custom-Testevent war unzuverlässig für Sichtprüfung.
- Lange Gewinnertexte lieber per Demo-URL prüfen:
  /overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```
