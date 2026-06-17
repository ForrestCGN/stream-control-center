# Modul-Doku – stream_events aktueller Stand EVS44

Stand: EVS44 / 2026-06-17

## Zweck

`stream_events` steuert laufende Stream-Events, aktuell besonders Sound-Schnipsel-Events mit Antwortfenster, Punktevergabe, Runtime-Overlay, Sound-System-Anbindung, Recovery, Stream-Offline-Schutz und Winner-Finale-Grundlage.

## Aktuelle Kernlogik Sound-Schnipsel

Ablauf pro Schnipsel:

1. Vorbereitete Runde / nächster Schnipsel.
2. PreRoll/Countdown ca. 3 Sekunden.
3. Sound-Playback über normales Sound-System.
4. Antwortfenster startet nach Sound-Ende.
5. Antwortfenster nutzt Event-Einstellung, aktuell 60 Sekunden.
6. Richtige Antwort:
   - Runde wird `solved`.
   - Punkte werden eventgebunden gespeichert.
   - Userdaten/Avatar werden aufgelöst, wenn möglich.
   - Reveal-Video kann über Sound-System angefordert werden.
   - Schnipsel wird je nach Config aus Rotation entfernt.
7. Timeout:
   - Runde wird `unresolved`.
   - Kein Punkt.
   - Schnipsel wird je nach Config später erneut eingereiht.

## Wichtige Runtime-State Phasen

```text
waiting                  normale Wartezeit bis nächster Auto-Schnipsel
active_round             Runde/Sound läuft
answer_window            Antwortfenster läuft
stream_offline_waiting   Stream offline erkannt, Event wartet automatisch
manual_paused            bewusst manuell pausiert / Altzustand möglich
recovered_waiting        nach Recovery/Neustart zurück in Wartezustand
```

## EVS43 RuntimeGate

RuntimeGate nutzt jetzt den zentralen `twitch_events` Stream-State:

```text
effectiveSource = twitch_events_stream_state
source = manual_override / live_status_monitor / etc.
```

Vorteil:

- Dashboard-Manual-Override wird korrekt akzeptiert.
- Chatantworten werden nur ausgewertet, wenn effektiver Stream-State online und Event aktiv ist.
- Das Modul nutzt nicht mehr raw Twitch-API als harte Wahrheit.

## EVS44 Stream Offline Auto-Wait

Offline-Erkennung:

```text
Stream offline
→ kein neuer Schnipsel
→ laufende Runde sicher abbrechen/requeue
→ Event bleibt active
→ phase = stream_offline_waiting
```

Online-Rückkehr:

```text
Stream wieder online
→ Event soll automatisch zurück zu waiting
→ normale Auto-Wartezeit wird geplant
→ kein sofortiger Schnipselstart nötig
```

Dashboard-Button-Regeln:

```text
Wartezeit überspringen nur anzeigen bei:
- Event active
- Runtime phase waiting
- Stream online
- keine aktive Runde
```

Nicht anzeigen bei:

```text
- stream_offline_waiting
- manual_paused
- active_round
- answer_window
- no active event
```

## Bekannte Routen

Status:

```text
GET /api/stream-events/status
```

Sound-Runtime Report:

```text
GET /api/stream-events/sound-runtime/report?eventUid=<eventUid>
```

Skip-Wait / nächste Runde:

```text
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
```

Runtime Resume:

```text
POST /api/stream-events/runtime/resume?confirm=1
```

Runtime Recovery:

```text
GET  /api/stream-events/sound-runtime/recovery-status
POST /api/stream-events/sound-runtime/recover?confirm=1
```

Stream Offline Pause/Auto-Wait Logik:

```text
POST /api/stream-events/runtime/pause-stream-offline?confirm=1
POST /api/stream-events/runtime/resume?confirm=1
```

Winner-Finale Grundlage:

```text
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
POST /api/stream-events/commands/event/test
```

## Winner Overlay Wunschstand

Aktuell noch nicht zufriedenstellend. Morgen neu/sauber weiterbauen.

Zielbild:

- Top-10-Ehrenrunde für Plätze 10–4.
- Kachel groß einblenden, dann verkleinern und in Ehrenwand wandern.
- Top 3 als Podium: Platz 3 links, Platz 2 rechts, Platz 1 Mitte.
- Gutscheine für Top 3.
- Kein goldener Umschlag.
- Statischer CGN-Rand.
- Avatare bevorzugt.
