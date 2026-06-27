# CURRENT CHAT HANDOFF – EVS-16 Sound Runtime Dashboard Report

Stand: 2026-06-13
Projekt: `stream-control-center` / Modul `stream_events`
Step: **EVS-16 – Sound Runtime Dashboard Report**

## Ziel

Die in EVS-14/EVS-15 vorbereitete Sound-Runtime soll im Dashboard sichtbar werden, so wie zuvor die Text-Runtime sichtbar gemacht wurde.

## Geänderte Dateien

- `backend/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_16_SOUND_RUNTIME_DASHBOARD_REPORT.md`

## Backend

Build/Version:

- `MODULE_VERSION = 0.5.2`
- `MODULE_BUILD = STEP_EVS_16_SOUND_RUNTIME_DASHBOARD_REPORT`

Erweiterter Endpunkt:

- `GET /api/stream-events/sound-runtime/report`

Der Report liefert zusätzlich:

- `counts.chatOutputs`
- `counts.playbackPayloads`
- `chatOutputs[]`
- `playbackPayloads[]`

Diese Daten werden aus vorhandenen Sound-Runden abgeleitet:

- aktive Runde → vorbereiteter `sound.round.started` ChatOutput + PlaybackPayload
- gelöste Runde → vorbereiteter `sound.solved` ChatOutput
- ungelöste Runde → vorbereiteter `sound.unresolved` ChatOutput

Wichtig: Es wird weiterhin nichts direkt abgespielt und keine Sound-System-Queue berührt.

## Dashboard

Im Statistik-Tab gibt es jetzt zusätzlich:

- Button `Sound-Report laden`
- Bereich `Sound-Runtime`
- Counter für Runden, gelöst, ungelöst, Sound-Punkte, Playback-Payloads, Chat-Payloads
- Sound-Rundenliste
- Sound-Punkteliste
- Ranking
- vorbereitete Sound-Chatmeldungen
- vorbereitete Playback-Payloads

## Weiterhin nicht gemacht

- keine direkte Twitch-Chat-Ausgabe
- keine direkte Sound-System-Queue-Ausführung
- kein echtes Audio-Playback aus dem Event-System
- kein automatischer Sound-Timer
- keine automatische Sound-Chat-Antwortauswertung

## Tests

Syntaxcheck:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

API:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
Event-System -> Statistik -> Sound-Report laden
```

## Nächster sinnvoller Schritt

EVS-17 könnte Sound-Runden/Buttons im Dashboard steuerbar machen:

- nächste Sound-Runde vorbereiten
- aktive Runde lösen
- aktive Runde ungelöst markieren
- Report automatisch aktualisieren

Weiterhin prepared-only, bis das echte Sound-System bewusst angebunden wird.
