# Alert-System Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/alert_system.js` ist das zentrale Alert-System für Twitch-/Ko-fi-/Tipeee-/Test-Alerts. Es verwaltet Regeln, Assets, Textvarianten, Chat-Blöcke, Display-Profile, Event-Historie, Queue, Sound-/TTS-Kopplung und EventBus-/Overlay-Diagnose.

## Datei

| Punkt | Wert |
|---|---|
| Moduldatei | `backend/modules/alert_system.js` |
| Hauptroute | `/api/alerts/*` |
| Initialisierung | `module.exports.init = function init(ctx)` |
| Doku-Route | `/api/alerts/routes` |

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/alerts/status` |
| `GET` | `/api/alerts/health` |
| `GET` | `/api/alerts/eventbus/status` |
| `GET` | `/api/alerts/eventbus/test` |
| `GET` | `/api/alerts/eventbus/reset` |
| `GET` | `/api/alerts/eventbus/correlation/status` |
| `GET` | `/api/alerts/eventbus/correlation/check` |
| `GET` | `/api/alerts/bus-mirror/status` |
| `GET` | `/api/alerts/bus-mirror/enable` |
| `GET` | `/api/alerts/bus-mirror/disable` |
| `GET` | `/api/alerts/overlay-watchdog/status` |
| `GET` | `/api/alerts/overlay-watchdog/check` |
| `GET` | `/api/alerts/overlay-watchdog/reset` |
| `GET` | `/api/alerts/overlay-watchdog/recover` |
| `GET` | `/api/alerts/queue` |
| `POST` | `/api/alerts/clear` |
| `POST` | `/api/alerts/reload` |
| `POST` | `/api/alerts/enqueue` |
| `POST` | `/api/alerts/test` |
| `GET` | `/api/alerts/text-variants` |
| `POST` | `/api/alerts/text-variants` |
| `PUT` | `/api/alerts/text-variants/:id` |
| `DELETE` | `/api/alerts/text-variants/:id` |
| `GET` | `/api/alerts/chat-blocks` |
| `POST` | `/api/alerts/chat-blocks` |
| `PUT` | `/api/alerts/chat-blocks/:id` |
| `DELETE` | `/api/alerts/chat-blocks/:id` |
| `GET` | `/api/alerts/chat-outbox` |
| `POST` | `/api/alerts/chat-outbox/:id/sent` |
| `POST` | `/api/alerts/chat-outbox/:id/consumed` |
| `POST` | `/api/alerts/chat-outbox/:id/error` |
| `GET` | `/api/alerts/test-presets` |
| `POST` | `/api/alerts/test-presets` |
| `PUT` | `/api/alerts/test-presets/:id` |
| `DELETE` | `/api/alerts/test-presets/:id` |
| `POST` | `/api/alerts/test-presets/:id/play` |
| `GET` | `/api/alerts/display-profiles` |
| `POST` | `/api/alerts/display-profiles` |
| `PUT` | `/api/alerts/display-profiles/:id` |
| `DELETE` | `/api/alerts/display-profiles/:id` |
| `POST` | `/api/alerts/display-profiles/:id/play` |
| `GET` | `/api/alerts/integration-check` |
| `GET` | `/api/alerts/routes` |
| `GET` | `/api/alerts/events` |
| `POST` | `/api/alerts/events/:eventUid/replay` |
| `GET` | `/api/alerts/twitch/follow` |
| `GET` | `/api/alerts/twitch/raid` |
| `GET` | `/api/alerts/twitch/bits` |
| `POST` | `/api/alerts/twitch` |
| `GET` | `/api/alerts/rules` |
| `POST` | `/api/alerts/rules` |
| `PUT` | `/api/alerts/rules/:id` |
| `DELETE` | `/api/alerts/rules/:id` |
| `POST` | `/api/alerts/rules/validate` |
| `GET` | `/api/alerts/assets` |
| `POST` | `/api/alerts/assets/upload` |
| `DELETE` | `/api/alerts/assets/:id` |
| `GET` | `/api/alerts/assets/:id/usage` |
| `POST` | `/api/alerts/assets/scan-durations` |
| `GET` | `/api/alerts/settings` |
| `POST` | `/api/alerts/settings` |
| `GET` | `/api/alerts/config` |
| `POST` | `/api/alerts/config` |

## Hauptfunktionen / interne Bereiche

- Init/Routing: `init`, `buildAlertRoutes`, `ensureRuntime`, `reloadConfig`, `ensureDirs`, `ensureSchema`.
- DB/Seeds: `seedDefaults`, `seedAlertChatBlocks`, `ensureAlertRuleMediaColumns`, `createChatBlocksSchema`, `addColumnIfMissing`.
- Queue/Event: `enqueueAlert`, `processQueue`, `replayAlertEvent`.
- Assets/Regeln: `listAssets`, `registerUploadedAsset`, `deleteAsset`, `assetUsage`, `scanSoundDurations`, `listRules`, `saveRule`, `deleteRule`, `validateRules`.
- Texte/Chat: Textvarianten, Chat-Blöcke, Chat-Outbox sent/consumed/error.
- Display: Display-Profile, Vorschau/Play, Replay.
- Sound/TTS: `prepareAndSendAlertSoundBundle`, `playLiveAlertSound`, `prepareAlertTts`, `dispatchPreparedAlertTts`, `playAlertTtsSound`.
- EventBus/Watchdog: Alert EventBus, Bus-Mirror, Overlay-Watchdog, Korrelation zum Sound-Bus.

## Datenbanktabellen

| Tabelle | Zweck |
|---|---|
| `alert_types` | Alert-Typen pro Quelle |
| `alert_assets` | Sound-/Bild-/Medien-Assets |
| `alert_rules` | Regelwerk nach Quelle, Typ, Wertbereich, Tier, Priorität |
| `alert_events` | Alert-Historie / Replay-Grundlage |
| `alert_settings` | DB-gestützte Einstellungen |
| `alert_text_variants` | variantenfähige Alert-Texte |
| `alert_test_presets` | speicherbare Test-Presets |
| `alert_display_profiles` | visuelle Anzeigeprofile |
| `alert_chat_blocks` | Chat-Textblöcke |
| `alert_chat_outbox` | ausstehende/gesendete Chat-Ausgaben |

## Abhängigkeiten

- `sound_system` für Audio-/Bundle-Ausgabe.
- `tts_system` für Alert-TTS.
- `communication_bus` für Alert-Events/Diagnose.
- Media-/Route-/Security-/DB-Helper.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/health"
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/integration-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/status"
```

## Offene Punkte

- Alert-Dashboard weiter verschlanken und Tabs/Unterbereiche prüfen.
- Asset-/Regel-/Texteditoren UX-seitig vereinheitlichen.
- Sound-/TTS-Kopplung nicht nebenbei umbauen.
