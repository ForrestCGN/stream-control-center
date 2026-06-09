# CURRENT CHAT HANDOFF – LWG-4M.4

## Ziel
Backend-Grundlage für giveaway-gebundene Wheels.

## Ausgangslage
- LWG-4M.1 hat Architektur festgelegt: globales Wheel und giveaway-bound Wheel sind getrennte Kontexte.
- LWG-4M.2 hat Close→Draw-Guard eingeführt.
- LWG-4M.3 hat Close-Chatdispatch über Twitch Presence angebunden.

## Umsetzung in LWG-4M.4
- `MODULE_BUILD = STEP_LWG_4M_4`
- Neue Tabelle `loyalty_giveaway_bound_wheels`.
- Wheel-Giveaway erstellt automatisch ein gebundenes Wheel.
- Name: `<Giveaway-Name> – Glücksrad`.
- `wheel_preset_uid` = globale Vorlage / Quelle.
- `wheel_snapshot_uid` = UID der giveaway-gebundenen Wheel-Konfiguration.
- Details von GET Giveaway enthalten `boundWheel`.
- Neue Routen:
  - `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound`
  - `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound`

## Bewusst offen
Die UI ist noch nicht umgesetzt. Der nächste sinnvolle Step ist Dashboard/Giveaway-Erstellung mit Dropdown oder die weitere strikte Runtime-Trennung in `loyalty_games`, falls wir gebundene Presets als echte `giveaway_linked` Presets in der Preset-Tabelle nutzen wollen.
