# CURRENT CHAT HANDOFF – SOUND-SAFE-1B

Stand: 2026-06-16

## Step

SOUND-SAFE-1B – Event-Runtime-Overlay-Plan fuer Sound-/Text-Events, kombiniert statt getrennte Countdown-/Ende-Overlays.

## Grundlage

Geprueft wurden die gelieferten Dateien aus `backend.zip`, `htdocs.zip` sowie der vorherige Stand `SOUND-SAFE-1_event_sound_safety_plan.zip`.

Wichtig: In den gelieferten ZIPs waren keine vollstaendigen `project-state/*` oder `docs/modules/*` Dateien enthalten. Diese Handoff-Datei dokumentiert deshalb nur den naechsten Planstand und ersetzt keine fehlenden Projektstandsdateien.

## Entscheidung

Forrest bevorzugt ein kombiniertes Overlay statt getrenntem Countdown-Overlay und Ergebnis-/Ende-Overlay.

Geplante Overlay-Datei fuer den spaeteren Implementierungs-Step:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Optional, falls spaeter CSS/JS getrennt werden soll:

```text
htdocs/overlays/stream_events/event_runtime_overlay.css
htdocs/overlays/stream_events/event_runtime_overlay.js
```

Fuer den ersten sauberen Overlay-Step reicht voraussichtlich eine einzelne HTML-Datei, wenn sie wie andere Overlays im Projekt aufgebaut wird.

## Architekturentscheidung

Das kombinierte Event-Runtime-Overlay ist nur Anzeige-/UI-Schicht fuer den Eventzustand.

Es ist NICHT Owner von:

- Sound-Playback
- Sound-System-Queue
- Audio-Ende-ACKs
- Video-/Media-Playback
- Event-Auswertung
- Punktebuchung
- Chat-Senden

Owner bleiben:

```text
stream_events.js          = Event-/Runden-/Antwort-/Punkte-Owner
sound_system.js           = Sound-/Queue-/Playback-Owner
media.js / Media-System   = Video-/Media-Owner
Twitch-Events/Chat-Bus    = Chat-Eingang / Antwortquelle
```

## Warum nicht `sound_system_overlay.html` erweitern?

Das Sound-System-Overlay ist bereits aktiver Bestandteil des Sound-Systems:

- verarbeitet Sound-/Audio-/Video-Playback
- pollt `/api/sound/status`
- sendet Client-ACKs wie `audio-started` und `audio-ended`
- hat eigene Fallbacks und Request-Deduplizierung
- sendet Heartbeats / Bus-Diagnose

Countdown, Ergebnis, Gewinner und Event-Ende dort einzubauen waere riskant, weil dadurch Sound-Queue, ACKs und Fallbacks vermischt werden koennten.

Daher bleibt das Sound-Overlay unangetastet.

## Geplantes Event-Runtime-Overlay

Eine kombinierte Anzeige fuer:

1. Idle / nichts aktiv
2. Event bereit / wartet
3. Countdown / PreRoll
4. Sound wird gleich gespielt
5. Sound laeuft / jetzt raten
6. Antwortfenster aktiv
7. Richtige Antwort erkannt
8. Falsche/keine Antwort / Runde ungeloest
9. Loesung anzeigen
10. Punkte/Gewinner/Top-Spieler anzeigen
11. Naechste Runde vorbereitet
12. Event beendet / Gesamtranking
13. Event abgebrochen

## Technisches Muster fuer spaetere Umsetzung

Empfohlenes Muster aus vorhandenen Overlays:

- API-State lesen wie Birthday-Overlay:
  - z. B. spaeter `GET /api/stream-events/runtime-overlay/state`
- WS/Bus nur als Aktualisierungs-Trigger verwenden.
- Polling-Fallback behalten, damit OBS-Overlay robust bleibt.
- `overlay_bus_client.js` fuer Diagnose-Heartbeat einbinden.

Geplante spaetere Route:

```text
GET /api/stream-events/runtime-overlay/state
```

Diese Route soll nur den aktuellen Anzeigezustand liefern, nicht abspielen und nichts veraendern.

Beispiel-State grob:

