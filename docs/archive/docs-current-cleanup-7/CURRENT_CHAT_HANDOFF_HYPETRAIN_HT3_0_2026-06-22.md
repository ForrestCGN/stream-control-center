# Current Chat Handoff – HypeTrain HT3.0

Stand: HT3.0 wurde als ZIP gebaut.

Wichtig:
- Code-Datei: `backend/modules/hypetrain.js`
- Overlay-Basis: `htdocs/overlays/hypetrain/hypetrain_overlay.html`
- Version erwartet: `hypetrain 0.2.0`
- Build erwartet: `STEP_HT3_0_HYPETRAIN_EVENT_ACTIONS_OVERLAY_BASE`

Ziel:
- Event-Sounds und Overlay-Events für Start/Stufenaufstieg/Ende/Rekord vorbereiten.
- Noch kein fertiges Overlay-Design.
- Sound läuft über `sound_system`.
- Overlay empfängt vorbereitet über Communication-Bus/WebSocket/Polling-Diagnose.

Nach Einspielen:
- Node neu starten.
- Status prüfen.
- Dry-Run `/api/hypetrain/test/event-actions?confirm=1` testen.
