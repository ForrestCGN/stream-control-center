# Channelpoints v0.7.5 - EventBus + Docs Final Polish

## Ziel
Lokale Kanalpunkte-Basis abrunden: EventBus-Domain-Events, Versionisierung und Doku sauber festhalten.

## Änderungen
- Backend auf `MODULE_VERSION=0.7.5`, `MODULE_BUILD=eventbus-docs-final-polish`.
- Dashboard auf `UI_VERSION=0.7.5`, `UI_BUILD=eventbus-docs-final-polish`.
- Domain-Events ergänzt:
  - `channelpoints.reward.created|updated|deleted|enabled|disabled`
  - `channelpoints.redemption.created|executed|failed`
  - `channelpoints.twitch.readiness`
- Neue Route: `GET /api/channelpoints/bus-events`.
- Status-/Bus-Payload enthält EventBus-Domain-Event-Stats.
- Doku aktualisiert.

## Sicherheit
- Keine Twitch-Schreibzugriffe.
- Keine DB-Schemaänderung.
- Produktive SQLite-Datenbank wird nicht ersetzt.