```json
{
  "ok": true,
  "module": "stream_events",
  "active": true,
  "phase": "countdown",
  "eventUid": "...",
  "eventTitle": "Song erraten",
  "gameType": "sound",
  "roundUid": "...",
  "countdown": {
    "active": true,
    "secondsTotal": 5,
    "secondsLeft": 3,
    "endsAt": "..."
  },
  "sound": {
    "playbackPrepared": true,
    "playbackAccepted": false,
    "titleVisible": false
  },
  "answerWindow": {
    "active": false,
    "secondsLeft": 0
  },
  "result": {
    "status": "pending",
    "winner": null,
    "solutionVisible": false
  },
  "ranking": {
    "top": []
  },
  "updatedAt": "..."
}
```

## Phasenmodell fuer Dashboard/Overlay

Vorgeschlagene Phasen:

```text
idle
ready
countdown
playing
guessing
solved
unresolved
solution
round_complete
finished
cancelled
error
```

Wichtig:

- `countdown` startet keinen Sound selbst.
- `playing` zeigt nur, dass das Sound-System beauftragt/aktiv ist.
- `guessing` ist Antwortfenster, nicht Audio-Owner.
- `solved`/`unresolved` kommen aus `stream_events.js`.
- `finished` zeigt Event-Endstand/Gesamtranking.

## Kommunikationsregel

Das Overlay darf:

- State lesen
- Bus/WS-Events als Refresh-Signal nutzen
- Heartbeat senden
- debug anzeigen, wenn `?debug=1`

Das Overlay darf nicht:

- `/api/sound/play` aufrufen
- `/api/sound/eventbus/command/play-test` aufrufen
- Sound-System-Queue direkt anfassen
- Punkte buchen
- Event starten/beenden
- Chat senden
- Media-Video starten

## Visual-Richtung

Design soll sich am bestehenden CGN-/Neon-Galaxy-Stil orientieren:

- dunkler Galaxy-/Glass-Hintergrund
- Neon-Lila/Cyan Glow
- klare Card-Struktur
- grosse Countdown-Zahl
- kurze, streamerfreundliche Texte
- Ergebnisanzeige mit Gewinner/Loesung/Punkten
- optional Top-3 kompakt

Als visuelle Referenz geeignet:

```text
htdocs/overlays/_overlay-start-v2-neon-galaxy.html
htdocs/overlays/_overlay-birthday.html
htdocs/overlays/_overlay-alerts-v2.html
```

Nicht als Logik-Vorlage verwenden:

```text
htdocs/overlays/sound_system_overlay.html
```

Dieses Overlay bleibt Playback-Schicht.

## Naechster sinnvoller technischer Step

EVENT-RUNTIME-OVERLAY-STATE-1

Ziel:

- Read-only State-Route fuer Event-Runtime-Overlay vorbereiten.
- Noch kein neues Overlay bauen.
- Noch kein Sound-Playback aktivieren.
- Noch kein PreRoll ausfuehren.

Geplante Datei:

```text
backend/modules/stream_events.js
```

Geplante Route:

```text
GET /api/stream-events/runtime-overlay/state
```

Nicht geaendert:

- `sound_system.js`
- `sound_system_overlay.html`
- Sound-Queue
- Audio-/Video-Playback
- DB-Daten
- Dashboard-Bedienung

Erst wenn diese State-Route stabil ist, folgt:

EVENT-RUNTIME-OVERLAY-UI-1

Geplante Datei:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Danach erst:

EVENT-SOUND-PLAYBACK-1

- Sound-System-DryRun verwenden.
- Dann genau einen freigegebenen Sound-System-Entry-Point verwenden.
- Countdown/PreRoll davor anzeigen, aber Sound-Start bleibt Backend-/Sound-System-gesteuert.

## Tests nach Einspielen + StepDone

Bei diesem Step handelt es sich nur um Doku/Handoff.

Nach Einspielen/deployen zuerst:

```powershell
.\stepdone.cmd "SOUND-SAFE-1B - Kombiniertes Event-Runtime-Overlay geplant"
```

Danach pruefen, ob Datei vorhanden ist:

```powershell
Test-Path .\docs\current\CURRENT_CHAT_HANDOFF_SOUND_SAFE_1B.md
```

Keine Runtime-Tests noetig, weil keine Code-Datei geaendert wird.

## Offene benoetigte Dateien fuer vollstaendige Projektdoku

Falls Projektstand/TODO/CHANGELOG direkt aktualisiert werden soll, werden diese echten Dateien benoetigt:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht raten, nicht neu erfinden.
