# CURRENT CHAT HANDOFF – EVS-7 Text-Config Dashboard Prep

Stand: 2026-06-13  
Projekt: ForrestCGN / stream-control-center  
Modul: `stream_events`

## Zweck

EVS-7 baut auf EVS-6 auf und bereitet die Text-Config / Multi-Texte im Event-System-Dashboard vor.

Der Nutzer hatte ausdrücklich festgelegt, dass später auch Config und Text-Config mit Multi-Texten im Dashboard eingebaut werden sollen. EVS-7 nutzt dafür die vorhandenen Helper `helper_texts` und die bestehende DB-Struktur `module_text_variants`. Es wird keine parallele Textstruktur aufgebaut.

## Enthaltene Änderungen

### Backend

Datei:

- `backend/modules/stream_events.js`

Änderungen:

- Modulversion auf `0.3.0` erhöht.
- Build auf `STEP_EVS_7_TEXT_CONFIG_DASHBOARD_PREP` gesetzt.
- zusätzliche Textkeys für Sound-/Text-Spiel vorbereitet:
  - `sound.round.started`
  - `sound.solved`
  - `sound.unresolved`
  - `text.partial.general`
  - `text.partial.with_sentence`
  - `text.word_points.added`
  - `text.phrase.solved`
- neue Textkategorien:
  - `sound_game`
  - `text_game`
- vorhandene Route `GET /api/stream-events/texts` bleibt bestehen.
- neue Route `POST /api/stream-events/texts` speichert/löscht Textvarianten über `textHelper.handleModuleTextEditorPayload(...)`.

### Dashboard

Dateien:

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`

Änderungen:

- Text-Config-/Multi-Texte-Panel unterhalb der Event-Details ergänzt.
- Kategorien und Textkeys werden aus `/api/stream-events/texts` geladen.
- Varianten können im Dashboard vorbereitet werden:
  - bestehende Variante bearbeiten
  - Variante aktiv/inaktiv setzen
  - Gewichtung einstellen
  - neue Variante hinzufügen
  - Variante löschen
- Platzhalter-Hinweis ergänzt, z. B. `{user}`, `{points}`, `{eventName}`, `{phraseNumber}`, `{wordCount}`.

## Nicht enthalten

EVS-7 enthält weiterhin keine Runtime:

- keine Twitch-Chat-Auswertung
- keine Worttreffer-Erkennung
- keine echte Punktevergabe für Worttreffer
- keine Sound-Wiedergabe
- kein Overlay
- keine Statistikansicht

## Test

Nach dem Entpacken:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-7 Text Config Dashboard Prep"
```

Erst danach Dashboard testen.

## Nächster sinnvoller Schritt

Nach EVS-7 sollte im Dashboard geprüft werden:

- Event-System öffnet ohne Fehler.
- Text-Config-Panel wird angezeigt.
- Textvarianten lassen sich speichern.
- Neue Varianten erscheinen nach Reload weiter.

Danach kann geplant werden:

- allgemeines Config-Dashboard für Event-Regeln
- Backend-Runtime für Text-Spiel / Chat-Erkennung
- Satzrotation und Worttreffer-Tracking
