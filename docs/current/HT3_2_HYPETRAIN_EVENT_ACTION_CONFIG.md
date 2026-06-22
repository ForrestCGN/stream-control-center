# HT3.2 – HypeTrain Event-Action Config Vorbereitung

Stand: 2026-06-22

## Ziel

HT3.2 erweitert die in HT3.0/HT3.1 vorbereiteten HypeTrain-Event-Aktionen um eine dashboardfreundliche Backend-Konfiguration.

## Enthalten

- `hypetrain` Version `0.2.2` / `STEP_HT3_2_HYPETRAIN_EVENT_ACTION_CONFIG`
- Route `GET /api/hypetrain/event-actions`
- Route `POST /api/hypetrain/event-actions`
- Konfiguration für Start, Stufenaufstieg, Ende und Rekord
- Sound-Felder vollständig für das bestehende `sound_system` vorbereitet
- Media-Verknüpfung über `mediaId` oder optional `soundId`
- Overlay-Events weiter über Communication-Bus vorbereitet
- Overlay-Register/Heartbeat aus HT3.1 bleibt erhalten

## Sicherheitsstandard

Alle neuen Event-Sounds und Overlay-Events bleiben standardmäßig deaktiviert.

## Nicht enthalten

- Kein fertiges HypeTrain-Overlay-Design
- Kein Dashboard-UI-Umbau
- Keine direkte Audioausgabe im Overlay
- Keine Änderung an `sound_system` oder Media-System
