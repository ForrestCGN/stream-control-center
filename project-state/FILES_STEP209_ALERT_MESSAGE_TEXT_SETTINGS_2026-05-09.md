# FILES – STEP209 Alert Message Text Settings

Stand: 2026-05-09

## Geänderte Dateien

### `htdocs/dashboard/modules/alerts.js`

Rolle:
- Dashboard-Logik für Alert-Designprofile
- neue Nachrichtentext-Settings im Designformular
- Live-Vorschau/Preview-Handling für Message-Settings

Wichtige Settings:
- `messageEnabled`
- `messageScale`
- `messageWidthMode`
- `messageMaxLines`
- `messageWeight`

### `htdocs/dashboard/modules/alerts.css`

Rolle:
- Layout und Optik des Alert-Dashboard-Moduls
- finale STEP209.4-Korrektur für erreichbares, einheitlicheres Designformular
- Nachrichtentext-Felder in normales Grid/Layout integriert

Hinweis:
- Es existieren viele ältere STEP-spezifische CSS-Blöcke.
- Späterer UI-Cleanup sollte alte/doppelte CSS-Blöcke vorsichtig prüfen, aber keine Funktionalität entfernen.

### `htdocs/overlays/_overlay-alerts-v2.html`

Rolle:
- echtes Alert-Overlay
- übernimmt neue Message-Settings aus Display-Profil
- rendert den kleinen Nachrichtentext dynamisch

Wichtig:
- TTS-/Sound-/Queue-Logik nicht verändert.
- Username-Fixes aus STEP208 bleiben erhalten.
