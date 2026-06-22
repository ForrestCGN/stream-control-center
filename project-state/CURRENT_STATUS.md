# Current Status – stream-control-center

## HT3.2 – HypeTrain Event-Action Config vorbereitet

HypeTrain:
- Version: `0.2.3`
- Build: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`

Tagebuch bleibt aus HT2.9 bestätigt:
- Discord sichtbar über Tagebuch: `CGN Posty`
- Direkt-Discord HypeTrain: deaktiviert/skipped
- Rekord-Sound: deaktiviert/skipped

HT3.2 ergänzt:
- `GET /api/hypetrain/event-actions`
- `POST /api/hypetrain/event-actions`
- vollständige SoundSystem-Felder pro HypeTrain-Eventtyp
- Media-Verknüpfung über `mediaId`/`soundId`
- Overlay-Event-Konfiguration pro Eventtyp

Eventtypen:
- Start
- Stufenaufstieg / Level-Up
- Ende
- Rekord

Sicherheitsstandard:
- Alle neuen Sounds sind aus.
- Alle neuen Overlay-Events sind aus.
- Playback bleibt ausschließlich beim `sound_system`.
- Overlay bleibt technische Basis ohne fertiges Design.
