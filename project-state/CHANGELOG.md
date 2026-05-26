# CHANGELOG

## 2026-05-26 - STEP491_CHANNELPOINTS_DB_SCHEMA_PREP

- `channelpoints.js` auf Version `0.3.0` erhoeht.
- Modus auf `backend_schema_prep` gesetzt.
- Neue Route `GET /api/channelpoints/schema-preview` ergaenzt.
- Schema-Preview fuer geplante Tabellen, Felder, Indexe und Default-Kategorie-Seeds ergaenzt.
- Safety-Regeln sichtbar gemacht: keine DB-Schreiboperationen in STEP491, keine Twitch-Schreibaktionen, produktive SQLite niemals ersetzen.
- Bus-Capability `channelpoints.schema` ergaenzt.
- Doku fuer Kanalpunkte aktualisiert.

## 2026-05-26 - STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

- `channelpoints.js` auf Version `0.2.0` erhoeht.
- Datenmodell und Media-Plan als lesende Routen ergaenzt.
- Media-Regel festgelegt: vorhandenes `media.js` und bestehende Dashboard-Media-Picker/Upload-Maske nutzen.
- Keine DB-Migration und keine Twitch-Schreibaktionen.

## 2026-05-26 - STEP489_CHANNELPOINTS_BACKEND_SKELETON

- Neues Modul `backend/modules/channelpoints.js` erstellt.
- Version `0.1.0`.
- Statusroute und Bus-Selftest ergaenzt.
- Modul registriert sich am Communication Bus.
