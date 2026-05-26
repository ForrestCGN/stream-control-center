# STEP494_CHANNELPOINTS_DASHBOARD_BASE

Stand: 2026-05-26

## Ziel

Erste Dashboard-Basis fuer das Kanalpunkte-System.

## Enthalten

- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`
- `htdocs/dashboard/index.html` erweitert:
  - CSS geladen
  - Panel `channelpointsModule`
  - Script geladen
- Dashboard-Modul registriert sich selbst bei `window.CGN.modules`.
- Community-Navigation/Favoriten werden zur Laufzeit um `channelpoints` erweitert.
- Kategorien/Rewards werden ueber vorhandene APIs geladen.
- Lokales Erstellen/Bearbeiten/Aktivieren/Deaktivieren von Rewards.
- Media-Feld nutzt `MediaField`/`MediaPicker` und die bestehende Medienverwaltung.

## Nicht enthalten

- Keine Twitch-Schreibaktionen.
- Keine Twitch Reward-Erstellung.
- Keine Twitch Reward-Deaktivierung.
- Keine neue Upload-Logik.
- Keine DB-Schema-Aenderung.
