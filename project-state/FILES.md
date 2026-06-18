## EVS51.4 Dateien

- backend/modules/stream_events.js
- htdocs/dashboard/modules/stream_events.js
- htdocs/dashboard/modules/stream_events.css
- docs/modules/stream_events.md
- docs/current/CURRENT_CHAT_HANDOFF_EVS51_4_TEXT_RUNTIME_FLOW.md

# FILES – relevante Dateien

Stand: 2026-06-18 – EVS51.3

## Event-System / Satz-Testbereich

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS51_3_TEXT_TEST_UI_CLEANUP.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Relevante Routen

```text
POST /api/stream-events/test/run?confirm=1&step=text-check
POST /api/stream-events/test/run?confirm=1&step=text-create
POST /api/stream-events/test/run?confirm=1&step=text-wrong
POST /api/stream-events/test/run?confirm=1&step=text-word
POST /api/stream-events/test/run?confirm=1&step=text-correct
POST /api/stream-events/test/run?confirm=1&step=text-duplicate
POST /api/stream-events/test/run?confirm=1&step=text-report
GET  /api/stream-events/text-runtime/report?eventUid=<eventUid>
GET  /api/stream-events/runtime-parts/status?eventUid=<eventUid>
GET  /api/stream-events/events/:eventUid/ranking
GET  /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

## Dashboard

```text
http://127.0.0.1:8080/dashboard
Event-System → Test → Satz-System gezielt testen
```

## Wichtige Datenbanktabellen

```text
stream_events_events
stream_events_score_entries
stream_events_text_word_hits
stream_events_text_phrase_solves
stream_events_sound_rounds
```


## EVS51.5 – Text-Antwortvarianten optional

- `backend/modules/stream_events.js` – Validation-Warnung für leere Text-Antwortvarianten entfernt.
- `htdocs/dashboard/modules/stream_events.js` – lokale Warnung/Mapping entfernt.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS51_5_TEXT_ANSWERS_OPTIONAL_FIX.md` – Übergabe.


## EVS51.6 geänderte Dateien

- `backend/modules/stream_events.js` – Start-Auto-Planung für Sound-Automatik.
- `docs/modules/stream_events.md` – EVS51.6 dokumentiert.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS51_6_START_AUTO_SOUND_PLAN.md` – Handoff.
- `project-state/*` – Projektstand aktualisiert.

## EVS52.3 relevante Dateien

- `backend/modules/stream_events.js` – Overlay-State, Text-Key, Satzlösungs-Celebration.
- `htdocs/overlays/stream_events/event_runtime_overlay.html` – Darstellung der Satzlösungs-Karte.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_3_TEXT_SOLVED_CELEBRATION_OVERLAY.md` – Handoff.


## EVS52.4 geänderte Dateien

- `backend/modules/stream_events.js` – Textkeys, Live-Chat-Ausgabe über Helper, Duplicate-Meldung.
- `htdocs/dashboard/modules/stream_events.js` – Texte-Tab-Hinweis/Build aktualisiert.
- `docs/modules/stream_events.md` – Modul-Doku aktualisiert.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_4_TEXT_CHAT_OUTPUTS_ACTIVE.md` – Handoff.
- `project-state/CHANGELOG.md`
- `project-state/TODO.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`

## EVS52.5

- `backend/modules/stream_events.js` – Alias-Fix fuer Satz-Runtime, Live-Debug, Teststep `text-live-flow-check`.
- `tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1` – lokales PowerShell-Testscript fuer Satz-Live-Flow ohne Twitch-Live-Send.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_5_TEXT_LIVE_FLOW_FIX.md` – Handoff.

## EVS52.6

- `backend/modules/stream_events.js` – Live-Chat Direct-Bridge-Fallback für Satz-/Text-System.
- `tools/tests/EVS52_6_LIVE_CHAT_DIRECT_BRIDGE_CHECK.ps1` – Diagnose-Script für RuntimeGate, Direct-Bridge und ChatOutput.
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_6_LIVE_CHAT_DIRECT_BRIDGE.md` – Handoff.

## EVS52.7 relevante Dateien

- `backend/modules/stream_events.js`
- `backend/modules/twitch_presence.js`
- `tools/tests/EVS52_7_TWITCH_PRESENCE_CHAT_BRIDGE_CHECK.ps1`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_7_TWITCH_PRESENCE_CHAT_BRIDGE.md`
