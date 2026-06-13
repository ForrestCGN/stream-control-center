# CHANGELOG

## EVS-2 / Stream Events Backend Foundation – 2026-06-13

- Neues Backend-Modul `backend/modules/stream_events.js` erstellt.
- API-Prefix `/api/stream-events` eingeführt.
- Event-Entwürfe, Spieltyp-Auswahl Sound/Text und Validierung vorbereitet.
- Regel umgesetzt: nur ein aktives Event gleichzeitig.
- Score-Ledger und Ranking/Top 3 vorbereitet.
- DB-Schema-Skeleton für Events, Score-Einträge und Runden ergänzt.
- Communication-Bus-Registrierung, Heartbeat und Status-Publishing ergänzt.
- Erste Textvarianten für `stream_events` über `helper_texts` vorbereitet.
- Doku `docs/modules/stream_events.md` erstellt.
- Handoff `docs/current/CURRENT_CHAT_HANDOFF_EVS_2_STREAM_EVENTS_BACKEND_FOUNDATION.md` erstellt.
- Keine Dashboard-UI.
- Keine Twitch-Chat-Auswertung.
- Kein Sound-/Video-Playback.
- Kein Overlay.
- Keine bestehende Funktionalität entfernt.

## EVS-1 / Event System Planning – 2026-06-13

- Architektur für Event-System geplant.
- Regeln festgelegt: mehrere Events vorbereitbar, nur ein aktives Event, Sound und/oder Text pro Event.
- DB-/Dashboard-Config, Multi-Texte, Bus, Twitch-Events, Sound-/Media-System und Helper-Nutzung als Pflicht festgelegt.

## LWG-4Q.12R / Documentation & Next Chat Handoff – 2026-06-12

- Aktuellen Stand nach LWG-4Q.12O/P/Q konsolidiert.
- `CURRENT_STATUS.md` aktualisiert.
- `NEXT_STEPS.md` aktualisiert.
- `TODO.md` aktualisiert.
- `FILES.md` aktualisiert.
- Neuen Chat-Handoff erstellt.
- Neuen Next-Chat-Prompt erstellt.
- Keine Codeänderung.
- Keine Datenbankänderung.
- Keine Runtime-Änderung.
