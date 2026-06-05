# FILES – CAN-44 Shoutout-System

## Zuletzt betroffene Dateien

### Backend

- `backend/modules/clip_shoutout.js`
  - Modulversion zuletzt im aktuellen Shoutout-Overlay-Set-Stand: `0.2.42`.
  - enthält Shoutout-Backend, Direct-Intake, DisplayQueue, OfficialQueue, AutoShoutout, Settings-API, Textintegration und `overlaySets`.
  - neue/aktuelle API für Overlay-Textpaare:
    - `GET /api/clip-shoutout/overlay-sets`
    - `POST /api/clip-shoutout/overlay-sets`

### Overlay

- `htdocs/overlays/sound_system_overlay.html`
  - bestehendes Sound-System-Overlay.
  - enthält die H15/CAN44.24f Shoutout-Darstellung.
  - wichtig: nicht durch `_overlay-clip_player.html` ersetzen.
  - Sound-/Bundle-/Audio-Finish-Logik nicht ohne konkreten Auftrag ändern.

### Dashboard

- `htdocs/dashboard/index.html`
  - altes Shoutout-Dashboard wurde aus der aktiven Einbindung entfernt.
  - `shoutout_v2.js/css` ist produktiv als Shoutout-Dashboard aktiv.

- `htdocs/dashboard/modules/shoutout_v2.js`
  - produktives Shoutout-Dashboard.
  - Settings editierbar.
  - Tooltips/Hilfen.
  - AutoShoutout-Instant-Trigger-Settings.
  - CAN-44.30/31: Spezialeditor für `shoutout.overlay.sets` im bestehenden Texte-Tab.
  - `shoutout.overlay.sets` wird für Kategorie `shoutout.overlay` sichtbar gemacht und zeigt Set-Zeilen statt normalem Varianteneditor.

- `htdocs/dashboard/modules/shoutout_v2.css`
  - Styles für Shoutout-Dashboard, Settings-Layout und Help-Tooltips.
  - CAN-44.31: kompakter Overlay-Set-Editor ohne Vorschau-Zeile, `Set löschen` oben rechts.

## Bewusst nicht mehr aktiv im Dashboard

- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/shoutout.css`

Diese Dateien können noch im Projekt existieren, werden aber durch den aktuellen `index.html`-Stand nicht mehr geladen.

## Wichtige APIs

- `GET /api/clip-shoutout/status`
- `GET /api/clip-shoutout/settings`
- `POST /api/clip-shoutout/settings`
- `POST /api/clip-shoutout/run`
- `GET /api/clip-shoutout/queue`
- `POST /api/clip-shoutout/display-queue/retry`
- `POST /api/clip-shoutout/display-queue/remove`
- `POST /api/clip-shoutout/queue/retry`
- `POST /api/clip-shoutout/queue/remove`
- `GET /api/clip-shoutout/official/auth-status`
- `GET/POST /api/clip-shoutout/auto/settings`
- `GET /api/clip-shoutout/overlay-sets`
- `POST /api/clip-shoutout/overlay-sets`

## Datenquellen

- Chatcommands über `command_definitions`.
- Shoutout-Modulconfig über bestehende Config-/Settings-API.
- Overlay-Set-Texte über Shoutout-Modulconfig/API, nicht direkt über produktive SQLite-Datei.
- Produktive SQLite-Datenbank nicht als Datei austauschen.
