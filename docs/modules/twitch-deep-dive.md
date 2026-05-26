# Twitch-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/twitch.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Zentrale Twitch-/Helix-/OAuth-/EventSub-Schicht. Liefert User-, Stream-, Channel- und EventSub-Daten und koppelt Twitch-Events an Alert-/Loyalty-/Deathcounter-Flows.

## Datei

- `backend/modules/twitch.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/auth/login` |
| `GET` | `/auth/callback` |
| `GET` | `/auth/status` |
| `GET` | `/auth/validate` |
| `GET` | `/twitch/auth/validate` |
| `GET` | `/api/twitch/auth/validate` |
| `GET` | `/twitch/me` |
| `GET` | `/auth/logout` |
| `GET` | `/auth/bot/login` |
| `GET` | `/auth/bot/callback` |
| `GET` | `/auth/bot/status` |
| `GET` | `/auth/bot/logout` |
| `GET` | `/userinfo` |
| `GET` | `/twitch/user` |
| `GET` | `/api/twitch/user` |
| `GET` | `/streaminfo` |
| `GET` | `/twitch/stream` |
| `GET` | `/api/twitch/stream` |
| `GET` | `/channelinfo` |
| `GET` | `/twitch/channel` |
| `GET` | `/api/twitch/channel` |
| `GET` | `/twitch/user-by-id` |
| `GET` | `/api/twitch/user/by-id` |
| `GET` | `/twitch/resolve-user` |
| `GET` | `/api/twitch/user/resolve` |
| `GET` | `/twitch/channel-summary` |
| `GET` | `/api/twitch/channel/summary` |
| `GET` | `/twitch/stream-summary` |
| `GET` | `/api/twitch/stream/summary` |
| `GET` | `/twitch/chat-settings` |
| `GET` | `/api/twitch/chat/settings` |
| `GET` | `/twitch/chatters` |
| `GET` | `/api/twitch/chatters` |
| `GET` | `/twitch/goals` |
| `GET` | `/api/twitch/goals` |
| `GET` | `/twitch/schedule` |
| `GET` | `/api/twitch/schedule` |
| `GET` | `/twitch/polls` |
| `GET` | `/api/twitch/polls` |
| `GET` | `/twitch/predictions` |
| `GET` | `/api/twitch/predictions` |
| `GET` | `/eventsub/cache` |
| `GET` | `/api/twitch/eventsub/cache` |
| `GET` | `/eventsub/cache_all` |
| `GET` | `/api/twitch/eventsub/cache/all` |
| `GET` | `/twitch/eventsub/subscriptions` |
| `GET` | `/api/twitch/eventsub/subscriptions` |
| `GET` | `/api/twitch/eventsub/status` |
| `GET` | `/hypetrain/cache` |
| `GET` | `/twitch/hypetrain` |
| `GET` | `/api/twitch/hypetrain` |
| `GET` | `/api/twitch/hypetrain/cache` |
| `GET` | `/hypetrain/cache_raw` |
| `GET` | `/twitch/hypetrain/raw` |
| `GET` | `/api/twitch/hypetrain/raw` |
| `GET` | `/api/twitch/hypetrain/cache/raw` |
| `GET` | `/api/twitch/alerts/status` |
| `GET` | `/twitch/alerts/status` |
| `POST` | `/api/twitch/alerts/reload` |
| `POST` | `/twitch/alerts/reload` |
| `GET` | `/api/twitch/alerts/audit/recent` |
| `GET` | `/twitch/alerts/audit/recent` |
| `GET` | `/api/twitch/cheermotes/status` |
| `GET` | `/twitch/cheermotes/status` |
| `POST` | `/api/twitch/cheermotes/reload` |
| `POST` | `/twitch/cheermotes/reload` |
| `GET` | `/api/twitch/alerts/settings` |
| `GET` | `/twitch/alerts/settings` |
| `POST` | `/api/twitch/alerts/settings` |
| `POST` | `/twitch/alerts/settings` |
| `GET` | `/api/twitch/alerts/test` |
| `GET` | `/twitch/alerts/test` |
| `GET` | `/api/twitch/alerts/debug/presets` |
| `GET` | `/twitch/alerts/debug/presets` |
| `POST` | `/api/twitch/alerts/debug/eventsub` |
| `POST` | `/twitch/alerts/debug/eventsub` |
| `GET` | `/eventsub/status` |
| `GET` | `/twitch/eventsub/status` |
| `GET` | `/eventsub/reconcile` |
| `GET` | `/twitch/eventsub/reconcile` |
| `GET` | `/api/twitch/eventsub/reconcile` |
| `GET` | `/eventsub/cleanup-disconnected` |
| `GET` | `/twitch/eventsub/cleanup-disconnected` |
| `GET` | `/api/twitch/eventsub/cleanup-disconnected` |
| `GET` | `/eventsub/reconnect` |
| `GET` | `/twitch/eventsub/reconnect` |
| `GET` | `/api/twitch/eventsub/reconnect` |

