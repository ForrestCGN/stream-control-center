# CURRENT CHAT HANDOFF – EVS51.6 Start Auto Sound Plan

Stand: 2026-06-18

## Ziel

Beim Start eines Events mit aktiviertem Sound-Spiel und automatischem Ablauf muss der erste Sound-Timer automatisch geplant werden. `Wartezeit überspringen` darf nur manuelles Vorziehen sein, nicht Pflicht zum Starten des ersten Schnipsels.

## Umsetzung

Geändert: `backend/modules/stream_events.js`

- Neue Helper-Logik `ensureInitialSoundAutoPlan(eventUid, reason)`.
- `startEvent()` ruft nach erfolgreichem Start automatisch die Sound-Planung auf.
- Wenn ein Start-Endpunkt für ein bereits aktives Event aufgerufen wird, wird eine fehlende Sound-Planung ebenfalls sicher nachgezogen.
- `getSoundRuntimeReport()` kann für laufende Sound-Events ohne aktive Runde/Timer/Planung eine fehlende Auto-Planung sicher nachziehen.
- Start-/Status-Antworten enthalten `soundAutoPlan`.

## Nicht geändert

- Punkte-Logik
- Satz-/Text-System
- Sound-System-Playback selbst
- Reveal-Video
- Event-Abschlusslogik
- DB-Schema

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.71
moduleBuild   : STEP_EVS51_6_START_AUTO_SOUND_PLAN
```

Live-Test:

1. Event mit Sound-Automatik starten oder bei schon laufendem Event Sound-Status neu laden.
2. `Events -> Sound-Steuerung` prüfen.
3. Erwartung online: Nächster Schnipsel ist geplant.
4. Erwartung offline: Event wartet sichtbar auf Stream online, nicht „Keine Wartezeit geplant“.
