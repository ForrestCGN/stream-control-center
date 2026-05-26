# Channelpoints Redemption AutoExecute Mode Control

Stand: STEP501

## Versionen

- Backend `channelpoints.js`: `0.8.5`
- Backend Build: `redemption-auto-execute-mode-control`
- Dashboard UI: `0.9.2`
- Dashboard Build: `redemption-auto-execute-mode-control`

## Ziel

STEP501 macht den AutoExecute-Ablauf steuerbar, ohne Twitch-Schreibzugriffe zu aktivieren.

Unterstützte Modi:

- `off`: Redemption wird nur lokal gespeichert, keine Shadow-/Live-Ausführung.
- `shadow`: Redemption wird geprüft, ob sie ausführbar wäre, aber nicht automatisch ausgeführt.
- `live`: Nur gemappte, lokal aktive und ausführbare Rewards werden automatisch über die bestehende lokale Ausführungslogik ausgeführt.

## Neue / erweiterte Routen

- `GET /api/channelpoints/eventsub/redemption/status`
- `GET /api/channelpoints/eventsub/redemption/mode`
- `POST /api/channelpoints/eventsub/redemption/mode`
- `POST /api/channelpoints/eventsub/redemption/preview`
- `POST /api/channelpoints/eventsub/redemption`

## Sicherheit

- Kein Twitch-Write.
- Kein Fulfill/Cancel an Twitch.
- Keine DB-Migration.
- Datenbankzugriff weiterhin über `../core/database`.
- Live führt nur aus, wenn der Reward lokal gemappt, aktiv, nicht pausiert und ausführbar ist.
- Importierte Rewards ohne Aktion bleiben durch den bestehenden API-Guard gesperrt.

## EventBus

Neue vorbereitete Events:

- `channelpoints.redemption.auto_execute_mode_changed`
- `channelpoints.redemption.auto_executed`
- `channelpoints.redemption.auto_execute_failed`

Bestehende Events bleiben erhalten:

- `channelpoints.redemption.received`
- `channelpoints.redemption.shadow_checked`

## Hinweis

Der Modus wird in STEP501 als Runtime-Override gesetzt. Persistente Dashboard-/DB-Konfiguration kann später ergänzt werden, wenn der Live-Test stabil ist.
