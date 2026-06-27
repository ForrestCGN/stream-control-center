# CURRENT CHAT HANDOFF – EVS52.4 Text-Chat-Ausgaben aktiv

Stand: 2026-06-18

## Ziel

Satz-Spiel-Texte werden nicht mehr nur vorbereitet, sondern im echten Live-Chat genutzt:

- Worttreffer: eine zufällige Chatmeldung, kein Overlay.
- Satzlösung: zufällige Chatmeldung + 15s Celebration-Overlay.
- Doppelte Satzlösung: zufällige Chatmeldung, aber keine Punkte und kein Overlay.
- Textvarianten laufen über das vorhandene `helper_texts`-/Dashboard-Textsystem.
- Chat-Senden läuft über vorhandenen `helper_chat_output`, keine neue Parallelstruktur.

## Versionen

- Backend `stream_events`: `0.5.75 / STEP_EVS52_4_TEXT_CHAT_OUTPUTS_ACTIVE`
- Dashboard: `STEP_EVS52_4_TEXT_CHAT_OUTPUTS_ACTIVE`
- Runtime-Overlay: unverändert aus EVS52.3

## Wichtige Text-Keys

Aktiv für das Satz-Spiel:

- `text.word_hit.chat`
- `text.phrase.solved`
- `text.phrase.duplicate.chat`
- `text.phrase.solved.overlay`

Weiterhin vorhanden als Alt-/Preview-Keys:

- `text.partial.general`
- `text.partial.with_sentence`
- `text.word_points.added`

## Verhalten

### Worttreffer

Nur bei neuen Worttreffern:

- Punkte werden vergeben, falls Wortpunkte aktiv sind.
- Genau eine Chatmeldung wird vorbereitet und live gesendet, wenn die Nachricht aus dem echten Twitch-Chat-Bus kommt und das Runtime-Gate aktiv ist.
- Kein Overlay.
- Keine zweite Extra-Meldung für Punkte, um Spam zu vermeiden.

### Satzlösung

Bei vollständiger Satzlösung:

- Punkte werden vergeben.
- Chatmeldung über `text.phrase.solved`.
- Overlay über `text.phrase.solved.overlay` für 15 Sekunden.

### Doppelte Satzlösung

Bei bereits gelöstem Satz:

- Keine Punkte.
- Keine neue Satzlösung.
- Chatmeldung über `text.phrase.duplicate.chat`.
- Kein Overlay.

## Technische Hinweise

Live-Senden wird nur ausgelöst bei `bus:twitch.chat.message` und aktivem Runtime-Gate. Dashboard-/Backend-Tests senden nicht live in den Twitch-Chat.

Verwendeter Helper:

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_chat_output.js`

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.75
moduleBuild   : STEP_EVS52_4_TEXT_CHAT_OUTPUTS_ACTIVE
```

Dashboard:

```text
Event-System → Texte
```

Prüfen, ob die neuen Keys sichtbar/editierbar sind.

Live-Test:

1. Laufendes Event mit Text/Satz aktiv.
2. Chat schreibt Teilwort aus offenem Satz → eine Worttreffer-Chatmeldung.
3. Chat schreibt kompletten Satz → Satzlösung-Chatmeldung + Overlay.
4. Chat schreibt denselben Satz erneut → Duplicate-Chatmeldung, keine Punkte.

## Nächster Schritt

- Live-Ausgaben im echten Chat prüfen.
- Falls `helper_chat_output` nicht sendet, Status von `/api/chat-output/status` prüfen.
- Danach Doku/TODO konsolidieren oder Overlay-Animation verfeinern.
