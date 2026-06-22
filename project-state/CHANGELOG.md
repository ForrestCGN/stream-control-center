# CHANGELOG

## HT3.1 – HypeTrain Overlay Registration & Heartbeat

- HypeTrain-Modul auf `0.2.1` / `STEP_HT3_1_HYPETRAIN_OVERLAY_REGISTER_HEARTBEAT` gehoben.
- Neue Overlay-Routen ergänzt:
  - `POST /api/hypetrain/overlay/register`
  - `POST /api/hypetrain/overlay/heartbeat`
  - `GET /api/hypetrain/overlay/status`
- Overlay-Status in `/api/hypetrain/status` ergänzt.
- Overlay-Grundgerüst sendet Register und regelmäßigen Heartbeat.
- Keine DB-Änderung.
- Keine fertige Overlay-Animation.
- Keine Änderung an Tagebuch-/Discord-/Sound-Produktivstandard.

## HT3.0 – HypeTrain Event-Actions und Overlay-Basis

- Event-Actions für Start, Stufenaufstieg, Ende und Rekord vorbereitet.
- Sound-Aufträge laufen über `sound_system`.
- Overlay-Events laufen vorbereitet über Communication-Bus.
- Alle neuen Sounds/Overlays standardmäßig deaktiviert.

## HT2.9 – HypeTrain/Tagebuch PosterName

- HypeTrain-Tagebucheinträge überschreiben den Tagebuch-Webhook-Namen nicht mehr.
- Discord sichtbar bestätigt als `CGN Posty`.
