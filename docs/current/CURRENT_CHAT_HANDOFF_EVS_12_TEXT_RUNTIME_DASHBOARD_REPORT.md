# CURRENT CHAT HANDOFF – EVS-12 Text Runtime Dashboard Report

Stand: EVS-12 / `STEP_EVS_12_TEXT_RUNTIME_DASHBOARD_REPORT`

## Inhalt

EVS-12 erweitert das Event-System um eine Dashboard-Anzeige fuer die Text-Runtime:

- Statistik-Tab zeigt Ranking, Worttreffer, Satzloesungen und vorbereitete Chatmeldungen.
- Uebersicht zeigt bei laufenden Events Zaehler fuer Worttreffer und Satzloesungen.
- Report kann per Dashboard-Button neu geladen werden.
- Backend-Report liefert `chatOutputs` als Vorschau aus vorhandenen Textvarianten.

## Geaenderte Dateien

- `backend/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `docs/modules/stream_events.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_12_TEXT_RUNTIME_DASHBOARD_REPORT.md`
- `project-state/*`

## Neue/erweiterte Daten

Route `GET /api/stream-events/text-runtime/report` enthaelt nun:

- `counts.chatOutputs`
- `chatOutputs[]`

Diese ChatOutputs sind Report-Vorschauen. Sie senden nichts direkt in Twitch.

## Nicht enthalten

- Direkte Twitch-Chat-Ausgabe
- Sound-Rotation/Playback
- Overlay
- Rechte-/Rollensteuerung

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-12 Text Runtime Dashboard Report"
```

Danach im Dashboard `Event-System -> Statistik` oeffnen und fuer ein aktives/getestetes Event den Text-Report laden.
