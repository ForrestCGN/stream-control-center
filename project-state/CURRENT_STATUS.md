# Current Status – HT3.5.2

HypeTrain Event-Actions sind im normalen HypeTrain-Dashboardmodul integriert. HT3.5.2 korrigiert das Overlay-Wording: Es soll später eine finale HypeTrain-Anzeige geben, aber als Template/Modus im zentralen Stream-/Event-Overlay, nicht als eigenes paralleles HypeTrain-Overlay-System.

Backend unverändert: `0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`.

Dashboard:
- Event-Actions im normalen `hypetrain.js`/`hypetrain.css`.
- Keine separaten `hypetrain_event_actions.*` Dateien mehr.
- Overlay-Schalter bedeutet: Bus-Event an zentrales Overlay-System senden.
- Finale HypeTrain-Anzeige später im zentralen Overlay-System als Template/Modus.

Kein Node-Neustart nötig.
