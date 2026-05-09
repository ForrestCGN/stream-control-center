# Changelog

## 2026-05-09

### STEP203 - Loyalty Core DB + Basis-API Shadow Mode

- Erstes technisches Loyalty-Core-Modul ergänzt:
  - `backend/modules/loyalty.js`
- Seed/Fallback-Konfig ergänzt:
  - `config/loyalty.json`
- DB-first umgesetzt:
  - Settings über `helper_settings.js`
  - Config über `helper_config.js`
  - Texte über `helper_texts.js`
  - DB über `backend/core/database.js`
  - Responses/Routes über `helper_core.js`
- Neue DB-Strukturen per sanfter Migration:
  - `loyalty_users`
  - `loyalty_transactions`
  - `loyalty_reservations`
  - `loyalty_imports`
  - `loyalty_ignored_users`
  - `loyalty_settings`
- Basis-Routen ergänzt:
  - `/api/loyalty/status`
  - `/api/loyalty/config`
  - `/api/loyalty/settings`
  - `/api/loyalty/users`
  - `/api/loyalty/balance/:login`
  - `/api/loyalty/transactions`
  - `/api/loyalty/test/watch`
  - `/api/loyalty/ignored-users`
  - `/api/loyalty/routes`
- Shadow Mode als Startmodus gesetzt.
- StreamElements bleibt aktiv.
- Kein StreamElements-Import.
- Kein Dashboard-Modul in diesem STEP.

### STEP202.2 - Loyalty Shadow Mode & Configurable Bonus Rules

- Startstrategie für Loyalty geändert:
  - neues System läuft zuerst im Shadow Mode parallel zu StreamElements.
  - StreamElements bleibt aktiv.
  - User-Punkte-Import kommt später.

### STEP202.1 - Loyalty DB-First Standard

- Verbindliche Datenhaltungsregel für Loyalty dokumentiert:
  - DB ist Hauptspeicher.
  - JSON ist nur Seed/Fallback/technische Boot-Konfig.

### STEP202 - Loyalty / Kekskrümel Capture & Migration Prep

- Start des Loyalty-/Kekskrümel-Blocks als Doku-/Erfassungs-STEP vorbereitet.

## 2026-05-08

### STEP200.1 - TTS Documentation Sync

- Zentrale Projekt-Dokus nach STEP200 synchronisiert.
