# Modul-Doku – Stream Events / Eventsystem

Stand: 2026-06-19 – EVS52.27

## Aufgabe des Moduls

Das Modul `stream_events` verwaltet Events mit Sound- und Satz-/Text-Teilspielen, verarbeitet Twitch-Chatantworten, vergibt Punkte, führt Ranking und zeigt am Ende ein Gewinner-Finale im OBS-Overlay.

## Aktueller Stand

Aktueller Backendstand:

```text
Datei: backend/modules/stream_events.js
moduleVersion: 0.5.93
moduleBuild: STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

Aktueller Winner-Overlay-Stand:

```text
Datei: htdocs/overlays/stream_events/event_winner_overlay.html
moduleVersion: 0.5.42
STEP: EVS52.27
```

## EVS52.26 – Finale-Preview Nullsafe

EVS52.26 behob den Crash:

```text
Cannot read properties of null (reading 'startedAt')
```

Ursache war `winnerFinaleActivitySummary(null, metadata)` bei fertig beendetem Event ohne vorhandenes `winnerFinale`.

Bestätigt:

- `GET /api/stream-events/events/:eventUid/finale` liefert wieder `ok:true`.
- `dashboardCanStartFinale:true` wird geliefert.

## EVS52.27 – Top-3 Twitch Avatare und No Auto-Replay

EVS52.27 adressiert:

1. Top-3-Avatare im Finale sollen vor der Anzeige über Twitch/Userinfo aufgelöst werden.
2. Das Winner-Overlay darf sich nicht ungefragt durch Auto-Replay oder generische Bus-Events einblenden.

### Avatar-Regel Finale

Für die Top 3 gilt:

```text
Top 3 ermitteln
→ Twitch/Userinfo remote erzwingen
→ Avatar + DisplayName übernehmen
→ Finale-Payload erst danach bauen/senden
→ lokale Avatare nur als Fallback
→ Initialen/Fallback nur, wenn wirklich kein Avatar gefunden wurde
```

Zusätzlich werden `userAvatarUrl` und `user_avatar_url` backend- und overlayseitig erkannt.

### Overlay-Regel Auto-Replay

Auto-Replay ist nicht mehr Standard.

Nur diese URLs dürfen das letzte Finale automatisch laden:

```text
event_winner_overlay.html?autoReplay=1
event_winner_overlay.html?auto_replay=1
```

Die normale URL bleibt leer:

```text
event_winner_overlay.html
```

### Bus-Trigger-Regel

Das Winner-Overlay darf nicht mehr auf ein generisches `action === "started"` reagieren. Dadurch soll verhindert werden, dass Glücksrad-/andere Modul-Events versehentlich das Winner-Overlay rendern.

## Wichtige Routen Finale

```text
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
POST /api/stream-events/events/:eventUid/finale/end?confirm=1
GET  /api/stream-events/winner-finale/latest
```

## Wichtige Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

Für Reveal-Video/Sound-Schnittstelle zusätzlich relevant:

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/event_runtime_overlay.html
```

## Nicht geändert durch EVS52.27

```text
Keine DB-Änderung
Keine Dashboard-Änderung
Keine Sound-System-Änderung
Keine Glücksrad-Code-Änderung
Keine Ranking-/Punkte-Änderung
Keine Random-Rotation-Änderung
```

## Offene Prüfungen

Siehe:

```text
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/current/TEST_REPORT_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.md
```