## Erkannte Hauptfunktionen / interne Bereiche

- `reloadTwitchCheermotePrefixes`
- `exchangeCodeForTokens`
- `exchangeCodeForTokensCustom`
- `refreshTokens`
- `refreshBotTokens`
- `getUserAccessTokenWithRefresh`
- `getBotAccessTokenWithRefresh`
- `getAppAccessToken`
- `getAccessToken`
- `helixGet`
- `helixPost`
- `helixDelete`
- `helixGetEventSubSubscriptions`
- `listEventSubSubscriptions`
- `resolveUserByLoginInternal`
- `createClipForBroadcasterInternal`
- `getClipByIdInternal`
- `validateStoredUserToken`
- `createEventSubSubscription`
- `bootstrapEventSubSubscriptions`
- `syncDeathcounterGameFromChannelUpdate`
- `forwardAlertPayloadToAlertSystem`
- `forwardAlertPayloadToAlertSystemNow`
- `forwardLoyaltyPayloadToLoyaltySystem`
- `resolveUserByLogin`
- `validateStoredUserTokenExport`
- `createClipForBroadcaster`
- `getClipById`
- `init`
- `cacheFileFor`
- `eventCacheFileFor`
- `writeEventCache`
- `readEventCache`
- `ensureDir`
- `mergePlainObject`
- `ensureTwitchAlertSettingsTable`
- `getTwitchAlertSettingsFromDb`
- `saveTwitchAlertSettingsToDb`
- `readTwitchAlertFileFallback`
- `loadTwitchAlertBridgeConfig`
- `updateTwitchAlertBridgeConfig`
- `rememberTwitchAlertBridge`
- `getTwitchEventSubAuditConfig`
- `getTwitchCheermoteConfig`
- `normalizeCheermotePrefixes`
- `extractCheermotePrefixesFromHelix`
- `getCurrentTwitchCheermotePrefixes`
- `buildTwitchCheermoteStatus`
- `safeJsonClone`
- `eventSubMessageText`
- `summarizeTwitchEventSubEvent`
- `summarizeTwitchAlertPayloadForAudit`
- `summarizeTwitchAlertDecisionForAudit`
- `createTwitchEventSubAuditRecord`
- `appendTwitchEventSubAudit`
- `readRecentTwitchEventSubAudit`
- `getTwitchSubMessageBufferConfig`
- `normalizeAlertBridgeLogin`
- `alertPayloadEventId`
- `cleanupSubMessageBufferMaps`
- `clearPendingSubscribeAlert`
- `isBufferableSubscribeAlert`
- `isSubscriptionMessageAlert`
- `readJSON`
- `writeJSON`
- `getStoredUserToken`
- `getStoredBotToken`
- `helixHeaders`
- `normalizeEventSubSubscriptionRow`
- `buildEventSubSubscriptionSummary`

## Erkannte Datenbanktabellen

- `alert_settings`

## Wichtige Abhängigkeiten

- `helper_routes`
- `helper_config/helper_core implizit über ctx/core`
- `Twitch Helix API`
- `EventSub WebSocket`
- `Alert-System via /api/alerts/twitch`
- `Loyalty ingest`
- `Deathcounter game ingest`
- `Token-Dateien unter secrets/tokens`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Sehr großes Modul mit vielen Verantwortlichkeiten: OAuth, Helix, EventSub, Alert-Bridge, Cheermotes, Caches. Änderungen nur kleinteilig.`
- `Legacy-Routen wie /userinfo, /streaminfo, /channelinfo sind produktiv wichtig und dürfen nicht entfernt werden.`
- `Token/Secrets niemals dokumentieren oder committen.`

## Sinnvolle Tests

- `GET /api/twitch/auth/validate`
- `GET /api/twitch/user?login=forrestcgn`
- `GET /api/twitch/stream?login=forrestcgn`
- `GET /api/twitch/eventsub/status`
- `GET /api/twitch/alerts/status`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
