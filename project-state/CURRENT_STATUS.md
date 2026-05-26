# CURRENT_STATUS

Stand: 2026-05-26 / STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

## Aktueller Arbeitsstand

STEP490 erweitert das Kanalpunkte-System aus STEP489 um einen lesbaren Backend-Modellplan und eine verbindliche Media-Integrationsplanung.

## Kanalpunkte-System

- `backend/modules/channelpoints.js` steht jetzt auf Version `0.2.0`.
- Neue Routen:
  - `GET /api/channelpoints/status`
  - `GET /api/channelpoints/model`
  - `GET /api/channelpoints/media-plan`
  - `GET /api/channelpoints/bus-test`
- Statusmodus: `backend_model_plan`.
- Noch keine Datenbankmigration.
- Noch keine Twitch-Schreibaktionen.
- Noch keine Reward-Synchronisierung.
- Noch keine produktive Redemption-Verarbeitung.
- Noch kein Dashboard-Umbau.

## Media-Regel

Uploads und Medienauswahl für Kanalpunkte laufen über das bestehende Medien-System:

- `backend/modules/media.js`
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

Es soll keine zweite Upload-Maske und keine eigene Asset-Verwaltung im Kanalpunkte-Modul entstehen.

## Communication Bus

Das Kanalpunkte-Modul bleibt am integrierten Communication Bus registriert und erweitert seine Capabilities um:

- `channelpoints.model`
- `channelpoints.media`

## Hinweis aus Runtime-Test STEP489

STEP489 lief live korrekt:

- `channelpoints.js` wurde geladen.
- `/api/channelpoints/status` war `ok=True`.
- `/api/channelpoints/bus-test` lieferte `subscriberDeliveredCount=1`.

## Nächster sinnvoller Schritt

`STEP491_CHANNELPOINTS_DB_MIGRATION_PREP`

Ziel: DB-Schema für Kategorien/Rewards/Redemptions als Migration vorbereiten, aber vor produktivem Einbau noch einmal prüfen/freigeben.
