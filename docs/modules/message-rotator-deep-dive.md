# Message-Rotator - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/message_rotator.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Automatische/Manuelle Chat-Hinweise mit Live-Gate, Cooldowns, Gewichtung, Textdateien/DB-Settings und optional direkter Twitch-Ausgabe.

## Datei

- `backend/modules/message_rotator.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/message-rotator/status` |
| `GET` | `/api/message-rotator/status` |
| `GET` | `/message-rotator/admin/settings` |
| `GET` | `/api/message-rotator/admin/settings` |
| `POST` | `/message-rotator/admin/settings` |
| `POST` | `/api/message-rotator/admin/settings` |
| `GET` | `/message-rotator/admin/texts` |
| `GET` | `/api/message-rotator/admin/texts` |
| `POST` | `/message-rotator/admin/texts` |
| `POST` | `/api/message-rotator/admin/texts` |
| `GET` | `/message-rotator/integration-check` |
| `GET` | `/api/message-rotator/integration-check` |
| `GET` | `/message-rotator/reload` |
| `GET` | `/api/message-rotator/reload` |
| `POST` | `/message-rotator/reload` |
| `POST` | `/api/message-rotator/reload` |
| `GET` | `/message-rotator/start` |
| `GET` | `/api/message-rotator/start` |
| `POST` | `/message-rotator/start` |
| `POST` | `/api/message-rotator/start` |
| `GET` | `/message-rotator/stop` |
| `GET` | `/api/message-rotator/stop` |
| `POST` | `/message-rotator/stop` |
| `POST` | `/api/message-rotator/stop` |
| `GET` | `/message-rotator/tick` |
| `GET` | `/api/message-rotator/tick` |
| `POST` | `/message-rotator/tick` |
| `POST` | `/api/message-rotator/tick` |
| `GET` | `/message-rotator/next` |
| `GET` | `/api/message-rotator/next` |
| `POST` | `/message-rotator/next` |
| `POST` | `/api/message-rotator/next` |
| `GET` | `/message-rotator/manual` |
| `GET` | `/api/message-rotator/manual` |
| `POST` | `/message-rotator/manual` |
| `POST` | `/api/message-rotator/manual` |
| `GET` | `/message-rotator/live-status` |
| `GET` | `/api/message-rotator/live-status` |
| `POST` | `/message-rotator/live-status` |
| `POST` | `/api/message-rotator/live-status` |
| `GET` | `/message-rotator/config` |
| `GET` | `/api/message-rotator/config` |
| `GET` | `/message-rotator/settings` |
| `GET` | `/api/message-rotator/settings` |
| `GET` | `/message-rotator/routes` |
| `GET` | `/api/message-rotator/routes` |

## Erkannte Hauptfunktionen / interne Bereiche

- `getBotAccessTokenForOutput`
- `resolveBotIdentity`
- `sendTwitchChatMessageDirect`
- `sendTwitchAnnouncementDirect`
- `deliverRotatorMessage`
- `checkLiveStatus`
- `nextMessage`
- `manualMessage`
- `getConfigPath`
- `clone`
- `toBool`
- `toPositiveNumber`
- `cleanId`
- `cleanLower`
- `cleanStringList`
- `normalizeOutputMode`
- `normalizeItemOutputMode`
- `normalizeAnnouncementColor`
- `normalizeItemAnnouncementColor`
- `normalizeDeliveryMode`
- `cleanTwitchId`
- `getEnvValue`
- `getEffectiveOutputOptions`
- `buildStreamerbotOutputFields`
- `httpsRequestJson`
- `getTwitchModuleSafe`
- `twitchClientIdForOutput`
- `twitchHeaders`
- `mergeConfig`
- `deepMerge`
- `flattenSettingsObject`
- `setNestedValue`
- `applyDbSettings`
- `getAdminPayload`
- `listAdminSettings`
- `setAdminSettings`
- `textEditorOptions`
- `listAdminTexts`
- `setAdminTexts`
- `ensureConfigFile`
- `loadConfig`
- `getConfig`
- `msFromMinutes`
- `ageSeconds`
- `publicState`
- `resetRuntimeCounters`
- `startRotator`
- `stopRotator`
- `isBotName`
- `getTickUser`
- `tick`
- `itemRuntime`
- `getDueItems`
- `chooseWeighted`
- `block`
- `buildContext`
- `applyMaxLength`
- `buildDbTextResult`
- `buildRotatorChatResult`
- `updateLiveStatusCache`
- `getCachedLiveStatus`
- `fetchJsonUrl`
- `evaluateOnlineStatus`
- `manualRuntime`
- `normalizeCommand`
- `findManualItem`
- `fileCheck`
- `safeCall`
- `getMessagesDir`
- `resolveMessageFilePath`

## Erkannte Datenbanktabellen

- Keine direkt erkannt.

## Wichtige Abhängigkeiten

- `Twitch-Modul für Chat-Ausgabe/Bot-Token`
- `Stream-/Live-Status-Quelle`
- `config/message_rotator.json`
- `config/messages/*.json`
- `DB-Settings/Textmuster`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Start/next/manual können echte Chat-Nachrichten senden.`
- `Live-Gate und Cooldowns dürfen nicht nebenbei gebrochen werden.`
- `Texte sollen variantenfähig/dashboardfähig bleiben.`

## Sinnvolle Tests

- `GET /api/message-rotator/status`
- `GET /api/message-rotator/live-status`
- `GET /api/message-rotator/config`
- `GET /api/message-rotator/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
