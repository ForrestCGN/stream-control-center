# STEP036 - Zentraler Settings-Helper vorbereitet

Stand: 2026-05-04

## Ziel

Ein zentraler Helper fuer dashboardfaehige Modul-Settings wurde vorbereitet.

Grundsatz:

1. Dashboard-bearbeitbare Werte gehoeren primaer in die Datenbank.
2. JSON-Configs bleiben Fallback-/Import-/Technik-Schicht.
3. ENV/Secrets bleiben ausserhalb von DB und Repo.

## Neue Datei

- `backend/modules/helpers/helper_settings.js`

## Verwendete bestehende Helper/Layer

- `backend/core/database.js`
- `backend/modules/helpers/helper_config.js`

`helper_config.js` bleibt fuer Dateien zustaendig:

- Config-Pfade aufloesen
- JSON lesen
- JSON schreiben
- Defaults mergen

`helper_settings.js` bildet die neue Schicht darueber:

- DB-Settings lesen/schreiben
- Defaults in Settings-Tabellen seed'en
- optional JSON-Fallback ueber `helper_config.js`
- Werte typisiert dekodieren

## API im Helper

Exportierte Kernfunktionen:

- `ensureSettingsTable(tableName)`
- `seedDefaults(tableName, defaults)`
- `listSettings(tableName, options)`
- `getSetting(tableName, key, fallback, options)`
- `setSetting(tableName, key, value, options)`
- `deleteSetting(tableName, key)`
- `getSettingWithFallback(tableName, key, fallback, options)`
- `readConfigFallback(configFile, defaults, options)`

Unterstuetzte Werttypen:

- `string`
- `number`
- `boolean`
- `json`

## Warum eigener Helper statt helper_config erweitern?

`helper_config.js` soll nicht heimlich DB- und Datei-Logik vermischen.

Saubere Trennung:

- `helper_config.js` = Datei-/JSON-Config
- `helper_settings.js` = DB-Settings + optional Config-Fallback

Damit bleibt klar, wohin ein Dashboard spaeter schreibt.

## Auswirkungen

Keine bestehende Modul-Funktionalitaet wurde geaendert.

Der Helper ist vorbereitet fuer kuenftige Module:

- VIP
- Sound-System
- Alerts
- Hug
- Messages/Rotator
- Dashboard-/Admin-Settings

## Noch nicht gemacht

- VIP nutzt intern noch eigene Settings-Funktionen aus `vip_sound_overlay.js`.
- Umstellung von VIP auf `helper_settings.js` folgt spaeter kontrolliert in einem eigenen Step.
- Kein Dashboard wurde gebaut.
- Keine bestehende Config-Datei wurde ersetzt.
- Keine SQLite-Datei wurde committed.

## Test

Syntaxcheck:

```powershell
Set-Location "D:\Git\stream-control-center"
node -c ".\backend\modules\helpers\helper_settings.js"
```

Erwartung: keine Ausgabe.
