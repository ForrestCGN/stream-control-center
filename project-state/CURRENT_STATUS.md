# CURRENT STATUS

Stand: HT4.3 / Central Event Overlay CGN Base Style
Datum: 2026-06-22

## Aktueller bestätigter Stand

Das Projekt `stream-control-center` hat für HypeTrain die zentrale Overlay-Basis vorbereitet.

Bestätigt:

- HypeTrain Backend bleibt auf `0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`.
- Start-Sound ist aktiv: `mediaId 1618`, `hasMedia true`.
- Rekord-Sound ist aktiv: `mediaId 1602`, `hasMedia true`.
- Level-Up und Ende sind fachlich noch offen, weil dafür noch keine Sounds/Medien ausgewählt wurden.
- Tagebuch-Endeintrag bleibt aktiv und unabhängig von Sound-/Overlay-Aktionen.
- Sound läuft weiterhin über `sound_system`.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## Central Event Overlay

Neue zentrale Overlay-Datei:

- `htdocs/overlays/central_event_overlay.html`

Aktueller Overlay-Stand:

- Version `0.1.3`
- Step `HT4.3`

Bestätigt:

- `overlay:central_event_overlay` ist am Communication Bus verbunden.
- Status `connected: True`.
- Status `online`.
- Heartbeat aktiv.
- HypeTrain `start` sichtbar getestet.
- HypeTrain `level_up` sichtbar getestet.
- HypeTrain `end` sichtbar getestet.
- HypeTrain `record` sichtbar getestet.
- Payload-Anzeige ist robust vorbereitet.
- Erste CGN-Basisoptik ist eingebaut.

## Getestete HypeTrain-Overlay-Channels

- `hypetrain.overlay.start`
- `hypetrain.overlay.level_up`
- `hypetrain.overlay.end`
- `hypetrain.overlay.record`

## Nicht geändert durch HT4.0 bis HT4.3

- kein Backend-Umbau
- keine Dashboard-Änderung
- keine DB-Änderung
- keine OBS-Quellenänderung
- keine HypeTrain-Config-Änderung
- keine Sound-System-Änderung
- keine bestehenden Overlays gelöscht

## Dokumentation

Neu/aktualisiert:

- `docs/overlays/central_event_overlay.md`
- `docs/modules/hypetrain.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
