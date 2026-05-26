# CURRENT_STATUS

Stand: 2026-05-26 / STEP494_CHANNELPOINTS_DASHBOARD_BASE

## Aktueller Arbeitsstand

STEP494 ergaenzt die erste Dashboard-Basis fuer das Kanalpunkte-System.

## Kanalpunkte

- Backend-Stand aus STEP493 bleibt Grundlage: `channelpoints.js` Version `0.5.0`.
- Dashboard-Dateien:
  - `htdocs/dashboard/modules/channelpoints.js`
  - `htdocs/dashboard/modules/channelpoints.css`
- `htdocs/dashboard/index.html` laedt das neue Dashboard-Modul.
- Das Dashboard-Modul registriert sich selbst in `window.CGN.modules`, `moduleCatalog`, Community-Items und Favorites.
- Kategorien und Rewards werden aus den vorhandenen API-Routen gelesen.
- Lokale Reward-CRUD-Bedienung ist vorbereitet:
  - erstellen
  - bearbeiten
  - lokal aktivieren
  - lokal deaktivieren
- Medienauswahl nutzt das bestehende Media-System (`MediaField`/`MediaPicker`).

## Sicherheitsrahmen

- Keine Twitch-Schreibaktionen.
- Keine neue Upload-Struktur.
- Keine DB-Migration in STEP494.
