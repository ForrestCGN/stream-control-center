# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP490

## Stream-Control-Center

Aktueller Schwerpunkt: Kanalpunkte-System als neues Fachmodul auf Basis des Communication Bus.

## Kanalpunkte-System

STEP490 erweitert `backend/modules/channelpoints.js`:

- Version `0.2.0`.
- Statusmodus `backend_model_plan`.
- Neue Route `GET /api/channelpoints/model`.
- Neue Route `GET /api/channelpoints/media-plan`.
- Weiterhin Bus-Registrierung, Heartbeat und Status-Publish.
- Keine Datenbankmigration.
- Keine Twitch-Schreibaktionen.
- Keine produktive Redemption-Verarbeitung.

## Media-Regel

Kanalpunkte dürfen kein eigenes Upload-System bauen.

Verwendet werden soll:

- `backend/modules/media.js`
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

Reward-Media-Verknüpfung soll später über `media_asset_id`, `media_role` und `action_payload_json` erfolgen.

## Communication Bus

STEP488 bleibt Grundlage:

- `helper_communication.js` Version `0.4.0`.
- Modul-zu-Modul-Contract direkt im bestehenden Bus-Core.
- Kanalpunkte nutzt `registerModule`, `heartbeatModule`, `publishModuleStatus` und `subscribe`.

## Wichtig

Falls noch vorhanden, entfernen:

```text
backend/modules/helpers/helper_communication_contract.js
```

Diese Datei war nur ein verworfener STEP487-Zwischenstand.

## Nächster sinnvoller Schritt

`STEP491_CHANNELPOINTS_DB_MIGRATION_PREP`

Ziel: DB-Migration für Kategorien, Rewards und Redemptions vorbereiten, aber vor produktivem Einbau noch einmal prüfen/freigeben.
