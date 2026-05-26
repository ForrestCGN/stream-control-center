# channelpoints-deep-dive

Stand: 2026-05-26 / STEP494

## Zweck

Das Kanalpunkte-System verwaltet Twitch-Channel-Point-Rewards lokal und wird spaeter Twitch-Custom-Rewards synchronisieren.

## Aktueller Stand

- Backend-Modul: `backend/modules/channelpoints.js`
- Dashboard-Modul:
  - `htdocs/dashboard/modules/channelpoints.js`
  - `htdocs/dashboard/modules/channelpoints.css`
- Panel: `channelpointsModule`
- API-Prefix: `/api/channelpoints`

## Datenbank

Tabellen aus STEP492:

- `channelpoints_categories`
- `channelpoints_rewards`
- `channelpoints_redemptions`

## Dashboard STEP494

Funktionen:

- Status anzeigen
- Kategorien anzeigen
- Rewards anzeigen
- Reward lokal erstellen
- Reward lokal bearbeiten
- Reward lokal aktivieren/deaktivieren
- Media-Auswahl ueber bestehende `MediaField`/`MediaPicker`

## Media-Regel

Kanalpunkte duerfen keine eigene Upload-Struktur erhalten.

Uploads und Auswahl laufen ueber:

- `backend/modules/media.js`
- `htdocs/dashboard/modules/media.js`
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

## Twitch-Regel

STEP494 enthaelt keine Twitch-Schreibaktionen.

Spaeter gilt:

- Lokales `system_enabled` steuert interne Verarbeitung.
- Twitch-Status `is_enabled:false` muss spaeter bei echter Deaktivierung ueber Twitch API gesetzt werden.
